import { fetchChannels, fetchMessages, sendMessage, uploadFile, toggleReaction, deleteMessage, banUser } from './api.js';
import { openModal, closeModal } from './modals.js';
import { openUserModal } from './user.js';
import { escapeHtml } from './tool.js';

const messagesDiv = document.getElementById('messages');
const channelsDiv = document.getElementById('channels');
const input = document.getElementById('msgInput');
const form = document.getElementById('msgForm');

let currentChannel = null;
let lastMessageId = 0;
let oldestMessageId = 0;
let isLoading = false;
let lastGroupDiv = null;

if (typeof window.isAdmin === 'undefined') window.isAdmin = false;
let isAdmin = window.isAdmin;
const attachments = [];
const attachmentPreview = document.createElement('div');
attachmentPreview.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin:6px 0;';
form.insertBefore(attachmentPreview, input.nextSibling);

// ----------------------- CHANNELS -----------------------
export async function loadChannels() {
    channelsDiv.innerHTML = '<div class="before-channels"></div><div class="channel-wrapper"></div><div></div>';
    const wrapper = channelsDiv.querySelector('.channel-wrapper');

    // Admin buttons
    if (isAdmin) {
        console.log('adm buttons');
        const addBtn = document.createElement('div');
        addBtn.className = 'channel add-channel';
        addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Nowy kanał';
        addBtn.onclick = async () => {
            const name = prompt('Nazwa nowego kanału:');
            if (!name?.trim()) return;
            await fetch('/api/channels.php?create_channel=1', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({name: name.trim()})
            });
            await loadChannels();
        };
        channelsDiv.querySelector('.before-channels').appendChild(addBtn);
    }

    const passBtn = document.createElement('div');
    passBtn.className = 'channel add-channel';
    passBtn.innerHTML = '<i class="fa-solid fa-circle-user"></i> Twoje konto';
    passBtn.onclick = async () => {
        openUserModal(user);
    };
    channelsDiv.querySelector('.before-channels').appendChild(passBtn);

    // Load channels
    const data = await fetchChannels();
    data.forEach(c => {
        const btn = document.createElement('div');
        btn.className = 'channel';
        btn.dataset.id = c.id;
        btn.draggable = true;
        btn.innerHTML = `<i class="fa-solid fa-hashtag"></i> ${escapeHtml(c.name)}`;
        btn.onclick = () => switchChannel(c.id, btn);
        btn.oncontextmenu = e => showChannelMenu(e, c, btn);
        wrapper.appendChild(btn);

        // Drag & Drop
        btn.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', c.id);
            btn.classList.add('dragging');
        });
        btn.addEventListener('dragend', e => btn.classList.remove('dragging'));
    });

    // Drag over / drop
    wrapper.addEventListener('dragover', e => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        if (!dragging) return;
        const afterElement = Array.from(wrapper.children)
            .filter(el => el !== dragging)
            .reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = e.clientY - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) return {offset, element: child};
                return closest;
            }, {offset: Number.NEGATIVE_INFINITY}).element;
        if (afterElement) wrapper.insertBefore(dragging, afterElement);
        else wrapper.appendChild(dragging);
    });

    wrapper.addEventListener('drop', async e => {
        e.preventDefault();
        const order = Array.from(wrapper.children).map((el, pos) => ({id: el.dataset.id, pos}));
        for (const o of order) {
            await fetch(`/api/channels.php?move_channel=${o.id}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({position: o.pos})
            });
        }
    });
}

// ----------------------- SWITCH CHANNEL -----------------------
export async function switchChannel(id, btn) {
    lastGroupDiv = null;
    currentChannel = id;
    lastMessageId = 0;
    oldestMessageId = 0;
    messagesDiv.innerHTML = '';
    document.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    await fetchMessagesUI('initial');
}

// ----------------------- MESSAGES -----------------------
export async function fetchMessagesUI(mode='new') {
    if (!currentChannel || isLoading) return;
    isLoading = true;

    const options = {};
    if (mode==='new' && lastMessageId) options.fromId = lastMessageId;
    if (mode==='older' && oldestMessageId) options.beforeId = oldestMessageId;

    const data = await fetchMessages(currentChannel, options);
    if (!Array.isArray(data) || data.length === 0) { isLoading = false; return; }

    const minId = data[0].id;
    const maxId = data[data.length-1].id;
    if (!oldestMessageId || minId < oldestMessageId) oldestMessageId = minId;
    if (!lastMessageId || maxId > lastMessageId) lastMessageId = maxId;

    if (mode==='older') {
        const scrollPos = messagesDiv.scrollHeight - messagesDiv.scrollTop;
        for (const m of data.reverse()) messagesDiv.insertBefore(createMessageElement(m), messagesDiv.firstChild);
        messagesDiv.scrollTop = messagesDiv.scrollHeight - scrollPos;
    } else {
        const atBottom = messagesDiv.scrollTop + messagesDiv.clientHeight >= messagesDiv.scrollHeight - 10;
        for (const m of data) messagesDiv.appendChild(createMessageElement(m));
        if (atBottom) messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    isLoading = false;
}

// ----------------------- MESSAGE ELEMENT -----------------------
let lastAuthorId = null;
let lastMessageTime = 0;
let lastChannelId = 0;

export function createMessageElement(m) {
    const now = m.created_at ? new Date(m.created_at * 1000).getTime() : Date.now();
    const sameAuthor = m.author_id === lastAuthorId && (now - lastMessageTime) <= 2 * 60 * 1000;

    let div;
    let header;

    if (sameAuthor && lastGroupDiv && m.content.trim() !== 'ej' && m.channel_id === lastChannelId) {
        div = lastGroupDiv;
        header = div.querySelector('.message-header');
    } else {
        div = document.createElement('div');
        div.className = 'message-group';
        lastGroupDiv = div;

        header = document.createElement('div');
        header.className = 'message-header';
        header.style.cssText = `
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
            margin-bottom: 4px;
        `;

        const avatar = document.createElement('img');
        avatar.src = m.avatar_url ?? 'https://files.catbox.moe/fxlx35.gif';
        avatar.style.cssText = `
            width: 32px;
            height: 32px;
            border-radius: 50%;
            flex-shrink: 0;
        `;

        const nameDiv = document.createElement('div');
        nameDiv.style.cssText = 'display:flex; flex-direction:column; justify-content:center; max-width:calc(100% - 40px);';
        const name = document.createElement('p');
        name.innerHTML = `<strong style="display:inline;">${escapeHtml(m.display_name ?? m.username)}</strong> <span style="color:var(--text-dim);">(@${m.username})</span>`;
        const time = document.createElement('small');
        time.textContent = new Date(m.created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        time.style.color = '#999';
        nameDiv.appendChild(name);
        nameDiv.appendChild(time);

        header.appendChild(avatar);
        header.appendChild(nameDiv);
        div.appendChild(header);
    }

    const msgDiv = document.createElement('div');
    msgDiv.className = 'message';
    msgDiv.dataset.id = m.id;
    msgDiv.innerHTML = `<span class="message-text">${renderMarkdown(m.content)}</span>`;

    // attachments
    if (m.attachments?.length) {
        const attDiv = document.createElement('div');
        attDiv.style.cssText = 'display:flex;flex-direction:column;margin-top:4px;';
        for (const a of m.attachments) {
            const link = document.createElement('a');
            link.href = a.file_url;
            link.target = "_blank";
            if (a.file_url.match(/\.(jpe?g|gif|png|webp)$/i)) {
                const img = document.createElement('img');
                img.src = a.file_url;
                img.style.maxWidth = '200px';
                img.style.borderRadius = '8px';
                img.style.marginTop = '4px';
                link.appendChild(img);
            } else {
                link.textContent = a.file_name;
                link.style.color = '#7289da';
                link.style.marginTop = '4px';
            }
            attDiv.appendChild(link);
        }
        msgDiv.appendChild(attDiv);
    }

    // reactions
    const reactionsDiv = document.createElement('div');
    reactionsDiv.className = 'reactions';
    let base_css = 'display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;';
    let hadReactions = false;

    for (const r of m.reactions) {
        hadReactions = true;
        const span = document.createElement('div');
        span.style.cssText = 'display:inline-flex;align-items:center;padding:3px 6px;background:#202225;border-radius:10px;cursor:pointer;font-size:14px;';
        span.textContent = `${r.emoji} ${r.count}`;
        span.onclick = async () => {
            await toggleReaction(m.id, r.emoji);
            await refreshReactions(m.id, reactionsDiv);
        };
        reactionsDiv.appendChild(span);
    }
    reactionsDiv.style.cssText = base_css + (hadReactions ? '' : 'display:none;');
    msgDiv.appendChild(reactionsDiv);

    msgDiv.oncontextmenu = e => showMessageMenu(e, m, msgDiv);

    div.appendChild(msgDiv);

    lastAuthorId = m.author_id;
    lastMessageTime = now;
    lastChannelId = m.channel_id;

    //scheduleReactionRefresh(m.id, reactionsDiv);

    return div;
}

// ----------------------- UTIL -----------------------
export function renderMarkdown(text) {
    text=escapeHtml(text);
    text=text.replace(/^### (.*$)/gim,'<h3>$1</h3>')
             .replace(/^## (.*$)/gim,'<h2>$1</h2>')
             .replace(/^# (.*$)/gim,'<h1>$1</h1>')
             .replace(/^> (.*$)/gim,'<blockquote>$1</blockquote>')
             .replace(/\*\*\*(.*?)\*\*\*/gim,'<b><i>$1</i></b>')
             .replace(/\*\*(.*?)\*\*/gim,'<b>$1</b>')
             .replace(/\*(.*?)\*/gim,'<i>$1</i>')
             .replace(/~~(.*?)~~/gim,'<del>$1</del>')
             .replace(/```([\s\S]*?)```/gim,'<pre><code>$1</code></pre>')
             .replace(/`([^`]+)`/gim,'<code>$1</code>')
             .replace(/^\s*[-*] (.*$)/gim,'<li>$1</li>')
             .replace(/(<li>.*<\/li>)/gims,'<ul>$1</ul>')
             .replace(/\n/g,'<br>');
    return text;
}

// ----------------------- MESSAGE CONTEXT MENU -----------------------
const msgMenu = document.createElement('div');
msgMenu.className='context-menu';
msgMenu.style.cssText='position:absolute;display:none;background:#2b2f33;border:1px solid #202225;border-radius:6px;padding:4px 0;z-index:1000;';
document.body.appendChild(msgMenu);

export function showMessageMenu(e,msg,msgDiv){
    e.preventDefault();
    msgMenu.innerHTML='';

    const reactOnMsg = document.createElement('div');
    reactOnMsg.className='context-item';
    reactOnMsg.textContent='👍 Zareaguj emotką';
    reactOnMsg.onclick = async () => {
        let r = { emoji: prompt('Emoji (domyślne to 👍):')?.trim() ?? '👍', count: 1 };
        await toggleReaction(msg.id, r.emoji);
        const reactionsDiv = msgDiv.querySelector('.reactions');
        const span = document.createElement('div');
        span.style.cssText = 'display:inline-flex;align-items:center;padding:3px 6px;background:#202225;border-radius:10px;cursor:pointer;font-size:14px;';
        span.textContent = `${r.emoji} ${r.count}`;
        span.onclick = async () => {
            await toggleReaction(m.id, r.emoji);
            await refreshReactions(m.id, reactionsDiv);
        };
        reactionsDiv.appendChild(span);
    };
    msgMenu.appendChild(reactOnMsg);

    const copyId = document.createElement('div');
    copyId.className='context-item';
    copyId.textContent='🆔 Kopiuj ID';
    copyId.onclick=()=>{ navigator.clipboard.writeText(msg.id); closeMsgMenu(); };
    msgMenu.appendChild(copyId);

    const copyContent = document.createElement('div');
    copyContent.className='context-item';
    copyContent.textContent='📋 Kopiuj treść';
    copyContent.onclick=()=>{ navigator.clipboard.writeText(msg.content); closeMsgMenu(); };
    msgMenu.appendChild(copyContent);

    const del = document.createElement('div');
    del.className='context-item';
    del.textContent='🗑️ Usuń wiadomość';
    del.onclick=async()=>{
        const res=await deleteMessage(msg.id);
        if(!res.success) alert(res.error);
        closeMsgMenu();
        msgDiv.remove();
        await fetchMessagesUI('new');
    };
    msgMenu.appendChild(del);

    if(isAdmin && msg.author_id!=null){
        const ban=document.createElement('div');
        ban.className='context-item';
        ban.textContent='⛔ Zbanuj użytkownika';
        ban.onclick=async()=>{
            await banUser(msg.author_id);
            closeMsgMenu();
        };
        msgMenu.appendChild(ban);
    }

    msgMenu.style.left=`${e.pageX}px`;
    msgMenu.style.top=`${e.pageY}px`;
    msgMenu.style.display='block';
}

function closeMsgMenu(){
    msgMenu.style.display='none';
}
document.addEventListener('click',()=>msgMenu.style.display='none');

// ----------------------- CHANNEL CONTEXT MENU -----------------------
function showChannelMenu(e, channel, btn) {
    e.preventDefault();

    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.cssText = 'position:absolute;background:#2b2f33;border:1px solid #202225;border-radius:6px;padding:4px 0;z-index:1000;';
    document.body.appendChild(menu);

    function createItem(text, onClick) {
        const item = document.createElement('div');
        item.className = 'context-item';
        item.textContent = text;
        item.onclick = async () => { await onClick(); menu.remove(); };
        menu.appendChild(item);
    }

    createItem('✏️ Zmień nazwę', async () => {
        const name = prompt('Nowa nazwa kanału', channel.name);
        if (!name) return;
        try {
            const res = await fetch(`/api/channels.php?rename_channel=${channel.id}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({name})
            });
            const data = await res.json();
            if (!data.success) alert(data.error || 'Nie udało się zmienić nazwy');
            await loadChannels();
        } catch (err) { console.error(err); alert('Błąd sieci'); }
    });

    createItem('🗑️ Usuń kanał', async () => {
        if (!confirm('Na pewno chcesz usunąć kanał?')) return;
        try {
            const res = await fetch(`/api/channels.php?delete_channel=${channel.id}`);
            const data = await res.json();
            if (!data.success) alert(data.error || 'Nie udało się usunąć kanału');
            await loadChannels();
        } catch (err) { console.error(err); alert('Błąd sieci'); }
    });

    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;

    menu.addEventListener('click', e => e.stopPropagation());
    document.addEventListener('click', () => menu.remove(), {once:true});
}

// ----------------------- ATTACHMENTS -----------------------
const fileInput=document.createElement('input');
fileInput.type='file';
fileInput.multiple=true;
fileInput.style.display='none';
fileInput.onchange=async ()=>{
    for(const f of fileInput.files){
        const url=await uploadFile(f);
        attachments.push(url);
        const preview=document.createElement('div');
        preview.textContent=f.name;
        preview.style.cssText='background:#202225;padding:2px 6px;border-radius:4px;';
        attachmentPreview.appendChild(preview);
    }
};
form.appendChild(fileInput);

export function triggerFileUpload(){
    fileInput.click();
}

// ----------------------- SEND MESSAGE -----------------------
let blocked_form_submit = false;
form.onsubmit=async e=>{
    e.preventDefault();
    if (blocked_form_submit) {
        return alert('Zaczekaj aż twoja wiadomość się wyśle.');
    }
    if(!input.value.trim() && attachments.length===0) return;
    blocked_form_submit = true;
    let input_value = `${input.value}${false ? 'x' : ''}`; // this avoids the js to create a reference to input.value
    input.value = '';
    await sendMessage(currentChannel, input_value, attachments);
    attachments.length=0;
    attachmentPreview.innerHTML='';
    blocked_form_submit = false;
    await fetchMessagesUI('new');
};

// ----------------------- SCROLL LOAD -----------------------
messagesDiv.addEventListener('scroll',async ()=>{
    if(messagesDiv.scrollTop<100 && !isLoading){
        await fetchMessagesUI('older');
    }
});
