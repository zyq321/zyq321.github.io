// JSON 管道工具 —— 反转义 / 解压 / 压缩 / 转义 任意组合

// ====== 核心操作函数 ======
// 每个函数签名: (input: string) => { success: boolean, result: string, error: string }

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

function decompressJSON(input) {
    try {
        const parsed = JSON.parse(input);
        return { success: true, result: JSON.stringify(parsed, null, 2) };
    } catch (e) {
        return { success: false, result: '', error: 'JSON 解析失败：' + e.message };
    }
}

function compressJSON(input) {
    try {
        const parsed = JSON.parse(input);
        return { success: true, result: JSON.stringify(parsed) };
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

// 操作顺序（与管道 UI 顺序一致：反转义 → 解压 → 压缩 → 转义）
var steps = [
    { key: 'unescape',   fn: unescapeJSON,   label: '反转义' },
    { key: 'decompress', fn: decompressJSON, label: '解压' },
    { key: 'compress',   fn: compressJSON,   label: '压缩' },
    { key: 'escape',     fn: escapeJSON,     label: '转义' },
];

// ====== UI 交互 ======
var jsonInput   = document.getElementById('jsonInput');
var jsonOutput  = document.getElementById('jsonOutput');
var errorMsg    = document.getElementById('errorMsg');
var outputMsg   = document.getElementById('outputMsg');
var copyBtn     = document.getElementById('copyBtn');
var executeBtn  = document.getElementById('executeBtn');
var clearBtn    = document.getElementById('clearBtn');
var toggles     = document.querySelectorAll('.pipe-toggle');

// 切换开关样式
toggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
        this.classList.toggle('on');
        this.classList.toggle('off');
        updateArrows();
    });
});

function updateArrows() {
    var active = [];
    toggles.forEach(function (t) { active.push(t.classList.contains('on')); });
    var arrows = [document.getElementById('arrow1'), document.getElementById('arrow2'), document.getElementById('arrow3')];
    arrows.forEach(function (a) { a.classList.remove('active'); });
    for (var i = 0; i < arrows.length; i++) {
        if (active[i] && active[i + 1]) arrows[i].classList.add('active');
    }
}

function getActiveSteps() {
    var active = [];
    toggles.forEach(function (t) {
        if (t.classList.contains('on')) active.push(t.dataset.step);
    });
    return active;
}

// 执行管道
executeBtn.addEventListener('click', function () {
    var input = jsonInput.value;
    if (!input.trim()) {
        errorMsg.textContent = '请先输入内容';
        return;
    }

    var pipe = getActiveSteps();
    if (pipe.length === 0) {
        errorMsg.textContent = '请至少选择一个操作';
        return;
    }

    errorMsg.textContent = '';
    outputMsg.textContent = '';

    var current = input;
    for (var i = 0; i < pipe.length; i++) {
        var key = pipe[i];
        var step = null;
        for (var j = 0; j < steps.length; j++) {
            if (steps[j].key === key) { step = steps[j]; break; }
        }
        if (!step) continue;
        var res = step.fn(current);
        if (!res.success) {
            errorMsg.textContent = '步骤 ' + (i + 1) + '（' + step.label + '）出错：' + res.error;
            jsonOutput.value = '';
            copyBtn.style.display = 'none';
            return;
        }
        current = res.result;
    }

    jsonOutput.value = current;
    outputMsg.textContent = '执行成功（' + pipe.map(function (k) {
        for (var s = 0; s < steps.length; s++) { if (steps[s].key === k) return steps[s].label; }
        return k;
    }).join(' → ') + '）';
    copyBtn.style.display = 'inline-block';
});

// 复制结果
copyBtn.addEventListener('click', function () {
    if (!jsonOutput.value) return;
    copyToClipboard(jsonOutput.value);
    outputMsg.textContent = '已复制到剪贴板';
});

// 清空
clearBtn.addEventListener('click', function () {
    jsonInput.value = '';
    jsonOutput.value = '';
    errorMsg.textContent = '';
    outputMsg.textContent = '';
    copyBtn.style.display = 'none';
});

// 输入时清除提示
jsonInput.addEventListener('input', function () {
    errorMsg.textContent = '';
    outputMsg.textContent = '';
});

// 剪贴板工具
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

// 初始化箭头状态
updateArrows();
