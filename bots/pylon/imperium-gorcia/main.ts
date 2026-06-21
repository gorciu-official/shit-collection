// gif generator

var lastMessage: Date | null = null;

async function getGIF(searchTerm: string): Promise<string> {
  const apiKey = 'nuh uh u aint gettin my api keys';
  const url = `https://tenor.googleapis.com/v2/search?q=${searchTerm}&key=${apiKey}&limit=1&random=true&media_filter=minimal`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    if (json.results && json.results.length > 0) {
      return json.results[0].media_formats.gif.url;
    } else {
      return 'Nie znaleziono!';
    }
  } catch (error) {
    console.error('Błąd podczas pobierania GIFa:', error);
    return 'Wystąpił błąd!';
  }
}

// ai
discord.on('MESSAGE_CREATE', async (message) => {
  if (message.channelId == '1279578821338595511') {
    const dc = await discord.getGuildTextChannel('1267200223256645712');
    if (!dc) return;
    dc.sendMessage(message.content.toLowerCase());
  }

  if (message.author.bot || !message.member) {
    return;
  }

  const content = message.content.toLowerCase().trim();

  if (
    content.includes('siema') ||
    content.includes('hej') ||
    content.includes('witam')
  ) {
    return message.inlineReply('siema');
  }

  if (content.includes('auror')) {
    return message.inlineReply('https://discord.gg/bq6Rj3fJ6c');
  }

  if (content.includes('arch')) {
    return message.inlineReply(
      'https://tenor.com/view/arch-linux-i-use-arch-lonely-gif-26341678'
    );
  }

  if (
    content.includes('nie mogę') ||
    content.includes('nie moge') ||
    content.includes('nie umiem')
  ) {
    return message.inlineReply(
      'https://tenor.com/view/spongebob-skill-issue-skill-gif-24485644'
    );
  }

  if (
    content.includes('walić windowsa') ||
    content.includes('walic windowsa') ||
    content.includes('linux better') ||
    content.includes('windows issue')
  ) {
    message.inlineReply(
      'https://tenor.com/view/get-real-cat-dancing-dancing-cat-gif-12069584725748006088'
    );
  }

  if (
    content.includes('<@990959984005222410>') ||
    content.includes('<@!990959984005222410>')
  ) {
    return message.inlineReply('po c\\*\\*ja pingujesz');
  }

  if (content.includes('kot')) {
    return message.inlineReply(getGIF('cat'));
  }
  if (content.includes('pies')) {
    return message.inlineReply(getGIF('dog'));
  }
  if (content.includes('papuga')) {
    return message.inlineReply(getGIF('parrot'));
  }
  if (content.includes('słoń')) {
    return message.inlineReply(getGIF('słoń'));
  }
});

// starboard
discord.on('MESSAGE_REACTION_ADD', async (wtfmessage) => {
  const emoji = wtfmessage.emoji.name;
  const channel = await discord.getGuildTextChannel(wtfmessage.channelId);
  if (emoji !== '⭐' || !channel) return;
  const message = await channel.getMessage(wtfmessage.messageId);
  if (!message) return;
  message.reactions.forEach(async (value) => {
    if (value.count !== 3 || value.emoji.name !== '⭐') return;
    const hot = await discord.getGuildTextChannel('1279586402677297225');
    if (!hot) return;
    hot.sendMessage(
      `⭐ **3 gwiazdki osiągnięte:** https://canary.discord.com/channels/${wtfmessage.guildId}/${wtfmessage.channelId}/${wtfmessage.messageId}`
    );
  });
});

pylon.tasks.cron('something-lmao', '0 0/10 * * * * *', async () => {
  if (!lastMessage) {
    lastMessage = new Date(Date.now() + 6 * 60 * 60 * 1000);
  }

  const actualDate = new Date();
  if (actualDate >= lastMessage) {
  }
});

pylon.tasks.cron('pingme', '0 0 6 * * * *', () => {});
