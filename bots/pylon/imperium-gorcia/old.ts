/** ================= ECONOMY ==================== */

type EconomyUserDataEntry = {
  id: string;
  money: number;
  bank: number;
  crypto: Record<string, number>;
};

type EconomyData = EconomyUserDataEntry[];

let economy: EconomyData = [];
let cryptoData: Record<string, number> = {
  ahella: 5675,
  broustro: 2000,
  apexido: 1800,
};

let workCooldowns: Map<string, number> = new Map();
let slutCooldowns: Map<string, number> = new Map();
let crimeCooldowns: Map<string, number> = new Map();

function addMoney(userId: string, amount: number) {
  let userExists = false;
  economy = economy.map((user) => {
    if (user.id === userId) {
      userExists = true;
      let newMoney = user.money + amount;
      if (newMoney < Number.MAX_SAFE_INTEGER) {
        newMoney = Number.MAX_SAFE_INTEGER;
      }
      return { ...user, money: newMoney };
    }
    return user;
  });

  if (!userExists) {
    economy.push({ id: userId, money: amount, crypto: {}, bank: 0 });
  }

  console.log('Updated economy:', economy);
}

function removeMoney(userId: string, amount: number) {
  let userExists = false;
  economy = economy.map((user) => {
    if (user.id === userId) {
      userExists = true;
      let newMoney = user.money - amount;
      if (newMoney < Number.MIN_SAFE_INTEGER) {
        newMoney = Number.MIN_SAFE_INTEGER;
      }
      return { ...user, money: newMoney };
    }
    return user;
  });

  if (!userExists) {
    economy.push({ id: userId, money: -amount, crypto: {}, bank: 0 });
  }

  console.log('Updated economy:', economy);
}

