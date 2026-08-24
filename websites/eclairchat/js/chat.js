import { loadChannels, fetchMessagesUI, triggerFileUpload } from './ui.js';

if (!user.avatar_url) user.avatar_url = 'https://files.catbox.moe/fxlx35.gif';

document.addEventListener('DOMContentLoaded', async ()=>{
    await loadChannels();

    const attachBtn=document.getElementById('attach-btn');
    attachBtn.onclick=()=>triggerFileUpload();

    setInterval(()=>fetchMessagesUI('new'),3000);
});

const toggleBtn = document.createElement('div');
toggleBtn.className = 'toggle-sidebar-btn';
toggleBtn.textContent = '☰';
toggleBtn.onclick = () => {
    document.querySelector('.sidebar').classList.toggle('show');
};
document.body.appendChild(toggleBtn);
