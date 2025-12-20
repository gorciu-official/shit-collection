import { IDE_NAME } from "./constants";

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('title')!.textContent = IDE_NAME;
});