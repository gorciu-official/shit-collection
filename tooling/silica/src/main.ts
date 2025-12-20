const HOVER_SECONDS_REQUIRED = 1.5;

let lastContextWord: string | null = null;
let currentMouseTimeout: number | null = null;

function getWordUnderCursor(x: number, y: number) {
    let range: Range;
    if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(x, y);
    } else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(x, y);
        if (pos) {
            range = document.createRange();
            range.setStart(pos.offsetNode, pos.offset);
            range.setEnd(pos.offsetNode, pos.offset);
        }
    }

    if (!range || !range.startContainer || range.startContainer.nodeType !== Node.TEXT_NODE) {
        return null;
    }

    let rects = range.getClientRects();

    if (rects.length === 0) {
        const newRange = document.createRange();
        const textLength = range.startContainer.textContent.length;
        const startOffset = range.startOffset;
        if (startOffset < textLength) {
            newRange.setStart(range.startContainer, startOffset);
            newRange.setEnd(range.startContainer, startOffset + 1);
            rects = newRange.getClientRects();
            if (rects.length === 0) {
                return null;
            }
            range = newRange;
        } else {
            return null;
        }
    }

    const rect = rects[0];

    const margin = 3;
    if (x < rect.left - margin || x > rect.right + margin || y < rect.top - margin || y > rect.bottom + margin) {
        return null;
    }

    const text = range.startContainer.textContent;
    const offset = range.startOffset;

    const leftPart = text.slice(0, offset);
    const rightPart = text.slice(offset);

    const leftWordMatch = leftPart.match(/[\wąćęłńóśźż]+$/i);
    const rightWordMatch = rightPart.match(/^[\wąćęłńóśźż]+/i);

    const leftWord = leftWordMatch ? leftWordMatch[0] : '';
    const rightWord = rightWordMatch ? rightWordMatch[0] : '';

    const word = leftWord + rightWord;

    return word.length > 0 ? word : null;
}

function advertisementsStartup() {
    fetch().catch(() => {
        if (navigator.onLine) {
            alert('Failed to fetch (delicate) advertisements. If you are contributing to adblockers, please give up, because we\'re trying to make advertisements, that are helpful and that are ALWAYS possible to close.');
        }
    });

    document.addEventListener('mousemove', (e) => {
        let word = getWordUnderCursor(e.clientX, e.clientY);
        if (!word) return;
        word = word.toLowerCase().trim();

        if (currentMouseTimeout !== null) {
            clearInterval(currentMouseTimeout);
        }

        currentMouseTimeout = setTimeout(() => {
            if (word == lastContextWord) return;
            lastContextWord = word;
        }, HOVER_SECONDS_REQUIRED * 1000);
    });
}

advertisementsStartup();

export {};