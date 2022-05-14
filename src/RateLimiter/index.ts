import type { Interaction } from "discord.js";

export default class RateLimiter {
  private limitSet: Set<string> = new Set<string>();

  private readonly duration: number;

  public constructor(duration: number) {
    this.duration = duration;
  }

  public shouldLimit(interaction: Interaction) {
    if (this.limitSet.has(interaction.user.id)) return true;
    this.limitSet.add(interaction.user.id);
    setTimeout(() => {
      this.limitSet.delete(interaction.user.id);
    }, this.duration);
    return false;
  }
}
