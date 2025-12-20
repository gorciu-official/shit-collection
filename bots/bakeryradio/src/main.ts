import * as config from './config';
import { Client, Events, GatewayIntentBits, TextChannel, VoiceChannel, Message } from 'discord.js';
import {
    joinVoiceChannel,
    VoiceConnection,
    createAudioPlayer,
    createAudioResource,
    StreamType,
    AudioPlayer,
    AudioPlayerStatus
} from '@discordjs/voice';
import * as ytdl from '@distube/ytdl-core';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
});

function sendmsg(content: string, channelId: string) {
    const channel = client.channels.cache.get(channelId) as TextChannel;
    if (!channel?.isTextBased?.()) return;
    channel.send(content).catch(() => {});
}

function getad(): string {
    return config.PIEKARNIA_AD;
}

let connection: VoiceConnection | null = null;
let player: AudioPlayer | null = null;
let isPlaying = false;
const queue: string[] = [];

const DEFAULT_SONGS: string[] = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=iqoNoU-rm14',
    'https://www.youtube.com/watch?v=D-TQB-T-UJ4',
    'https://www.youtube.com/watch?v=3BR7-AzE2dQ',
    'https://www.youtube.com/watch?v=BqCUsPkouUU',
    'https://www.youtube.com/watch?v=0E6KXgWuaHo',
    'https://www.youtube.com/watch?v=EZUPEoj3Qjs',
    'https://www.youtube.com/watch?v=mj9KRKSvdbk',
    'https://www.youtube.com/watch?v=B7xai5u_tnk',
    'https://www.youtube.com/watch?v=VFwmKL5OL-Q',
    'https://www.youtube.com/watch?v=ALkNSrtIPXc',
    'https://www.youtube.com/watch?v=DHsNaulyQw8',
    'https://www.youtube.com/watch?v=GNwd1qXt3RI',
    'https://www.youtube.com/watch?vBByMzI1YjKA'
];

async function playNext() {
    const url = queue.shift() || DEFAULT_SONGS[Math.floor(Math.random() * DEFAULT_SONGS.length)];
    if (!url) {
        isPlaying = false;
        sendmsg(`## ❌ Kolejka jest pusta, nic do odtworzenia.\n-# ${getad()}`, config.RADIO_COMMANDS_CHANNEL);
        return;
    }

    try {
        const stream = await ytdl(url, {
            filter: 'audioonly',
            highWaterMark: 1 << 25
        });

        const resource = createAudioResource(stream, {
            inputType: StreamType.Arbitrary
        });

        if (!player) {
            player = createAudioPlayer();

            player.on(AudioPlayerStatus.Idle, () => {
                isPlaying = false;
                playNext();
            });

            player.on('error', error => {
                console.error('Audio player error:', error);
                isPlaying = false;
                playNext();
            });
        }

        player.play(resource);
        connection?.subscribe(player);

        sendmsg(`## 💿 Odtwarzam: <${url}>\n-# ${getad()}`, config.RADIO_COMMANDS_CHANNEL);
        isPlaying = true;
    } catch (err) {
        console.error(err);
        sendmsg(`## 🫩 Nie udało się odtworzyć:\n<${url}>\n-# ${getad()}`, config.RADIO_COMMANDS_CHANNEL);
        isPlaying = false;
        playNext();
    }
}

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('messageCreate', async (msg: Message) => {
    if (!msg.content.startsWith('=')) return;
    if (msg.channelId !== config.RADIO_COMMANDS_CHANNEL) {
        try {
            await msg.react('❌');
        } catch {}
        return;
    }

    const mesg = msg.content.slice(1).trim().split(/\s+/);
    const command = mesg[0]?.toLowerCase();

    switch (command) {
        case 'wbij':
        case 'join': {
            const channel = client.channels.cache.get(config.RADIO_CHANNEL);

            if (!channel || !channel.isVoiceBased?.()) {
                sendmsg(`## 🫩 Kanał głosowy nie istnieje lub jest nieprawidłowy.`, config.RADIO_COMMANDS_CHANNEL);
                return;
            }

            try {
                connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator
                });

                sendmsg(`## ▶️ Dołączono.\n-# ${getad()}`, config.RADIO_COMMANDS_CHANNEL);
                if (!isPlaying) playNext();
            } catch (err) {
                console.error(err);
                sendmsg(`## 🫩 Wystąpił błąd przy dołączaniu.\n-# ${getad()}`, config.RADIO_COMMANDS_CHANNEL);
            }
            break;
        }

        case 'play':
        case 'pusc':
        case 'puść': {
            const url = mesg[1];

            if (!connection) {
                sendmsg(`## 📡 Najpierw użyj \`=join\`.\n-# ${getad()}`, config.RADIO_COMMANDS_CHANNEL);
                return;
            }

            if (url && !ytdl.validateURL(url)) {
                msg.reply(`## 🫩 Podaj prawidłowy link do YouTube.\n-# ${getad()}`);
                return;
            }

            if (url) queue.push(url);
            else queue.push(DEFAULT_SONGS[Math.floor(Math.random() * DEFAULT_SONGS.length)]);

            sendmsg(`## 📥 Dodano do kolejki.\n-# ${getad()}`, config.RADIO_COMMANDS_CHANNEL);

            if (!isPlaying) playNext();
            break;
        }

        case 'skip':
        case 'pomin':
        case 'pomiń': {
            if (!player || !isPlaying) {
                sendmsg(`❌ Nic nie jest obecnie odtwarzane.\n-# ${getad()}`, config.RADIO_COMMANDS_CHANNEL);
                return;
            }
            player.stop(); 
            sendmsg(`## ⏭️ Pominąłem utwór.\n-# ${getad()}`, config.RADIO_COMMANDS_CHANNEL);
            break;
        }

        case 'queue':
        case 'kolejka': {
            if (queue.length === 0) {
                sendmsg(`## 📭 Kolejka jest pusta.\n-# ${getad()}`, config.RADIO_COMMANDS_CHANNEL);
                return;
            }
            const list = queue.slice(0, 10)
                .map((link, idx) => `${idx + 1}. <${link}>`)
                .join('\n');
            const more = queue.length > 10 ? `\n... i jeszcze ${queue.length - 10} więcej.` : '';
            sendmsg(`## 🎵 Kolejka utworów:\n${list}${more}\n-# ${getad()}`, config.RADIO_COMMANDS_CHANNEL);
            break;
        }

        case 'help':
        case 'pomoc': {
            sendmsg(`**join**/**wbij**: dołącza na kanał głosowy
**pusc**/**puść**/**play** <youtube url>: dodaje piosenkę do kolejki
**skip**/**pomin**/**pomiń**: pomija aktualny utwór
**queue**/**kolejka**: pokazuje aktualną kolejkę
-# ${getad()}`, config.RADIO_COMMANDS_CHANNEL);
            break;
        }

        default:
            sendmsg(`## 😶‍🌫️ Nieznana komenda: \`${command}\`\n-# ${getad()}`, config.RADIO_COMMANDS_CHANNEL);
            break;
    }
});

client.login(config.TOKEN);
