# cordyceps
Cordyceps is a custom library of Discord.js utilities for v14 (dev version).

### Rate Limiter
A simple rate limiter for your interactions, useful to control command spam before Discord decides to add a native feature for server owners to add command cooldowns!

Initialise the rate limiter like so...
```typescript
const rateLimit = new RateLimiter(5000); // Creates a new rate limit of 5000ms (5 seconds)
```

Then use the `shouldLimit` function inside your command handler!
```typescript
async execute(interaction) {
    if (shouldLimit(interaction.user.id)) return interaction.reply("You are rate limited!");
}
```

### Carousel
A simple carousel factory for Discord embeds! Supports custom buttons, page numbering, and a callback function.

```typescript
import { ButtonBuilder, EmbedBuilder } from "@discordjs/builders";

const firstEmbed = new EmbedBuilder().setTitle("First");
const secondEmbed = new EmbedBuilder().setTitle("Second");
const thirdEmbed = new EmbedBuilder().setTitle("Third");
const fallbackEmbed = new EmbedBuilder().setTitle("Fallback");

const prevButton = new ButtonBuilder().setCustomId("prev").setLabel("Previous");
const closeButton = new ButtonBuilder().setCustomId("close").setLabel("Close");
const nextButton = new ButtonBuilder().setCustomId("next").setLabel("Next");

const carousel = new Carousel({
    pages: [firstEmbed, secondEmbed, thirdEmbed],
    fallback: fallbackEmbed,
    prev: { button: prevButton, customId: "prev" },
    close: { button: closeButton, customId: "close" }, // Optional
    next: { button: nextButton, customId: "next" },
})

await carousel.send(interaction);
```

The carousel can be sent with the option to display page counts, timeout, or trigger a callback after the timeout.

```typescript
const callback = function() {
    console.log("callback!")
}

await carousel.send(interaction, {
    displayPageCount: true, // Optional, displays an updated page count on each page change
    timeout: 5000 // Optional, stops listening for button clicks after 5000ms (5 seconds)
}, callback) // Optional, triggers callback function after timeout
```
