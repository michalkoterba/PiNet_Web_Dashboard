document.addEventListener('DOMContentLoaded', () => {

    const POLLING_INTERVAL = 10000; // 10 seconds
    const POLLING_DURATION = 120000; // 2 minutes

    /**
     * Updates the UI for a specific host card.
     * @param {HTMLElement} hostCard The card element for the host.
     * @param {string} status The status to display ('online', 'offline', 'checking', 'waking').
     * @param {string} [message] An optional message to display.
     */
    function updateHostStatus(hostCard, status, message = '') {
        const statusIndicator = hostCard.querySelector('.status-indicator');
        const statusText = hostCard.querySelector('.status-text');
        const wakeUpBtn = hostCard.querySelector('.wake-up-btn');

        // Reset classes
        statusIndicator.className = 'status-indicator';

        switch (status) {
            case 'online':
                statusIndicator.classList.add('online');
                statusText.textContent = 'Online';
                wakeUpBtn.style.display = 'none';
                break;
            case 'offline':
                statusIndicator.classList.add('offline');
                statusText.textContent = message || 'Offline';
                wakeUpBtn.style.display = 'block';
                break;
            case 'waking':
                statusIndicator.classList.add('checking'); // Spinner
                statusText.textContent = 'Waking up...';
                wakeUpBtn.style.display = 'none';
                break;
            case 'checking':
            default:
                statusIndicator.classList.add('checking'); // Spinner
                statusText.textContent = 'Checking...';
                wakeUpBtn.style.display = 'none';
                break;
        }
    }

    /**
     * Fetches the status of a single host.
     * @param {HTMLElement} hostCard The card element for the host.
     */
    async function checkHostStatus(hostCard) {
        const ip = hostCard.dataset.ip;
        if (!ip) return;

        try {
            const response = await fetch(`/api/status/${ip}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            updateHostStatus(hostCard, data.status);
        } catch (error) {
            console.error(`Error checking status for ${ip}:`, error);
            updateHostStatus(hostCard, 'offline', 'Error');
        }
    }

    /**
     * Sends a Wake-on-LAN request for a host.
     * @param {HTMLElement} hostCard The card element for the host.
     */
    async function wakeHost(hostCard) {
        const mac = hostCard.dataset.mac;
        if (!mac) return;

        updateHostStatus(hostCard, 'waking');

        try {
            const response = await fetch(`/api/wake/${mac}`, { method: 'POST' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.status === 'success') {
                startPolling(hostCard);
            } else {
                updateHostStatus(hostCard, 'offline', 'Wake-up failed');
            }
        } catch (error) {
            console.error(`Error waking host ${mac}:`, error);
            updateHostStatus(hostCard, 'offline', 'Wake-up failed');
        }
    }

    /**
     * Starts polling for a host's status after a wake-up attempt.
     * @param {HTMLElement} hostCard The card element for the host.
     */
    function startPolling(hostCard) {
        const ip = hostCard.dataset.ip;
        let pollingEndTime = Date.now() + POLLING_DURATION;

        const intervalId = setInterval(async () => {
            if (Date.now() > pollingEndTime) {
                clearInterval(intervalId);
                updateHostStatus(hostCard, 'offline', 'Wake-up failed');
                return;
            }

            try {
                const response = await fetch(`/api/status/${ip}`);
                const data = await response.json();
                if (data.status === 'online') {
                    clearInterval(intervalId);
                    updateHostStatus(hostCard, 'online');
                }
            } catch (error) {
                // Continue polling even if one check fails
                console.error(`Polling error for ${ip}:`, error);
            }
        }, POLLING_INTERVAL);
    }

    // --- Initialization ---

    const hostCards = document.querySelectorAll('.host-card');

    // Initial status check for all hosts
    hostCards.forEach(checkHostStatus);

    // Add click listeners for all "Wake Up" buttons
    hostCards.forEach(hostCard => {
        const wakeUpBtn = hostCard.querySelector('.wake-up-btn');
        wakeUpBtn.addEventListener('click', () => wakeHost(hostCard));
    });

});
