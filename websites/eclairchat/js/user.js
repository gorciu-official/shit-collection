import { createModal, closeModal } from './modals.js';
import { uploadAvatar, changePassword, updateUsername, updateDisplayName } from './api.js';
import { escapeHtml } from './tool.js';

export function openUserModal(user) {
    const content = `
        <h2 style="margin-bottom:15px;">Twój profil</h2>
        <img id="avatar-preview" alt="User profile avatar" src="${user.avatar_url ?? 'https://files.catbox.moe/fxlx35.gif'}" style="border-radius:50%;max-width:128px;aspect-ratio:1/1;margin-bottom:10px;">
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">
            <label>Username (tylko numery i cyfry):</label>
            <input type="text" id="username-input" value="${escapeHtml(user.username)}" pattern="[a-zA-Z0-9_]+" title="Tylko litery, cyfry i podkreślenia">
            <label>Nazwa wyświetlana:</label>
            <input type="text" id="displayname-input" value="${escapeHtml(user.display_name ?? '')}">
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">
            <label>Nowe profilowe:</label>
            <input type="file" id="avatar-input">
            <label>Nowe hasło:</label>
            <input type="password" id="password-input">
        </div>
        <div style="display:flex;gap:6px;">
            <button id="save-user-btn">Zapisz</button>
            <button id="logout-btn">Wyloguj</button>
        </div>
    `;
    createModal('user-modal', content);
    const overlay = document.querySelector('.modal-overlay');

    const avatarInput = overlay.querySelector('#avatar-input');
    const avatarPreview = overlay.querySelector('#avatar-preview');
    const passwordInput = overlay.querySelector('#password-input');
    const saveBtn = overlay.querySelector('#save-user-btn');
    const logoutBtn = overlay.querySelector('#logout-btn');
    const usernameInput = overlay.querySelector('#username-input');
    const displayNameInput = overlay.querySelector('#displayname-input');

    avatarInput.onchange = () => {
        if (avatarInput.files.length) {
            avatarPreview.src = URL.createObjectURL(avatarInput.files[0]);
        }
    };

    saveBtn.onclick = async () => {
        try {
            if (usernameInput.value && usernameInput.value !== user.username) {
                const username = usernameInput.value.trim();
                if (!/^[a-zA-Z0-9_]+$/.test(username)) throw new Error('Username może zawierać tylko litery, cyfry i podkreślenia');
                await updateUsername(username);
                user.username = username;
            }

            if (displayNameInput.value && displayNameInput.value !== (user.display_name ?? '')) {
                const displayName = displayNameInput.value.trim();
                await updateDisplayName(displayName);
                user.display_name = displayName;
            }

            if (avatarInput.files.length) {
                const avatarUrl = await uploadAvatar(avatarInput.files[0]);
                user.avatar_url = avatarUrl;
                avatarPreview.src = avatarUrl;
            }

            if (passwordInput.value) {
                await changePassword(passwordInput.value);
                passwordInput.value = '';
            }

            alert('Profil został zaktualizowany!');
            closeModal('user-modal');
        } catch (err) {
            alert(err.message || 'Błąd przy aktualizacji profilu');
        }
    };

    logoutBtn.onclick = () => {
        window.location.href = '/logout';
    };
}