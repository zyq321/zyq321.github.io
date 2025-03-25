class IPChecker {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.restoreState();
    }

    initializeElements() {
        this.ipAddressInput = document.getElementById('ipAddress');
        this.subnetInput = document.getElementById('subnet');
        this.checkBtn = document.getElementById('checkBtn');
        this.checkResult = document.getElementById('checkResult');
    }

    bindEvents() {
        this.checkBtn.addEventListener('click', () => {
            this.handleCheck();
            this.saveState();
        });
    }

    saveState() {
        const state = {
            ipAddress: this.ipAddressInput.value,
            subnet: this.subnetInput.value
        };
        localStorage.setItem('ipCheckerState', JSON.stringify(state));
    }

    restoreState() {
        const state = localStorage.getItem('ipCheckerState');
        if (state) {
            const { ipAddress, subnet } = JSON.parse(state);
            this.ipAddressInput.value = ipAddress || '';
            this.subnetInput.value = subnet || '';
        }
    }

    validateIPAddress(ip) {
        const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
        const match = ip.match(ipPattern);
        
        if (!match) return false;
        
        // 验证每个部分是否在0-255范围内
        for (let i = 1; i <= 4; i++) {
            const octet = parseInt(match[i]);
            if (octet < 0 || octet > 255) return false;
        }
        
        return true;
    }

    validateCIDR(cidr) {
        const cidrPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/;
        const match = cidr.match(cidrPattern);
        
        if (!match) return false;
        
        // 验证IP部分
        for (let i = 1; i <= 4; i++) {
            const octet = parseInt(match[i]);
            if (octet < 0 || octet > 255) return false;
        }
        
        // 验证掩码部分
        const prefix = parseInt(match[5]);
        if (prefix < 0 || prefix > 32) return false;
        
        return true;
    }

    ipToLong(ip) {
        const parts = ip.split('.');
        let result = 0;
        
        for (let i = 0; i < 4; i++) {
            result = result * 256 + parseInt(parts[i]);
        }
        
        return result >>> 0; // 无符号右移，确保结果为无符号32位整数
    }

    isInSubnet(ip, cidr) {
        const [subnetIP, prefixStr] = cidr.split('/');
        const prefix = parseInt(prefixStr);
        
        const ipLong = this.ipToLong(ip);
        const subnetLong = this.ipToLong(subnetIP);
        
        // 计算掩码
        const mask = ~((1 << (32 - prefix)) - 1) >>> 0;
        
        // 检查IP是否在网段内
        return (ipLong & mask) === (subnetLong & mask);
    }

    handleCheck() {
        const ip = this.ipAddressInput.value.trim();
        const cidr = this.subnetInput.value.trim();
        
        // 验证输入
        if (!this.validateIPAddress(ip)) {
            this.checkResult.innerHTML = '<span class="error">请输入有效的IP地址</span>';
            return;
        }
        
        if (!this.validateCIDR(cidr)) {
            this.checkResult.innerHTML = '<span class="error">请输入有效的CIDR网段</span>';
            return;
        }
        
        // 检查IP是否在网段内
        const isInSubnet = this.isInSubnet(ip, cidr);
        
        if (isInSubnet) {
            this.checkResult.innerHTML = `<span class="success">IP地址 ${ip} 在网段 ${cidr} 内</span>`;
        } else {
            this.checkResult.innerHTML = `<span class="error">IP地址 ${ip} 不在网段 ${cidr} 内</span>`;
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new IPChecker();
});