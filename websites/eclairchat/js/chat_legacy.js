/** @type {HTMLDivElement} */
const messagesDiv = document.getElementById('messages');
/** @type {HTMLDivElement} */
const channelsDiv = document.getElementById('channels');
/** @type {HTMLInputElement} */
const input = document.getElementById('msgInput');
/** @type {HTMLFormElement} */
const form = document.getElementById('msgForm');

let currentChannel = null;
let lastMessageId = 0;
let oldestMessageId = 0;
let isLoading = false;
if (typeof isAdmin === 'undefined') var isAdmin = false;

/** @returns {Promise<void>} */
async function loadChannels() {
    channelsDiv.innerHTML = '<div class="before-channels"></div><div class="channel-wrapper"></div><div></div>';
    const wrapper = channelsDiv.querySelector('.channel-wrapper');

    if (isAdmin) {
        const addBtn = document.createElement('div');
        addBtn.className = 'channel add-channel';
        addBtn.textContent = '+ Nowy kanał';
        addBtn.onclick = async () => {
            const name = prompt('Nazwa nowego kanału:');
            if (!name?.trim()) return;
            await fetch('/?create_channel=1', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({name: name.trim()})
            });
            await loadChannels();
        };
        channelsDiv.querySelector('.before-channels').appendChild(addBtn);
    }

    const passBtn = document.createElement('div');
    passBtn.textContent = '? Zmień hasło';
    passBtn.className = 'channel add-channel';
    passBtn.onclick = async () => {
        const name = prompt('Nowe hasło:');
        if (!name?.trim()) return;
        const name2 = prompt('Powtórz nowe hasło:');
        if (!name2?.trim()) return;
        if (name !== name2) {
            return alert('Bratku! Twoje hasło nie jest powtórzone idealnie.');
        }
        await fetch('/?change_password=1', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({passwd: name})
        });
        alert('Zmieniono.');
    };
    channelsDiv.querySelector('.before-channels').appendChild(passBtn);

    const res = await fetch('/api/channels.php?channels=1');
    const data = await res.json();

    data.forEach((c, index) => {
        const btn = document.createElement('div');
        btn.className = 'channel';
        btn.dataset.id = c.id;
        btn.draggable = true;
        btn.innerHTML = `<i class="fa-solid fa-hashtag"></i> ${escapeHtml(c.name)}`;
        btn.onclick = () => switchChannel(c.id, btn);
        btn.oncontextmenu = e => showChannelMenu(e, c, btn);
        wrapper.appendChild(btn);
        btn.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', c.id);
            btn.classList.add('dragging');
        });
        btn.addEventListener('dragend', e => {
            btn.classList.remove('dragging');
        });
    });

    wrapper.addEventListener('dragover', e => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        if (!dragging) return;

        const afterElement = Array.from(wrapper.children)
            .filter(el => el !== dragging)
            .reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = e.clientY - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return {offset, element: child};
                } else {
                    return closest;
                }
            }, {offset: Number.NEGATIVE_INFINITY}).element;

        if (afterElement) {
            wrapper.insertBefore(dragging, afterElement);
        } else {
            wrapper.appendChild(dragging);
        }
    });

    wrapper.addEventListener('drop', async e => {
        e.preventDefault();
        const order = Array.from(wrapper.children)
            .map((el, pos) => ({id: el.dataset.id, pos}));

        for (const o of order) {
            await fetch(`/api/channels.php?move_channel=${o.id}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({position: o.pos})
            });
        }
    });
}

/** @param {number} id @param {HTMLElement} btn */
async function switchChannel(id, btn) {
    currentChannel = id;
    lastMessageId = 0;
    oldestMessageId = 0;
    messagesDiv.innerHTML = '';
    document.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    await fetchMessages('initial');
}

/** @param {'new'|'older'|'initial'} [mode] */
async function fetchMessages(mode = 'new') {
    if (!currentChannel || isLoading) return;
    isLoading = true;
    let url = `/?fetch=1&channel_id=${currentChannel}`;
    if (mode === 'new' && lastMessageId) url += `&from_id=${lastMessageId}`;
    if (mode === 'older' && oldestMessageId) url += `&before_id=${oldestMessageId}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
        isLoading = false;
        return;
    }
    const minId = data[0].id;
    const maxId = data[data.length - 1].id;
    if (!oldestMessageId || minId < oldestMessageId) oldestMessageId = minId;
    if (!lastMessageId || maxId > lastMessageId) lastMessageId = maxId;
    if (mode === 'older') {
        const scrollPos = messagesDiv.scrollHeight - messagesDiv.scrollTop;
        for (const m of data.reverse()) {
            const el = createMessageElement(m);
            messagesDiv.insertBefore(el, messagesDiv.firstChild);
        }
        messagesDiv.scrollTop = messagesDiv.scrollHeight - scrollPos;
    } else {
        const atBottom = messagesDiv.scrollTop + messagesDiv.clientHeight >= messagesDiv.scrollHeight - 10;
        for (const m of data) {
            const el = createMessageElement(m);
            messagesDiv.appendChild(el);
        }
        if (atBottom) messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    isLoading = false;
}

function renderMarkdown(text) {
    text = escapeHtml(text);

    text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    text = text.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    text = text.replace(/\*\*\*(.*?)\*\*\*/gim, '<b><i>$1</i></b>');
    text = text.replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>');
    text = text.replace(/\*(.*?)\*/gim, '<i>$1</i>');
    text = text.replace(/~~(.*?)~~/gim, '<del>$1</del>');

    text = text.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
    text = text.replace(/`([^`]+)`/gim, '<code>$1</code>');

    text = text.replace(/^\s*[-*] (.*$)/gim, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');

    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/gim, '<a href="$2" target="_blank">$1</a>');

    text = text
        .replaceAll(':fire:', '🔥')
        .replaceAll(':snowflake:', '❄️')
        .replaceAll(':droplet:', '💧')
        .replaceAll(':wave:', '🌊')
        .replaceAll(':gear:', '⚙️')
        .replaceAll(':star:', '⭐')
        .replaceAll(':sparkles:', '✨')
        .replaceAll(':rainbow:', '🌈')
        .replaceAll(':sun:', '☀️')
        .replaceAll(':moon:', '🌙')
        .replaceAll(':skull:', '💀')
        .replaceAll(':brain:', '🧠')
        .replaceAll(':clown:', '🤡')
        .replaceAll(':eyes:', '👀')
        .replaceAll(':crown:', '👑')
        .replaceAll(':party:', '🎉')
        .replaceAll(':gift:', '🎁')
        .replaceAll(':music:', '🎵')
        .replaceAll(':notes:', '🎶')
        .replaceAll(':dove:', '🕊️')
        .replaceAll(':lightning:', '⚡')
        .replaceAll(':heart:', '❤️')
        .replaceAll(':heart_on_fire:', '❤️‍🔥')
        .replaceAll(':broken_heart:', '💔')
        .replaceAll(':black_heart:', '🖤')
        .replaceAll(':white_heart:', '🤍')
        .replaceAll(':green_heart:', '💚')
        .replaceAll(':yellow_heart:', '💛')
        .replaceAll(':blue_heart:', '💙')
        .replaceAll(':purple_heart:', '💜')
        .replaceAll(':orange_heart:', '🧡')
        .replaceAll(':diamond:', '💎')
        .replaceAll(':kiss:', '💋')
        .replaceAll(':love_letter:', '💌')
        .replaceAll(':rose:', '🌹')
        .replaceAll(':couple:', '💑')
        .replaceAll(':couple_men:', '👬')
        .replaceAll(':couple_women:', '👭')
        .replaceAll(':revolving_hearts:', '💞')
        .replaceAll(':two_hearts:', '💕')
        .replaceAll(':sparkling_heart:', '💖')
        .replaceAll(':heartpulse:', '💗')
        .replaceAll(':cupid:', '💘')
        .replaceAll(':gift_heart:', '💝')
        .replaceAll(':sob:', '😭')
        .replaceAll(':joy:', '😂')
        .replaceAll(':angry:', '😡')
        .replaceAll(':cool:', '😎')
        .replaceAll(':smile:', '😊')
        .replaceAll(':wink:', '😉')
        .replaceAll(':thinking:', '🤔')
        .replaceAll(':devil:', '😈')
        .replaceAll(':thumbsup:', '👍')
        .replaceAll(':thumbsdown:', '👎');

    text = text.replace(/\n/g, '<br>');
    return text;
}

/** @param {any} m @returns {HTMLDivElement} */
function createMessageElement(m) {
    const div = document.createElement('div');
    div.className = 'message';
    div.dataset.id = m.id;
    div.innerHTML = `<strong>${escapeHtml(m.username)}:</strong><br>${renderMarkdown(m.content)}`;

    if (m.attachments?.length) {
        const attDiv = document.createElement('div');
        attDiv.style.display = 'flex';
        attDiv.style.flexDirection = 'column';
        attDiv.style.marginTop = '6px';
        for (const a of m.attachments) {
            if (a.file_url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                const link = document.createElement('a');
                link.href = a.file_url;
                link.target = "_blank";
                const img = document.createElement('img');
                img.loading = "lazy";
                img.src = a.file_url;
                img.style.maxWidth = '200px';
                img.style.borderRadius = '8px';
                img.style.marginTop = '4px';
                link.appendChild(img);
                attDiv.appendChild(link);
            } else if (a.file_url == 'undefined') {
                console.log('undefined attachment');
            } else {
                const link = document.createElement('a');
                link.href = a.file_url;
                link.textContent = a.file_name;
                link.target = '_blank';
                link.style.color = '#7289da';
                link.style.marginTop = '4px';
                attDiv.appendChild(link);
            }
        }
        div.appendChild(attDiv);
    }

    const reactionsDiv = document.createElement('div');
    reactionsDiv.className = 'reactions';
    reactionsDiv.style.display = 'flex';
    reactionsDiv.style.gap = '6px';
    reactionsDiv.style.marginTop = '4px';
    reactionsDiv.style.flexWrap = 'wrap';

    for (const r of m.reactions) {
        const span = document.createElement('div');
        span.style.display = 'inline-flex';
        span.style.alignItems = 'center';
        span.style.padding = '3px 6px';
        span.style.background = '#202225';
        span.style.borderRadius = '10px';
        span.style.cursor = 'pointer';
        span.style.fontSize = '14px';
        span.textContent = `${r.emoji} ${r.count}`;
        span.onclick = () => toggleReaction(m.id, r.emoji);
        reactionsDiv.appendChild(span);
    }

    const add = document.createElement('div');
    add.style.display = 'inline-flex';
    add.style.alignItems = 'center';
    add.style.padding = '3px 6px';
    add.style.background = '#2b2f33';
    add.style.borderRadius = '10px';
    add.style.cursor = 'pointer';
    add.style.fontSize = '14px';
    add.innerHTML = '<i class="fa-solid fa-face-smile"></a>';
    add.onclick = () => chooseReaction(m.id);
    reactionsDiv.appendChild(add);
    div.appendChild(reactionsDiv);

    div.oncontextmenu = e => showMessageMenu(e, m);

    return div;
}

/** @param {string} text @returns {string} */
function escapeHtml(text) {
    return text.replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[c]));
}

const attachments = [];
const attachmentPreview = document.createElement('div');
attachmentPreview.style.display = 'flex';
attachmentPreview.style.flexWrap = 'wrap';
attachmentPreview.style.gap = '6px';
attachmentPreview.style.margin = '6px 0';
form.insertBefore(attachmentPreview, input.nextSibling);

/** @param {File} file @returns {Promise<string>} */
async function uploadToCatbox(file) {
    const formData = new FormData();
    formData.append('file_uploader', file);
    const res = await fetch('/api/files.php', {method: 'POST', body: formData});
    const data = await res.text();
    return JSON.parse(data).url;
}

/** @param {File} file */
function addAttachment(file) {
    const url = URL.createObjectURL(file);
    attachments.push({file, url});
    const thumb = document.createElement('div');
    thumb.style.position = 'relative';
    thumb.style.width = '60px';
    thumb.style.height = '60px';
    thumb.style.borderRadius = '6px';
    thumb.style.overflow = 'hidden';
    thumb.style.cursor = 'pointer';
    const img = document.createElement('img');
    img.src = url;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    const del = document.createElement('div');
    del.textContent = '×';
    del.style.position = 'absolute';
    del.style.top = '0';
    del.style.right = '0';
    del.style.background = 'rgba(0,0,0,0.6)';
    del.style.color = '#fff';
    del.style.width = '18px';
    del.style.height = '18px';
    del.style.display = 'flex';
    del.style.alignItems = 'center';
    del.style.justifyContent = 'center';
    del.style.borderRadius = '0 0 0 6px';
    del.style.fontWeight = 'bold';
    del.style.cursor = 'pointer';
    del.onclick = () => {
        attachmentPreview.removeChild(thumb);
        const index = attachments.findIndex(a => a.url === url);
        if (index > -1) attachments.splice(index, 1);
    };
    thumb.appendChild(img);
    thumb.appendChild(del);
    attachmentPreview.appendChild(thumb);
}

document.addEventListener('paste', e => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
        if (item.type.startsWith('image/')) addAttachment(item.getAsFile());
    }
});

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.multiple = true;
fileInput.style.display = 'none';
fileInput.onchange = () => {
    for (const file of fileInput.files) addAttachment(file);
};
form.appendChild(fileInput);

const attachBtn = document.createElement('button');
attachBtn.type = 'button';
attachBtn.textContent = '📎';
attachBtn.style.marginRight = '6px';
attachBtn.onclick = () => fileInput.click();
form.insertBefore(attachBtn, input);

/** @param {SubmitEvent} e */
async function sendMessage(e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!currentChannel) return;
    const urls = [];
    for (const att of attachments) urls.push(await uploadToCatbox(att.file));
    const body = new URLSearchParams({message: text, channel_id: currentChannel});
    urls.forEach(u => body.append('attachment_urls[]', u));
    await fetch('/api/send.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body
    });
    attachments.length = 0;
    attachmentPreview.innerHTML = '';
    input.value = '';
    await fetchMessages('new');
}

form.addEventListener('submit', sendMessage);

/** @param {number} messageId @param {string} emoji */
async function toggleReaction(messageId, emoji) {
    await fetch('/?react=1', {
        method: 'POST',
        body: new URLSearchParams({message_id: messageId, emoji})
    });
    await refreshReactions(messageId);
}

/** @param {number} messageId */
async function refreshReactions(messageId) {
    const url = `/?fetch=1&channel_id=${currentChannel}&from_id=${messageId - 1}`;
    const res = await fetch(url);
    const data = await res.json();
    const msg = data.find(m => m.id === messageId);
    if (!msg) return;
    const el = messagesDiv.querySelector(`.message[data-id="${messageId}"] .reactions`);
    el.innerHTML = '';
    for (const r of msg.reactions) {
        const span = document.createElement('div');
        span.style.display = 'inline-flex';
        span.style.alignItems = 'center';
        span.style.padding = '3px 6px';
        span.style.background = '#202225';
        span.style.borderRadius = '10px';
        span.style.cursor = 'pointer';
        span.style.fontSize = '14px';
        span.textContent = `${r.emoji} ${r.count}`;
        span.onclick = () => toggleReaction(msg.id, r.emoji);
        el.appendChild(span);
    }
    const add = document.createElement('div');
    add.style.display = 'inline-flex';
    add.style.alignItems = 'center';
    add.style.padding = '3px 6px';
    add.style.background = '#2b2f33';
    add.style.borderRadius = '10px';
    add.style.cursor = 'pointer';
    add.style.fontSize = '14px';
    add.innerHTML = '<i class="fa-solid fa-face-smile"></a>';
    add.onclick = () => chooseReaction(msg.id);
    el.appendChild(add);
}

/** @param {number} messageId */
function chooseReaction(messageId) {
    const emoji = prompt('Podaj emoji:');
    if (!emoji?.trim()) return;
    toggleReaction(messageId, emoji.trim());
}

messagesDiv.addEventListener('scroll', async () => {
    if (messagesDiv.scrollTop < 100 && !isLoading && oldestMessageId > 1)
        await fetchMessages('older');
});

setInterval(fetchMessages, 2000);

/** @returns {Promise<void>} */
async function deleteChannel(id) {
    if (!confirm('Na pewno chcesz usunąć ten kanał?')) return;
    await fetch(`/?delete_channel=${id}`);
    await loadChannels();
}

/** @returns {Promise<void>} */
async function renameChannel(id) {
    const newName = prompt('Nowa nazwa kanału:');
    if (!newName?.trim()) return;
    await fetch(`/?rename_channel=${id}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({name: newName.trim()})
    });
    await loadChannels();
}

