document.addEventListener('DOMContentLoaded', function() {
    const startTimeInput = document.getElementById('startTime');
    const intervalTypeSelect = document.getElementById('intervalType');
    const intervalValueInput = document.getElementById('intervalValue');
    const endTimeInput = document.getElementById('endTime');
    const generateBtn = document.getElementById('generateBtn');
    const timePointsDiv = document.getElementById('timePoints');
    const countInfo = document.getElementById('countInfo');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const intervalHint = document.getElementById('intervalHint');

    // 更新提示文本
    function updateHint() {
        const type = intervalTypeSelect.value;
        const value = intervalValueInput.value;
        if (value) {
            intervalHint.textContent = `例如: 每${value}${type === 'minutes' ? '分钟' : '小时'}`;
        }
    }

    intervalTypeSelect.addEventListener('change', updateHint);
    intervalValueInput.addEventListener('input', updateHint);

    // 时间转换为分钟数
    function timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // 分钟数转换为时间字符串
    function minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60) % 24;
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    // 生成时间点
    function generateTimePoints() {
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;
        const intervalType = intervalTypeSelect.value;
        const intervalValue = parseInt(intervalValueInput.value);

        // 验证输入
        if (!startTime || !endTime || !intervalValue || intervalValue <= 0) {
            alert('请填写所有必要字段，并确保周期间隔大于0');
            return;
        }

        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);
        
        // 计算间隔分钟数
        const intervalMinutes = intervalType === 'minutes' ? intervalValue : intervalValue * 60;

        if (intervalMinutes <= 0 || intervalMinutes > 1440) {
            alert('周期间隔必须在1分钟到24小时之间');
            return;
        }

        // 生成时间点数组
        const timePoints = [];
        let currentMinutes = startMinutes;
        
        // 如果结束时间小于开始时间，说明跨越了午夜
        const adjustedEndMinutes = endMinutes < startMinutes ? endMinutes + 1440 : endMinutes;
        
        while (currentMinutes <= adjustedEndMinutes) {
            timePoints.push(minutesToTime(currentMinutes));
            currentMinutes += intervalMinutes;
        }

        // 显示结果
        displayTimePoints(timePoints);
    }

    // 显示时间点
    function displayTimePoints(timePoints) {
        if (timePoints.length === 0) {
            timePointsDiv.innerHTML = '<p class="error">没有生成任何时间点</p>';
            countInfo.textContent = '';
            copyAllBtn.style.display = 'none';
            return;
        }

        // 更新计数信息
        countInfo.textContent = `(共 ${timePoints.length} 个时间点)`;
        copyAllBtn.style.display = 'inline-block';

        // 创建时间点列表
        let html = '<div class="time-points-grid">';
        timePoints.forEach((time, index) => {
            html += `
                <div class="time-point-item" data-time="${time}">
                    <span class="time-index">${index + 1}</span>
                    <span class="time-value">${time}</span>
                    <button class="copy-btn" data-time="${time}">复制</button>
                </div>
            `;
        });
        html += '</div>';

        timePointsDiv.innerHTML = html;

        // 添加复制功能
        const copyButtons = timePointsDiv.querySelectorAll('.copy-btn');
        copyButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const time = this.getAttribute('data-time');
                copyToClipboard(time);
                this.textContent = '已复制!';
                setTimeout(() => {
                    this.textContent = '复制';
                }, 2000);
            });
        });
    }

    // 复制到剪贴板
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    // 复制所有时间点
    copyAllBtn.addEventListener('click', function() {
        const timeItems = timePointsDiv.querySelectorAll('.time-value');
        const allTimes = Array.from(timeItems).map(item => item.textContent).join('\n');
        
        copyToClipboard(allTimes);
        
        const originalText = this.textContent;
        this.textContent = '已复制全部!';
        setTimeout(() => {
            this.textContent = originalText;
        }, 2000);
    });

    // 生成按钮点击事件
    generateBtn.addEventListener('click', generateTimePoints);

    // 回车键快捷生成
    intervalValueInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateTimePoints();
        }
    });
});
