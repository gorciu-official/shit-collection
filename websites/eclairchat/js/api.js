export async function fetchChannels() {
    const res = await fetch('/api/channels.php?channels=1');
    return res.json();
}

export async function fetchMessages(channelId, options = {}) {
    let url = `/?fetch=1&channel_id=${channelId}`;
    if (options.fromId) url += `&from_id=${options.fromId}`;
    if (options.beforeId) url += `&before_id=${options.beforeId}`;
    const res = await fetch(url);
    return res.json();
}

export async function sendMessage(channelId, message, attachmentUrls = []) {
    const body = new URLSearchParams({ message, channel_id: channelId, replies_to: 0 });
    attachmentUrls.forEach(u => body.append('attachment_urls[]', u));
    await fetch('/api/send.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body
    });
}

export async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file_uploader', file);
    const res = await fetch('/api/files.php', { method: 'POST', body: formData });
    const data = await res.json();
    return data.url;
}

export async function toggleReaction(messageId, emoji) {
    await fetch('/?react=1', {
        method: 'POST',
        body: new URLSearchParams({ message_id: messageId, emoji })
    });
}

export async function changePassword(newPass) {
    await fetch('/?change_password=1', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({ passwd: newPass })
    });
}

export async function deleteMessage(messageId) {
    const res = await fetch(`/api/delete_message.php?id=${messageId}`);
    return res.json();
}

export async function banUser(userId) {
    const res = await fetch(`/api/ban.php?user=${userId}`);
    return res.json();
}

export async function updateUsername(newName) {
    const res = await fetch('/api/user.php?update_username=1', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({ username: newName })
    });
    return res.json();
}

export async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch('/api/user.php', { method: 'POST', body: formData });
    return res.json();
}

/** @param {string} newDisplayName */
export async function updateDisplayName(newDisplayName) {
    const res = await fetch('/api/user.php?update_display_name=1', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({display_name: newDisplayName})
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Nie udało się zmienić display name');
    return data.display_name;
}