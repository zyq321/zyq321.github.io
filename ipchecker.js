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
        this.binaryIpAddress = document.getElementById('ipBinaryAddress');
        this.convertBtn = document.getElementById('convertBtn');
        this.binaryResult = document.getElementById('binaryResult');
    }

    bindEvents() {
        this.checkBtn.addEventListener('click', () => {
            this.handleCheck();
            this.saveState();
        });
        this.convertBtn.addEventListener('click', () => this.handleBinaryConversion());
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
        // 支持 IPv4 和 IPv6 的正则表达式
        const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
    }

    validateCIDR(cidr) {
        // 支持 IPv4 和 IPv6 的 CIDR 正则表达式
        const ipv4CidrPattern = /^(\d{1,3}\.){3}\d{1,3}\/(\d{1,2})$/;
        const ipv6CidrPattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\/(\d{1,3})$/;
        return ipv4CidrPattern.test(cidr) || ipv6CidrPattern.test(cidr);
    }

    ipToLong(ip) {
        if (ip.includes(':')) {
            // IPv6 地址转换为长整数
            const parts = ip.split(':');
            let result = BigInt(0);
            for (let i = 0; i < parts.length; i++) {
                result = (result << BigInt(16)) + BigInt(parseInt(parts[i], 16));
            }
            return result;
        } else {
            // IPv4 地址转换为长整数
            const parts = ip.split('.');
            let result = 0;
            for (let i = 0; i < 4; i++) {
                result = result * 256 + parseInt(parts[i]);
            }
            return result >>> 0;
        }
    }

    isInSubnet(ip, cidr) {
        const [subnetIP, prefixStr] = cidr.split('/');
        const prefix = parseInt(prefixStr);

        const ipLong = this.ipToLong(ip);
        const subnetLong = this.ipToLong(subnetIP);

        // 计算掩码
        const mask = ip.includes(':') ? ~(BigInt(1) << BigInt(128 - prefix)) : ~((1 << (32 - prefix)) - 1) >>> 0;

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

    handleBinaryConversion() {
        const ip = this.binaryIpAddress.value.trim();
        if (!this.validateIPAddress(ip)) {
            this.binaryResult.innerHTML = '<span class="error">请输入有效的IP地址</span>';
            return;
        }

        if (ip.includes(':')) {
            // IPv6
            const parts = ip.split(':');
            const expandedParts = this.expandIPv6(parts);
            const binaryParts = expandedParts.map(part => {
                const bin = parseInt(part, 16).toString(2).padStart(16, '0');
                return `<div class="binary-section">${part} → ${bin}</div>`;
            });
            
            // 计算完整的二进制表示
            const fullBinary = expandedParts.map(part => 
                parseInt(part, 16).toString(2).padStart(16, '0')
            ).join('');
            
            this.binaryResult.innerHTML = `
                <div>IPv6 二进制表示：</div>
                ${binaryParts.join('')}
                <div class="binary-section full-binary">
                    <div>完整二进制：</div>
                    ${fullBinary}
                </div>`;
        } else {
            // IPv4
            const parts = ip.split('.');
            const binaryParts = parts.map(part => {
                const bin = parseInt(part).toString(2).padStart(8, '0');
                return `<div class="binary-section">${part} → ${bin}</div>`;
            });
            
            // 计算完整的二进制表示
            const fullBinary = parts.map(part => 
                parseInt(part).toString(2).padStart(8, '0')
            ).join('');
            
            this.binaryResult.innerHTML = `
                <div>IPv4 二进制表示：</div>
                ${binaryParts.join('')}
                <div class="binary-section full-binary">
                    <div>完整二进制：</div>
                    ${fullBinary}
                </div>`;
        }
    }

    expandIPv6(parts) {
        // 处理IPv6地址的压缩表示
        const expanded = [];
        let doubleColonIndex = parts.indexOf('');
        
        if (doubleColonIndex !== -1) {
            let zerosCount = 8 - (parts.length - 1);
            parts.splice(doubleColonIndex, 1, ...Array(zerosCount).fill('0'));
        }

        return parts.map(part => part || '0').map(part => part.padStart(4, '0'));
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new IPChecker();
});