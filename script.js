const timestampInput = document.getElementById('timestampInput');
const dateInput = document.getElementById('dateInput');
const timezoneSelect = document.getElementById('timezoneSelect');

function updateDateTime() {
    const timestamp = parseInt(timestampInput.value);
    if (!isNaN(timestamp)) {
        const utcDate = new Date(timestamp * 1000);
        const timezone = timezoneSelect.value;
        const formattedDate = utcDate.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: timezone
        }).replace(/\//g, '-');
        dateInput.value = formattedDate.replace(/,/g, '');
    }
}

function updateTimestamp() {
    const date = new Date(dateInput.value);
    if (!isNaN(date.getTime())) {
        const timezone = timezoneSelect.value;
        const utcDate = new Date(date.toLocaleString('en-US', { timeZone: timezone}));
        const timestamp = Math.floor(utcDate.getTime() / 1000);
        timestampInput.value = timestamp;
    }
}

timestampInput.addEventListener('input', function() {
    if (this.value === '') {
        dateInput.value = '';
        return;
    }
    updateDateTime();
});

dateInput.addEventListener('input', function() {
    if (this.value === '') {
        timestampInput.value = '';
        return;
    }
    updateTimestamp();
});

timezoneSelect.addEventListener('change', updateDateTime);

const currentTimeBtn = document.getElementById('currentTimeBtn');
currentTimeBtn.addEventListener('click', function() {
    const now = new Date();
    const timezone = timezoneSelect.value;
    const timestamp = Math.floor(now.getTime() / 1000);
    timestampInput.value = timestamp;
    updateDateTime();
});