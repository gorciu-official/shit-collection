/**
 * Brooklen - an open-source alternative to World Wide Web created
 *  by Gorciu, which takes care about privacy.
 * 
 * (c) 2024 Gorciu
 */

async function main() {
    var element_state_loading = document.querySelector('.load-state');
    if (!element_state_loading) { return; }

    document.title = 'Brooklen - connecting (0% - setting up connection)';
    element_state_loading.textContent = '0% - setting up connection';
    if (!navigator.onLine) {
        document.title = 'Brooklen - connecting canceled';
        element_state_loading.textContent = 'canceled; restart the application when you will receive Internet access';
        return;
    }

    document.title = 'Brooklen - connecting (50% - checking repository)';
    element_state_loading.textContent = '50% - checking repository';
    var load_fetched = await fetch('https://raw.githubusercontent.com/gorciu-official/BrooklenIndex/refs/heads/main/list.json');
    if (!load_fetched.ok) {
        document.title = 'Brooklen - connecting canceled';
        element_state_loading.textContent = 'canceled; detected that Brooklen is blocked';
        return;
    }

    document.title = 'Brooklen';
    element_state_loading.classList.add('hidden');
    var element_browser = document.querySelector('browser');
    if (!element_browser) { return; }
    element_browser.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', main);