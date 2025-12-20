import * as ws from 'ws';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

const PORT = Number(process.env.HOST) || 10000;
const DATA_FILE = path.join(path.resolve('.'), 'data.json');

type User = {
    username: string;
    passwordHash: string;
    serverId: string | null;
    channelId: string | null;
};

type Channel = { id: string; name: string };
type Server = { id: string; name: string; owner: string; channels: Channel[] };

type Data = {
    users: Record<string, User>;
    servers: Record<string, Server>;
    predefinedChannels: Channel[];
    serverMembers: Record<string, string[]>; 
};

const data: Data = loadData();

function loadDataInternal(): Data {
    if (!fs.existsSync(DATA_FILE)) {
        return {
            users: {},
            servers: {},
            predefinedChannels: [],
            serverMembers: {} // NEW
        };
    }
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        parsed.serverMembers ??= {};
        return parsed;
    } catch {
        return {
            users: {},
            servers: {},
            predefinedChannels: [],
            serverMembers: {}
        };
    }
}

function loadData(): Data {
    const datadef = loadDataInternal();
    datadef.predefinedChannels = [{ id: '1', name: 'general' }, { id: '2', name: 'news' }];
    datadef.serverMembers ??= {}; 
    return datadef;
}

function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));
}

function generateId() {
    return `x${Date.now()}${Math.floor(Math.random() * 90 + 10)}`;
}

const wss = new ws.Server({ port: PORT });
console.log(`Server is running on port ${PORT}`);