/** @param {MouseEvent} e @param {any} msg */
function showMessageMenu(e, msg) {
    e.preventDefault();
    msgMenu.innerHTML = '';
    const copyId = document.createElement('div');
    copyId.className = 'context-item';
    copyId.textContent = '🆔 Kopiuj ID';
    copyId.onclick = () => { copyText(msg.id); closeMsgMenu(); };
    msgMenu.appendChild(copyId);

    const copyTextBtn = document.createElement('div');
    copyTextBtn.className = 'context-item';
    copyTextBtn.textContent = '📋 Kopiuj treść';
    copyTextBtn.onclick = () => { copyText(msg.content); closeMsgMenu(); };
    msgMenu.appendChild(copyTextBtn);

    const del = document.createElement('div');
    del.className = 'context-item';
    del.textContent = '🗑️ Usuń wiadomość';
    del.onclick = async () => {
        const delet = await fetch(`/api/delete_message.php?id=${msg.id}`);
        if (delet.ok) {
            const djson = await delet.json();
            if (!djson.success) {
                alert(djson.error);
            }
        }
        closeMsgMenu();
        await fetchMessages('new');
    };
    msgMenu.appendChild(del);

    console.log('isAdmin:', isAdmin, 'msg.author_id:', msg.author_id);
    if (isAdmin && msg.author_id != null) {
        const ban = document.createElement('div');
        ban.className = 'context-item';
        ban.textContent = '🚫 Zbanuj użytkownika + IP';
        ban.onclick = async () => {
            if (!confirm('Na pewno zbanować tego użytkownika?')) return;
            const res = await fetch(`/api/ban.php?user=${msg.author_id}`);
            const data = await res.json();
            if (!data.success) alert(data.error);
            else alert(data.message);
            closeMsgMenu();
            await fetchMessages('new');
        };
        msgMenu.appendChild(ban);
    }

    msgMenu.style.left = e.pageX + 'px';
    msgMenu.style.top = e.pageY + 'px';
    msgMenu.style.display = 'block';
}

