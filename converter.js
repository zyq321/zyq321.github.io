document.getElementById('binaryInput').addEventListener('input', function() {
    const binaryValue = this.value.trim();
    if (binaryValue) {
        if (!/^[01]+$/.test(binaryValue)) {
            alert('请输入有效的二进制数（只能包含0和1）');
            this.value = this.dataset.lastValue || '';
            return;
        }
        this.dataset.lastValue = binaryValue;
        const decimal = parseInt(binaryValue, 2);
        document.getElementById('decimalInput').value = decimal;
        document.getElementById('hexInput').value = decimal.toString(16).toUpperCase();
    } else {
        this.dataset.lastValue = '';
        document.getElementById('decimalInput').value = '';
        document.getElementById('hexInput').value = '';
    }
});

document.getElementById('decimalInput').addEventListener('input', function() {
    const decimalValue = this.value.trim();
    if (decimalValue) {
        if (!/^\d+$/.test(decimalValue)) {
            alert('请输入有效的十进制数（只能包含0-9）');
            this.value = this.dataset.lastValue || '';
            return;
        }
        this.dataset.lastValue = decimalValue;
        const decimal = parseInt(decimalValue, 10);
        document.getElementById('binaryInput').value = decimal.toString(2);
        document.getElementById('hexInput').value = decimal.toString(16).toUpperCase();
    } else {
        this.dataset.lastValue = '';
        document.getElementById('binaryInput').value = '';
        document.getElementById('hexInput').value = '';
    }
});

document.getElementById('hexInput').addEventListener('input', function() {
    const hexValue = this.value.trim();
    if (hexValue) {
        if (!/^[0-9A-Fa-f]+$/.test(hexValue)) {
            alert('请输入有效的十六进制数（只能包含0-9和A-F）');
            this.value = this.dataset.lastValue || '';
            return;
        }
        this.dataset.lastValue = hexValue;
        const decimal = parseInt(hexValue, 16);
        document.getElementById('binaryInput').value = decimal.toString(2);
        document.getElementById('decimalInput').value = decimal;
    } else {
        this.dataset.lastValue = '';
        document.getElementById('binaryInput').value = '';
        document.getElementById('decimalInput').value = '';
    }
});


// 保存状态到 localStorage
function saveState() {
    const state = {
        binary: document.getElementById('binaryInput').value,
        decimal: document.getElementById('decimalInput').value,
        hex: document.getElementById('hexInput').value
    };
    localStorage.setItem('converterState', JSON.stringify(state));
}

// 从 localStorage 恢复状态
function restoreState() {
    const state = localStorage.getItem('converterState');
    if (state) {
        const { binary, decimal, hex } = JSON.parse(state);
        document.getElementById('binaryInput').value = binary || '';
        document.getElementById('decimalInput').value = decimal || '';
        document.getElementById('hexInput').value = hex || '';
    }
}

// 在页面加载时恢复状态
document.addEventListener('DOMContentLoaded', restoreState);

// 在输入框值改变时保存状态
document.getElementById('binaryInput').addEventListener('input', saveState);
document.getElementById('decimalInput').addEventListener('input', saveState);
document.getElementById('hexInput').addEventListener('input', saveState);