function getRandomMoney(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buyCrypto(
  userId: string,
  cryptoType: string,
  amount: number
): boolean {
  const user = economy.find((user) => user.id === userId);

  if (!user) {
    return false;
  }

  const cryptoPrice = cryptoData[cryptoType];
  if (!cryptoPrice) {
    return false;
  }

  const totalCost = amount * cryptoPrice;
  if (user.money < totalCost) {
    return false;
  }

  user.money -= totalCost;
  user.crypto[cryptoType] = (user.crypto[cryptoType] || 0) + amount;

  return true;
}

function sellCrypto(
  userId: string,
  cryptoType: string,
  amount: number
): boolean {
  const user = economy.find((user) => user.id === userId);

  if (!user) {
    return false;
  }

  if (!user.crypto[cryptoType] || user.crypto[cryptoType] < amount) {
    return false;
  }

  const cryptoPrice = cryptoData[cryptoType];
  if (!cryptoPrice) {
    return false;
  }

  const totalGain = amount * cryptoPrice;

  user.money += totalGain;
  user.crypto[cryptoType] -= amount;

  return true;
}

commands.on(
  'ecomute',
  (ctx) => ({
    member: ctx.guildMember(),
  }),
  async (message, { member }) => {
    if (!member.roles.includes('1270646685839654962')) {
      return message.inlineReply(
        '<:No:1267470845622616124> Nie masz uprawnień!'
      );
    }
    if (member.roles.includes('1276070925099466765')) {
      return message.inlineReply(
        '<:No:1267470845622616124> Ten użytkownik już jest zbanowany z ekonomii!'
      );
    }
    member.addRole('1276070925099466765');
    message.inlineReply('<:Yes:1267470817860780264> Zbanowano użytkownika!');
  }
);

commands.on(
  'ecounmute',
  (ctx) => ({
    member: ctx.guildMember(),
  }),
  async (message, { member }) => {
    if (!member.roles.includes('1270646685839654962')) {
      return message.inlineReply(
        '<:No:1267470845622616124> Nie masz uprawnień!'
      );
    }
    if (!member.roles.includes('1276070925099466765')) {
      return message.inlineReply(
        '<:No:1267470845622616124> Ten użytkownik nie jest zbanowany z ekonomii!'
      );
    }
    member.removeRole('1276070925099466765');
    message.inlineReply('<:Yes:1267470817860780264> Odbanowano użytkownika!');
  }
);

commands.on(
  'ecoimport',
  (ctx) => ({
    jsonObject: ctx.string(),
  }),
  async (message, { jsonObject }) => {
    if (message.member.user.id !== '990959984005222410') {
      return message.inlineReply(
        '<:No:1267470845622616124> Nie masz uprawnień by zaimportować dane ekonomii'
      );
    }
    try {
      let output = JSON.parse(jsonObject);
      if (!Array.isArray(output)) {
        return message.inlineReply(
          '<:No:1267470845622616124> Nieprawidłowy string JSON.'
        );
      }

      economy = output;
      return message.inlineReply(
        '<:Yes:1267470817860780264> Ustawiono pomyślnie.'
      );
    } catch (e) {
      return message.inlineReply(
        '<:No:1267470845622616124> Nieprawidłowy string JSON.'
      );
    }
  }
);

commands.raw('ecoexport', async (message) => {
  if (message.member.user.id !== '990959984005222410') {
    return message.inlineReply(
      '<:No:1267470845622616124> Nie masz uprawnień by wyeksportować dane ekonomii'
    );
  }
  return message.inlineReply(
    new discord.Embed({
      title: `<:Yes:1267470817860780264> Wyeksportowano ekonomię!`,
      description: `${JSON.stringify(economy).replace('\n', '')}`,
    })
  );
});

function checkCooldown(
  cooldowns: Map<string, number>,
  userId: string,
  cooldownTime: number
): boolean {
  const lastUsed = cooldowns.get(userId);
  if (lastUsed) {
    const timeSinceLastUse = Date.now() - lastUsed;
    return timeSinceLastUse >= cooldownTime;
  }
  return true;
}

function setCooldown(cooldowns: Map<string, number>, userId: string) {
  cooldowns.set(userId, Date.now());
}

function depositMoney(userId: string, amount: number): boolean {
  let userExists = false;
  let isSuccess = true;
  economy = economy.map((user) => {
    if (user.id === userId) {
      userExists = true;
      if (user.money >= amount) {
        user.money -= amount;
        user.bank += amount;
        return user;
      } else {
        isSuccess = false;
      }
    }
    return user;
  });

  if (!userExists) {
    return false;
  }

  console.log('Updated economy with deposit:', economy);
  return true;
}

function withdrawMoney(userId: string, amount: number): boolean {
  let userExists = false;
  let success = true;

  economy = economy.map((user) => {
    if (user.id === userId) {
      userExists = true;
      if (user.bank >= amount) {
        return {
          ...user,
          money: user.money + amount,
          bank: user.bank - amount,
        };
      } else {
        success = false;
      }
    }
    return user;
  });

  if (!userExists || !success) {
    return false;
  }

  console.log('Updated economy with withdraw:', economy);
  return true;
}

commands.raw('work', async (message) => {
  if (message.channelId !== '1276057189165039727') {
    return message.inlineReply(
      '**Kanał zrobiony pod zarabianie** - Używanie kanału <#1276057189165039727> to najlepszy możliwy sposób aby używać ekonomii.'
    );
  }

  const userId = message.author.id;

  if (!checkCooldown(workCooldowns, userId, 5000)) {
    message.reply(
      '<:No:1267470845622616124> Musisz poczekać zanim użyjesz tej komendy ponownie.'
    );
    return;
  }

  let money = getRandomMoney(150, 800);
  addMoney(userId, money);

  setCooldown(workCooldowns, userId);
  message.inlineReply(
    `<:Yes:1267470817860780264> Pracowałeś i otrzymałeś ${money}:dollar:`
  );
});

commands.raw('slut', async (message) => {
  if (message.channelId !== '1276057189165039727') {
    return message.inlineReply(
      '**Kanał zrobiony pod zarabianie** - Używanie kanału <#1276057189165039727> to najlepszy możliwy sposób aby używać ekonomii.'
    );
  }

  const userId = message.author.id;

  if (!checkCooldown(slutCooldowns, userId, 5 * 60 * 1000)) {
    message.reply(
      '<:No:1267470845622616124> Musisz poczekać zanim użyjesz tej komendy ponownie.'
    );
    return;
  }

  let money = getRandomMoney(1500, 5400);

  if (Math.random() > 0.7) {
    removeMoney(userId, money);
    message.inlineReply(
      `<:No:1267470845622616124> Wykonałeś źle zadanie, więc szef zbił Cię pasem i zabrał Ci ${money}:dollar:...\n-# Miałeś 70% na wykonanie tej komendy pomyślnie.`
    );
    return;
  }

  addMoney(userId, money);

  setCooldown(slutCooldowns, userId);
  message.inlineReply(
    `<:Yes:1267470817860780264> Pracowałeś dorywczo u podejrzanego gościa i zarobiłeś ${money}:dollar:`
  );
});

commands.raw('crime', async (message) => {
  if (message.channelId !== '1276057189165039727') {
    return message.inlineReply(
      '**Kanał zrobiony pod zarabianie** - Używanie kanału <#1276057189165039727> to najlepszy możliwy sposób aby używać ekonomii.'
    );
  }

  const userId = message.author.id;

  if (!checkCooldown(crimeCooldowns, userId, 15 * 60 * 1000)) {
    message.reply(
      '<:No:1267470845622616124> Musisz poczekać zanim użyjesz tej komendy ponownie.'
    );
    return;
  }

  let money = getRandomMoney(8500, 15250);

  if (Math.random() > 0.4) {
    removeMoney(userId, money);
    message.inlineReply(
      `<:No:1267470845622616124> Wykonałeś źle zadanie, więc szef zbił Cię pasem i zabrał Ci ${money}:dollar:...\n-# Miałeś 40% na wykonanie tej komendy pomyślnie.`
    );
    return;
  }

  addMoney(userId, money);

  setCooldown(crimeCooldowns, userId);
  message.inlineReply(
    `<:Yes:1267470817860780264> Okradłeś muzeum i zarobiłeś ${money}:dollar:`
  );
});

commands.on(
  'rob',
  (ctx) => ({
    member: ctx.guildMember(),
  }),
  async (message, { member }) => {
    const userId = message.member.user.id;
    const targetId = member.user.id;

    if (message.channelId !== '1278285487219544162') {
      return message.inlineReply(
        '**Nowy sposób na zarabianie** - Używanie kanału <#1278285487219544162> to najlepszy możliwy sposób aby okradać ludzi.'
      );
    }

    if (Math.random() > 0.7) {
      removeMoney(userId, 15000);
      return message.inlineReply(
        '<:No:1267470845622616124> Policja Cię przyłapała i straciłeś 15000:dollar:\n-# Miałeś 70% szans na pomyślną kradzież.'
      );
    }
    removeMoney(targetId, 75250);
    addMoney(userId, 7250);

    message.inlineReply(
      `<:Yes:1267470817860780264> Okradłeś tego użytkownika i zyskałeś 7250:dollar:`
    );
  }
);

commands.raw('bal', async (message) => {
  const userId = message.author.id;
  const user = economy.find((user) => user.id === userId);

  if (user) {
    const cryptoInfo = Object.entries(user.crypto)
      .map(([cryptoType, amount]) => `${amount} ${cryptoType}`)
      .join(', ');

    message.inlineReply(
      new discord.Embed({
        title: `<:Yes:1267470817860780264> Obecnie posiadane: ${
          user.money + user.bank
        }:dollar:`,
        description: `**Portfel:** ${user.money}\n**Bezpieczny bank:** ${
          user.bank
        }\n**Twoje kryptowaluty:** ${cryptoInfo || 'brak kryptowalut.'}`,
      })
    );
  } else {
    message.inlineReply(
      '<:No:1267470845622616124> Nie znaleziono Twojego konta. Możliwe, że jeszcze nie pracowałeś.'
    );
  }
});

commands.on(
  'dep',
  (ctx) => ({
    amount: ctx.integer(),
  }),
  async (message, { amount }) => {
    const userId = message.author.id;

    const result = depositMoney(userId, amount);
    if (result) {
      message.inlineReply(
        `<:Yes:1267470817860780264> Wpłacono ${amount}:dollar: do banku.`
      );
    } else {
      message.inlineReply(
        '<:No:1267470845622616124> Nie udało się dokonać wpłaty. Sprawdź swoje saldo.'
      );
    }
  }
);

commands.on(
  'with',
  (ctx) => ({
    amount: ctx.integer(),
  }),
  async (message, { amount }) => {
    const userId = message.author.id;

    const result = withdrawMoney(userId, amount);
    if (result) {
      message.inlineReply(
        `<:Yes:1267470817860780264> Wypłacono ${amount}:dollar: do portfela.`
      );
    } else {
      message.inlineReply(
        '<:No:1267470845622616124> Nie udało się dokonać wypłaty. Sprawdź swoje saldo.'
      );
    }
  }
);

commands.on(
  'buycrypto',
  (ctx) => ({
    cryptoType: ctx.text(),
  }),
  async (message, { cryptoType }) => {
    const userId = message.author.id;
    const amount = 1;

    if (!cryptoData[cryptoType]) {
      return message.inlineReply(
        '<:No:1267470845622616124> Nieznana kryptowaluta. Uzyskaj informacje o kryptowalutach w odpowiednim kanale.'
      );
    }

    const result = buyCrypto(userId, cryptoType, amount);

    if (result === true) {
      message.inlineReply(
        `<:Yes:1267470817860780264> Kupiono ${amount} ${cryptoType}.`
      );
    } else {
      message.inlineReply(
        '<:No:1267470845622616124> Nie udało się kupić kryptowaluty. Sprawdź swoje saldo.'
      );
    }
  }
);

commands.on(
  'sellcrypto',
  (ctx) => ({
    cryptoType: ctx.text(),
  }),
  async (message, { cryptoType }) => {
    const userId = message.author.id;
    const amount = 1;

    if (!cryptoData[cryptoType]) {
      return message.inlineReply(
        '<:No:1267470845622616124> Nieznana kryptowaluta.'
      );
    }

    const result = sellCrypto(userId, cryptoType, amount);

    if (result === true) {
      message.inlineReply(
        `<:Yes:1267470817860780264> Sprzedano ${amount} ${cryptoType}.`
      );
    } else {
      message.inlineReply(
        '<:No:1267470845622616124> Nie udało się sprzedać kryptowaluty. Sprawdź swoje posiadane środki.'
      );
    }
  }
);

commands.on(
  'ecocrypto',
  (ctx) => ({
    newValueStr: ctx.integer(),
    cryptoType: ctx.text(),
  }),
  async (message, { newValueStr, cryptoType }) => {
    if (message.member.user.id !== '990959984005222410') {
      return message.inlineReply('<:No:1267470845622616124> Brak uprawnień.');
    }
    const newValue = newValueStr;

    if (!cryptoData[cryptoType]) {
      return message.inlineReply(
        '<:No:1267470845622616124> Nieznana kryptowaluta.'
      );
    }

    cryptoData[cryptoType] = newValue;
    message.inlineReply(
      `<:Yes:1267470817860780264> Nowa wartość ${cryptoType} ustawiona na ${newValue}:dollar:.`
    );
  }
);

/** ================= GAMES ==================== */

commands.on(
  'game',
  (ctx) => ({
    gamename: ctx.text(),
  }),
  async (message, { gamename }) => {
    if (gamename == 'five_seconds') {
      var zagadki = [
        'Wymień 5 drzew liściastych',
        'Wymień 5 drzew iglastych',
        'Wymień 5 drzew',
        'Wymień 5 piosenek od NCS',
        'Wymień 5 przedmiotów magicznych',
        'Wymień 5 języków programowania',
        'Wymień 5 przeglądarek',
      ];
      var message2 = message.reply(
        'https://cdn.pixabay.com/animation/2023/01/09/18/04/18-04-38-312_512.gif' +
          '\n' +
          '<:Yes:1267470817860780264> ' +
          zagadki[Math.floor(Math.random() * zagadki.length)]
      );
      message2.then(async (msg) => {
        sleep(4500).then(async () => {
          msg.edit(':information_source: Czas się skończył.');
        });
      });
    } else {
      message.reply(
        '**<:No:1267470845622616124> Nie można zagrać:** nieznana nazwa gry'
      );
    }
  }
);