wss.on('connection', (socket) => {
    let user: User | null = null;

    socket.send(JSON.stringify({
        type: 'auth_required',
        message: 'Send: {"type": "auth", "username": "your_name", "password": "your_password"}'
    }));

    socket.on('message', async (raw) => {
        let msg: any;
        try {
            msg = JSON.parse(raw.toString());
        } catch {
            socket.send(JSON.stringify({ type: 'error', message: 'Invalid JSON.' }));
            return;
        }

        if (msg.type === 'auth') {
            const { username, password } = msg;
            if (!username || !password) {
                socket.send(JSON.stringify({ type: 'error', message: 'Missing credentials.' }));
                socket.close();
                return;
            }

            const existing = data.users[username];
            if (existing) {
                const valid = await bcrypt.compare(password, existing.passwordHash);
                if (!valid) {
                    socket.send(JSON.stringify({ type: 'error', message: 'Incorrect password.' }));
                    socket.close();
                    return;
                }
                user = existing;
            } else {
                const passwordHash = await bcrypt.hash(password, 10);
                user = { username, passwordHash, serverId: null, channelId: null };
                data.users[username] = user;
                saveData();
            }

            (socket as any)._user = user;
            socket.send(JSON.stringify({
                type: 'auth_success',
                message: 'Logged in.',
                servers: Object.entries(data.serverMembers)
                    .filter(([_, users]) => users.includes(user!.username))
                    .map(([serverId]) => {
                        const s = data.servers[serverId];
                        return s ? { id: s.id, name: s.name } : null;
                    })
                    .filter(Boolean)
            }));
            return;
        }

        if (!user) {
            socket.send(JSON.stringify({ type: 'error', message: 'Authenticate first.' }));
            return;
        }

        switch (msg.type) {
            case 'create_server': {
                const id = generateId();
                const server: Server = { id, name: msg.name || 'New Server', owner: user.username, channels: [] };
                data.servers[id] = server;
                user.serverId = id;
                user.channelId = null;
                saveData();
                socket.send(JSON.stringify({ type: 'server_created', server }));
                data.serverMembers[id] = [user.username];
                break;
            }

            case 'list_channels': {
                const serverId = msg.serverId;
                const server = data.servers[serverId];
                if (!server) {
                    socket.send(JSON.stringify({ type: 'error', message: 'Server not found.' }));
                    return;
                }
                socket.send(JSON.stringify({  type: 'channels', serverId: serverId, channels: server.channels }));
            }

            case 'join_server': {
                const serverId = msg.serverId;
                const server = data.servers[serverId];
                if (!server) {
                    socket.send(JSON.stringify({ type: 'error', message: 'Server not found.' }));
                    return;
                }
                const members = data.serverMembers[serverId] ?? [];
                if (!members.includes(user.username)) {
                    members.push(user.username);
                    data.serverMembers[serverId] = members;
                }
                user.serverId = serverId;
                user.channelId = null;
                saveData();
                socket.send(JSON.stringify({
                    type: 'server_joined',
                    server: { id: server.id, name: server.name }
                }));
                break;
            }

            case 'list_servers': {
                const servers = Object.entries(data.serverMembers)
                    .filter(([_, users]) => users.includes(user.username))
                    .map(([id]) => {
                        const s = data.servers[id];
                        return s ? { id: s.id, name: s.name, channels: s.channels } : null;
                    })
                    .filter(Boolean);
                socket.send(JSON.stringify({ type: 'your_servers', servers }));
                break;
            }

            case 'rename_server': {
                const srv = data.servers[user.serverId ?? ''];
                if (!srv || srv.owner !== user.username) {
                    socket.send(JSON.stringify({ type: 'error', message: 'Unauthorized.' }));
                    return;
                }
                srv.name = msg.name;
                saveData();
                socket.send(JSON.stringify({ type: 'server_renamed', name: srv.name }));
                break;
            }

            case 'delete_server': {
                const id = user.serverId;
                if (!id || data.servers[id]?.owner !== user.username) {
                    socket.send(JSON.stringify({ type: 'error', message: 'Unauthorized.' }));
                    return;
                }
                delete data.servers[id];
                user.serverId = null;
                user.channelId = null;
                saveData();
                socket.send(JSON.stringify({ type: 'server_deleted' }));
                break;
            }

            case 'create_channel': {
                const srv = data.servers[user.serverId ?? ''];
                if (!srv || srv.owner !== user.username) {
                    socket.send(JSON.stringify({ type: 'error', message: 'Unauthorized.' }));
                    return;
                }
                const ch: Channel = { id: generateId(), name: msg.name || 'New Channel' };
                srv.channels.push(ch);
                saveData();
                socket.send(JSON.stringify({ type: 'channel_created', channel: ch }));
                break;
            }

            case 'rename_channel': {
                const srv = data.servers[user.serverId ?? ''];
                if (!srv || srv.owner !== user.username) {
                    socket.send(JSON.stringify({ type: 'error', message: 'Unauthorized.' }));
                    return;
                }
                const ch = srv.channels.find(c => c.id === msg.id);
                if (!ch) {
                    socket.send(JSON.stringify({ type: 'error', message: 'Channel not found.' }));
                    return;
                }
                ch.name = msg.name;
                saveData();
                socket.send(JSON.stringify({ type: 'channel_renamed', id: ch.id, name: ch.name }));
                break;
            }

            case 'delete_channel': {
                const srv = data.servers[user.serverId ?? ''];
                if (!srv || srv.owner !== user.username) {
                    socket.send(JSON.stringify({ type: 'error', message: 'Unauthorized.' }));
                    return;
                }
                srv.channels = srv.channels.filter(c => c.id !== msg.id);
                if (user.channelId === msg.id) user.channelId = null;
                saveData();
                socket.send(JSON.stringify({ type: 'channel_deleted', id: msg.id }));
                break;
            }

            case 'list_channels': {
                const srv = data.servers[user.serverId ?? ''];
                if (!srv) {
                    socket.send(JSON.stringify({ type: 'error', message: 'Unauthorized.' }));
                    return;
                }
            }

            case 'join': {
                const id = String(msg.channelId);
                const isPredefined = data.predefinedChannels.some(c => c.id === id);
                const srv = data.servers[user.serverId ?? ''];
                const exists = isPredefined || srv?.channels.some(c => c.id === id);
                console.log("join request for channelId =", msg.channelId, "isPredefined=", isPredefined);
                if (!exists) {
                    socket.send(JSON.stringify({ type: 'error', message: 'Channel not found.' }));
                    return;
                }
                user.channelId = id;
                saveData();
                socket.send(JSON.stringify({ type: 'joined', channelId: id }));
                break;
            }

            case 'message': {
                if (!user.channelId) {
                    socket.send(JSON.stringify({ type: 'error', message: 'Join a channel first.' }));
                    return;
                }

                const payload = {
                    type: 'message',
                    from: user.username,
                    content: msg.content,
                    channelId: user.channelId
                };

                for (const client of wss.clients) {
                    if (client.readyState !== ws.OPEN) continue;
                    const other = (client as any)._user as User;
                    if (other?.channelId === user.channelId) {
                        client.send(JSON.stringify(payload));
                    }
                }
                break;
            }
        }
    });
});