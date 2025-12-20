import { addDefaultChannel, createUserMessage, listServers } from "./dom.js";

let ws: WebSocket | null = null;
let defaultChannels: Record<number, HTMLDivElement> = {};
let currentChannel: string | null = null;

function send(payload: object) {
    if (!ws) return;
    ws.send(JSON.stringify(payload));
    console.log(payload);
}

function joinDefaultChannel(channelId: string) {
    send({ type: "join", channelId });
    currentChannel = channelId;
}

function sendMessage(content: string) {
    send({ type: "message", content });
}

function initDefaultChannels() {
    if (!ws) return;
    defaultChannels[1] = addDefaultChannel(
        'General', 'house', '1',
        (n) => joinDefaultChannel(n),
        (msg) => sendMessage(msg)
    );
    defaultChannels[2] = addDefaultChannel(
        'News', 'newspaper', '2',
        (n) => joinDefaultChannel(n),
        (msg) => sendMessage(msg)
    );
}

function createServer() {
    const name = prompt('Server name:');
    send({
        type: "create_server",
        name: name
    });
    send({
        type: "list_servers",
        name: name
    });
    alert('Server created');
}

document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('user');
    const password = localStorage.getItem('pass');

    if (!username || !password) {
        window.location.href = '/begin.html';
        return;
    }

    ws = new WebSocket('wss://whisp-19jj.onrender.com');
    let isAuthenticated = false;

    ws.onopen = () => {
        send({ type: "auth", username, password });
    };

    ws.onmessage = (event) => {
        console.log(event);
        try {
            const msg = JSON.parse(event.data);

            if (msg.type === 'error' && !isAuthenticated) {
                alert(msg.message ?? 'Something went wrong.');
                localStorage.removeItem('user');
                localStorage.removeItem('pass');
                window.location.href = '/begin.html';
                return;
            }

            if (msg.type === 'auth_success') {
                isAuthenticated = true;
                initDefaultChannels();
                listServers((msg as any).servers);
            }

            if (msg.type === 'your_servers') {
                listServers((msg as any).servers);
            }

            if (msg.type === 'message' && currentChannel !== null) {
                createUserMessage(
                    defaultChannels[currentChannel],
                    msg.content ?? '-',
                    msg.from ?? '-',
                    '/def-avatar.png'
                );
            }
        } catch { }
    };
});

(window as any).createServer = createServer;