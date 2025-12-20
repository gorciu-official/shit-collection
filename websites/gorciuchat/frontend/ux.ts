function autoExpand(textarea: HTMLTextAreaElement, maxLines = 6): void {
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight || '20');
    textarea.style.overflowY = 'hidden';

    const resize = () => {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        const maxHeight = lineHeight * maxLines;    

        if (scrollHeight > maxHeight) {
            textarea.style.height = `${maxHeight}px`;
            textarea.style.overflowY = 'auto';
        } else {
            textarea.style.height = `${scrollHeight}px`;
            textarea.style.overflowY = 'hidden';
        }
    };

    textarea.addEventListener('input', resize);
}

export { autoExpand };