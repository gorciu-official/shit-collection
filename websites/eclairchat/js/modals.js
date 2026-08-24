const modals = new Map();

export function createModal(id, content) {
    if (modals.has(id)) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.2s;
    `;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        background: #2b2f33;
        border-radius: 8px;
        padding: 20px;
        max-width: 400px;
        width: 100%;
        color: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `;
    modal.innerHTML = content;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal(id);
    });

    requestAnimationFrame(() => overlay.style.opacity = 1);
    modals.set(id, overlay);
}

export function openModal(id) {
    const overlay = modals.get(id);
    if (overlay) overlay.style.display = 'flex';
}

export function closeModal(id) {
    const overlay = modals.get(id);
    if (overlay) {
        overlay.style.opacity = 0;
        setTimeout(() => overlay.remove(), 200);
        modals.delete(id);
    }
}