const msgMenu = document.createElement('div');
msgMenu.className = 'context-menu';
msgMenu.style.position = 'absolute';
msgMenu.style.display = 'none';
msgMenu.style.background = '#2b2f33';
msgMenu.style.border = '1px solid #202225';
msgMenu.style.borderRadius = '6px';
msgMenu.style.padding = '4px 0';
msgMenu.style.zIndex = 1000;
document.body.appendChild(msgMenu);

const menu = document.createElement('div');
menu.className = 'context-menu';
menu.style.position = 'absolute';
menu.style.display = 'none';
menu.style.background = '#2b2f33';
menu.style.border = '1px solid #202225';
menu.style.borderRadius = '6px';
menu.style.padding = '4px 0';
menu.style.zIndex = 1000;
document.body.appendChild(menu);

/** @param {MouseEvent} e @param {any} ch @param {HTMLElement} btn */
function showChannelMenu(e, ch, btn) {
    e.preventDefault();
    menu.innerHTML = '';
    if (isAdmin) {
        const rename = document.createElement('div');
        rename.className = 'context-item';
        rename.textContent = '✏️ Zmień nazwę';
        rename.onclick = () => { renameChannel(ch.id); closeContextMenu(); };
        menu.appendChild(rename);

        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'context-item';
        deleteBtn.textContent = '🗑️ Usuń kanał';
        deleteBtn.onclick = () => { deleteChannel(ch.id); closeContextMenu(); };
        menu.appendChild(deleteBtn);
    }

    const copyName = document.createElement('div');
    copyName.className = 'context-item';
    copyName.textContent = '📋 Kopiuj nazwę';
    copyName.onclick = () => { copyText(ch.name); closeContextMenu(); };
    menu.appendChild(copyName);

    const copyId = document.createElement('div');
    copyId.className = 'context-item';
    copyId.textContent = '🆔 Kopiuj ID';
    copyId.onclick = () => { copyText(ch.id); closeContextMenu(); };
    menu.appendChild(copyId);

    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
    menu.style.display = 'block';
}

function closeMsgMenu() {
    msgMenu.style.display = 'none';
}

/** @param {string} text */
function copyText(text) {
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
    } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
        } catch {}
        document.body.removeChild(ta);
    }
}

document.addEventListener('click', e => {
    if (!msgMenu.contains(e.target)) closeMsgMenu();
});

function closeContextMenu() {
    const menu = document.querySelector('.context-menu');
    if (menu) menu.style.display = 'none';
}

loadChannels();


const toggleBtn = document.createElement('div');
toggleBtn.className = 'toggle-sidebar-btn';
toggleBtn.textContent = '☰';
toggleBtn.onclick = () => {
    document.querySelector('.sidebar').classList.toggle('show');
};
document.body.appendChild(toggleBtn);
