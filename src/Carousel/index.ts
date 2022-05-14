import {
  ActionRowBuilder,
  ButtonBuilder,
  CommandInteraction,
  EmbedBuilder,
  MessageComponentInteraction,
} from "discord.js";

type ButtonOptions = {
  customId: string;
  button: ButtonBuilder;
};

type CarouselOptions = {
  pages: EmbedBuilder[];
  fallback: EmbedBuilder;
  prev: ButtonOptions;
  next: ButtonOptions;
  close?: ButtonOptions;
};

type CarouselSendOptions = {
  displayPageCount: boolean;
  timeout?: number;
};

type EndCallbackFunction = (...args: any[]) => any;

export default class Carousel {
  private readonly pages: EmbedBuilder[];

  private readonly fallback: EmbedBuilder;

  private readonly prevBtn: ButtonBuilder;

  private readonly closeBtn: ButtonBuilder | undefined;

  private readonly nextBtn: ButtonBuilder;

  private readonly customIds: string[];

  public constructor(options: CarouselOptions) {
    this.pages = options.pages;
    this.fallback = options.fallback;
    this.prevBtn = options.prev.button;
    this.closeBtn = options.close?.button;
    this.nextBtn = options.next.button;
    this.customIds = options.close
      ? [options.prev.customId, options.close.customId, options.next.customId]
      : [options.prev.customId, options.next.customId];
  }

  public async send(
    interaction: CommandInteraction,
    options?: CarouselSendOptions,
    callbackFn?: EndCallbackFunction
  ) {
    if (!interaction.deferred) await interaction.deferReply();

    let page = 0;
    const prevId = this.customIds[0];
    const closeId = this.customIds.length === 3 ? this.customIds[1] : null;
    const nextId =
      this.customIds.length === 3 ? this.customIds[2] : this.customIds[1];

    const firstEmbed = options?.displayPageCount
      ? this.pages[page]?.setFooter({
          text: `Page ${page + 1} / ${this.pages.length}`,
        })
      : this.pages[page];

    if (!interaction.inCachedGuild()) return;

    const m = await interaction.editReply({
      embeds: [firstEmbed ?? this.fallback],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          this.closeBtn
            ? [this.prevBtn.setDisabled(true), this.closeBtn, this.nextBtn]
            : [this.prevBtn.setDisabled(true), this.nextBtn]
        ),
      ],
    });

    function filter(i: MessageComponentInteraction) {
      return (
        (i.customId === prevId ||
          i.customId === closeId ||
          i.customId === nextId) &&
        i.user.id === interaction.user.id
      );
    }
    const collector = m.createMessageComponentCollector({
      filter,
      time: options?.timeout ?? 0,
    });

    collector.on("collect", async (i) => {
      await i.deferUpdate();
      switch (i.customId) {
        case prevId:
          page -= 1;
          break;
        case nextId:
          page += 1;
          break;
        case closeId:
          await i.editReply({ components: [] });
          collector.stop();
          return;
        default:
          break;
      }

      if (page < 0) page = 0;
      if (page >= this.pages.length) page = this.pages.length - 1;

      const currentEmbed = options?.displayPageCount
        ? this.pages[page]?.setFooter({
            text: `Page ${page + 1} / ${this.pages.length}`,
          })
        : this.pages[page];
      const prevBtn =
        page === 0
          ? this.prevBtn.setDisabled(true)
          : this.prevBtn.setDisabled(false);
      const nextBtn =
        page === this.pages.length - 1
          ? this.nextBtn.setDisabled(true)
          : this.nextBtn.setDisabled(false);

      await i.editReply({
        embeds: [currentEmbed ?? this.fallback],
        components:
          this.pages.length === 0
            ? []
            : [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                  this.closeBtn
                    ? [prevBtn, this.closeBtn, nextBtn]
                    : [prevBtn, nextBtn]
                ),
              ],
      });

      collector.resetTimer();
    });

    collector.on("end", async () => {
      await interaction.editReply({ components: [] });
      if (callbackFn) await callbackFn();
    });
  }
}
