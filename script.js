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
    const dateStr = dateInput.value;
    const timezone = timezoneSelect.value;
    
    // 解析日期字符串，格式为：YYYY-MM-DD HH:mm:ss
    const [datePart, timePart] = dateStr.split(' ');
    if (!datePart || !timePart) return;
    
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);
    
    // 创建Date对象，注意月份需要减1
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    
    // 获取时区偏移量（分钟）
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        timeZoneName: 'longOffset'
    });
    const timeZoneOffset = formatter.format(date).match(/GMT([+-])(\d+):(\d+)/);
    
    let offsetMinutes = 0;
    if (timeZoneOffset) {
        const sign = timeZoneOffset[1] === '+' ? 1 : -1;
        const hours = parseInt(timeZoneOffset[2]);
        const minutes = parseInt(timeZoneOffset[3]);
        offsetMinutes = sign * (hours * 60 + minutes);
    }
    
    // 调整时间（减去时区偏移，因为我们要转换为UTC时间）
    const timestamp = Math.floor(date.getTime() / 1000) - offsetMinutes * 60;
    timestampInput.value = timestamp;
}

function saveState() {
    const state = {
        timestamp: timestampInput.value,
        date: dateInput.value,
        timezone: timezoneSelect.value
    };
    localStorage.setItem('timeConverterState', JSON.stringify(state));
}

function restoreState() {
    const state = localStorage.getItem('timeConverterState');
    if (state) {
        const { timestamp, date, timezone } = JSON.parse(state);
        timestampInput.value = timestamp || '';
        dateInput.value = date || '';
        timezoneSelect.value = timezone || 'Asia/Shanghai';
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

// 在页面加载时恢复状态
document.addEventListener('DOMContentLoaded', restoreState);

// 在值改变时保存状态
timestampInput.addEventListener('input', saveState);
dateInput.addEventListener('input', saveState);
timezoneSelect.addEventListener('change', saveState);
currentTimeBtn.addEventListener('click', saveState);
