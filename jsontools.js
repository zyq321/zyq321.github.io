// JSON 工具 —— 压缩/解压 + 转义/反转义 两个独立选择框

// ====== 核心操作函数 ======

function compressJSON(input) {
    try {
        const parsed = JSON.parse(input);
        return { success: true, result: JSON.stringify(parsed) };
    } catch (e) {
        return { success: false, result: '', error: 'JSON 解析失败：' + e.message };
    }
}

function decompressJSON(input) {
    try {
        const parsed = JSON.parse(input);
        return { success: true, result: JSON.stringify(parsed, null, 2) };
    } catch (e) {
        return { success: false, result: '', error: 'JSON 解析失败：' + e.message };
    }
}

function escapeJSON(input) {
    try {
        return { success: true, result: JSON.stringify(input).slice(1, -1) };
    } catch (e) {
        return { success: false, result: '', error: '转义失败：' + e.message };
    }
}

function unescapeJSON(input) {
    // 1) 把输入当作转义字符串包在引号里解析
    try {
        return { success: true, result: JSON.parse('"' + input + '"') };
    } catch (_) {}
    // 2) 把输入整体当作一个 JSON 字符串值来解析
    try {
        const v = JSON.parse(input);
        if (typeof v === 'string') return { success: true, result: v };
    } catch (_) {}
    return { success: false, result: '', error: '反转义失败：输入不是有效的转义字符串' };
}

// 操作映射
var ops = {
    compress:   { fn: compressJSON,   label: '压缩' },
    decompress: { fn: decompressJSON, label: '解压（格式化）' },
    escape:     { fn: escapeJSON,     label: '转义' },
    unescape:   { fn: unescapeJSON,   label: '反转义' },
};

// ====== DOM 元素 ======
var jsonInput   = document.getElementById('jsonInput');
var jsonOutput  = document.getElementById('jsonOutput');
var errorMsg    = document.getElementById('errorMsg');
var outputMsg   = document.getElementById('outputMsg');
var copyBtn     = document.getElementById('copyBtn');
var executeBtn  = document.getElementById('executeBtn');
var clearBtn    = document.getElementById('clearBtn');
var compressSel = document.getElementById('compressSelect');
var escapeSel   = document.getElementById('escapeSelect');

// ====== 执行 ======
executeBtn.addEventListener('click', function () {
    var input = jsonInput.value;
    if (!input.trim()) {
        errorMsg.textContent = '请先输入内容';
        outputMsg.textContent = '';
        return;
    }

    var compressVal = compressSel.value;
    var escapeVal   = escapeSel.value;

    if (compressVal === 'none' && escapeVal === 'none') {
        errorMsg.textContent = '请至少选择一个操作';
        outputMsg.textContent = '';
        return;
    }

    errorMsg.textContent = '';
    outputMsg.textContent = '';

    var current = input;
    var appliedLabels = [];

    // 按顺序执行：先压缩/解压，再转义/反转义
    var steps = [compressVal, escapeVal];
    for (var i = 0; i < steps.length; i++) {
        var key = steps[i];
        if (key === 'none') continue;
        var op = ops[key];
        if (!op) continue;
        var res = op.fn(current);
        if (!res.success) {
            errorMsg.textContent = '「' + op.label + '」出错：' + res.error;
            jsonOutput.value = '';
            copyBtn.style.display = 'none';
            return;
        }
        current = res.result;
        appliedLabels.push(op.label);
    }

    jsonOutput.value = current;
    outputMsg.textContent = '执行成功（' + appliedLabels.join(' → ') + '）';
    copyBtn.style.display = 'inline-block';
});

// ====== 复制结果 ======
copyBtn.addEventListener('click', function () {
    if (!jsonOutput.value) return;
    copyToClipboard(jsonOutput.value);
    outputMsg.textContent = '已复制到剪贴板';
});

// ====== 清空 ======
clearBtn.addEventListener('click', function () {
    jsonInput.value = '';
    jsonOutput.value = '';
    errorMsg.textContent = '';
    outputMsg.textContent = '';
    copyBtn.style.display = 'none';
    compressSel.value = 'none';
    escapeSel.value = 'none';
});

// ====== 输入时清除提示 ======
jsonInput.addEventListener('input', function () {
    errorMsg.textContent = '';
    outputMsg.textContent = '';
});

// ====== 选择框改变时清除提示 ======
compressSel.addEventListener('change', function () {
    errorMsg.textContent = '';
    outputMsg.textContent = '';
});
escapeSel.addEventListener('change', function () {
    errorMsg.textContent = '';
    outputMsg.textContent = '';
});

// ====== 剪贴板工具 ======
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(function () { fallbackCopy(text); });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(ta);
}
