import { autoExpand } from "./ux.js";
import { htmlentities } from "./security.js";

class ChatMessage extends HTMLElement {
    constructor() {
        super();
    }

    setup(what: {
        message: string,
        user: string,
        avatar_url: string
    }): void {
        this.classList.add('message');
        this.style.overflow = 'auto';
        this.innerHTML = `
            <div class="row">
                <div>
                    <img src="${htmlentities(what.avatar_url)}" class="msg-">
                </div>
                <div>
                    <p><b>${htmlentities(what.user)}</b></p>
                    <p>${htmlentities(what.message)}</p>
                </div>
            </div>
        `;
    }
};

window.customElements.define('chat-message', ChatMessage)

interface DefaultChannel {
    name: string;
    icon: string;
    unique_id: string;
};

let def_channels: DefaultChannel[] = [];

function switchTab(id: string) {
    document.querySelector('.tab.active').classList.remove('active');
    document.querySelector('.tab#tab-' + id)?.classList.add('active');
}

function addDefaultChannel(
    name: string, icon: string, unique_id: string, on_switch: (unique_id: string) => void, on_msg: (msg: string) => void
): HTMLDivElement {
    def_channels.push({
        name: name,
        icon: icon,
        unique_id: unique_id
    });

    const channel_el = document.createElement('p');
    channel_el.classList.add('channel');
    channel_el.addEventListener('click', () => {
        switchTab('defchannel-' + unique_id);
        on_switch(unique_id);
    });
    channel_el.innerHTML = `<i class="fa-solid fa-${icon}"></i> ${name}`;
    document.querySelector('#tabs-defchannels')?.appendChild(channel_el);

    const channel_tab = document.createElement('div');
    channel_tab.classList.add('tab');
    channel_tab.id = `tab-defchannel-${unique_id}`;
    channel_tab.innerHTML = `
        <div class="topbar">
            <i class="fa-solid fa-${icon}"></i>
            <p>${name}</p>
        </div>
        <div class="messages" style="overflow: auto;">
        </div>
        <div class="writer">
            <textarea placeholder="Write something..." style="line-height: 1;"></textarea>
        </div>
    `;

    // user experience
    autoExpand(channel_tab.querySelector('textarea'), 6);
    channel_tab.querySelector('textarea').addEventListener('keydown', (e) => {
        if (e.shiftKey || e.key.toLowerCase() !== 'enter') return;
        e.preventDefault();
        const val = channel_tab.querySelector('textarea').value.trim();
        if (val !== '') on_msg(val);
        channel_tab.querySelector('textarea').value = '';
    });

    document.querySelector('main .right')?.appendChild(channel_tab);

    return document.querySelector(`#tab-defchannel-${unique_id} .messages`);
}

function createUserMessage(
    messages_element: HTMLDivElement, message: string, user: string, avatar: string
) {
    const message_el = document.createElement('chat-message') as ChatMessage;
    message_el.setup({
        message: message,
        user: user,
        avatar_url: avatar
    });
    messages_element.appendChild(message_el);
    messages_element.scrollTop = messages_element.scrollHeight;
}

function listServers(servers: {[key: string | number | symbol]: {
    name: string,
    id: string,
    channels: {
        id: string,
        name: string
    }[]
}}) {
    const whereAppend = document.querySelector('.servers-list');
    whereAppend.innerHTML = '';
    Object.values(servers).forEach(element => {
        const server = document.createElement('details');
        server.open = true;
        let ih = `<summary>"${htmlentities(element.name)}"</summary>`;
        ih += `<div class="row"><i class="fa-solid fa-plus" title="Create channel"></i></div>`;
        element.channels.forEach((el) => {
            ih += `<p class="channel" id="serverchanneltab-${element.id}-${el.id}">${htmlentities(el.name)}</p>`;
        });
        server.innerHTML = ih;
        whereAppend.appendChild(server);
    });
}

export { addDefaultChannel, createUserMessage, listServers };