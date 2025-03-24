// Geohash 常量定义
const GEOHASH_CONSTANTS = {
    BASE32: '0123456789bcdefghjkmnpqrstuvwxyz',
    NEIGHBORS: {
        n: ['p0r21436x8zb9dcf5h7kjnmqesgutwvy', 'bc01fg45238967deuvhjyznpkmstqrwx'],
        s: ['14365h7k9dcfesgujnmqp0r2twvyx8zb', '238967debc01fg45kmstqrwxuvhjyznp'],
        e: ['bc01fg45238967deuvhjyznpkmstqrwx', 'p0r21436x8zb9dcf5h7kjnmqesgutwvy'],
        w: ['238967debc01fg45kmstqrwxuvhjyznp', '14365h7k9dcfesgujnmqp0r2twvyx8zb']
    },
    BORDERS: {
        n: ['prxz', 'bcfguvyz'],
        s: ['028b', '0145hjnp'],
        e: ['bcfguvyz', 'prxz'],
        w: ['0145hjnp', '028b']
    }
};

// Geohash 工具类
class GeohashUtil {
    static encode(lat, lon, precision) {
        const bits = [];
        let minLat = -90, maxLat = 90;
        let minLon = -180, maxLon = 180;
        let isEven = true;

        while (bits.length < precision * 5) {
            if (isEven) {
                const midLon = (minLon + maxLon) / 2;
                if (lon > midLon) {
                    bits.push(1);
                    minLon = midLon;
                } else {
                    bits.push(0);
                    maxLon = midLon;
                }
            } else {
                const midLat = (minLat + maxLat) / 2;
                if (lat > midLat) {
                    bits.push(1);
                    minLat = midLat;
                } else {
                    bits.push(0);
                    maxLat = midLat;
                }
            }
            isEven = !isEven;
        }

        return this.bitsToGeohash(bits);
    }

    static bitsToGeohash(bits) {
        let geohash = '';
        for (let i = 0; i < bits.length; i += 5) {
            const chunk = bits.slice(i, i + 5);
            let value = 0;
            for (let j = 0; j < chunk.length; j++) {
                value = value * 2 + chunk[j];
            }
            geohash += GEOHASH_CONSTANTS.BASE32[value];
        }
        return geohash;
    }

    static calculateAdjacent(geohash, dir) {
        if (!geohash || geohash.length === 0) return '';

        const { NEIGHBORS, BORDERS, BASE32 } = GEOHASH_CONSTANTS;
        const lastChar = geohash.slice(-1);
        const type = geohash.length % 2;
        const parent = geohash.slice(0, -1);

        // 使用缓存来存储已经计算过的邻居
        if (!this.adjacentCache) {
            this.adjacentCache = {};
        }
        const cacheKey = `${geohash}-${dir}`;
        if (this.adjacentCache[cacheKey]) {
            return this.adjacentCache[cacheKey];
        }

        let adjacent;
        if (BORDERS[dir][type].includes(lastChar)) {
            const parentNeighbor = this.calculateAdjacent(parent, dir);
            adjacent = parentNeighbor + BASE32[NEIGHBORS[dir][type].indexOf(lastChar)];
        } else {
            adjacent = parent + BASE32[NEIGHBORS[dir][type].indexOf(lastChar)];
        }

        // 缓存计算结果
        this.adjacentCache[cacheKey] = adjacent;
        return adjacent;
    }

    static getNeighbors(geohash) {
        if (!geohash) return null;
    
        // 直接计算八个方向的邻居
        return {
            n: this.calculateAdjacent(geohash, 'n'),
            ne: this.calculateAdjacent(this.calculateAdjacent(geohash, 'n'), 'e'),
            e: this.calculateAdjacent(geohash, 'e'),
            se: this.calculateAdjacent(this.calculateAdjacent(geohash, 's'), 'e'),
            s: this.calculateAdjacent(geohash, 's'),
            sw: this.calculateAdjacent(this.calculateAdjacent(geohash, 's'), 'w'),
            w: this.calculateAdjacent(geohash, 'w'),
            nw: this.calculateAdjacent(this.calculateAdjacent(geohash, 'n'), 'w')
        };
    }
    
    // 新增：解码 Geohash 获取经纬度范围和中心点
    static decode(geohash) {
        if (!geohash) return null;
        
        let isEven = true;
        let latMin = -90, latMax = 90;
        let lonMin = -180, lonMax = 180;
        
        for (let i = 0; i < geohash.length; i++) {
            const c = geohash[i];
            const cd = GEOHASH_CONSTANTS.BASE32.indexOf(c);
            
            for (let j = 0; j < 5; j++) {
                const mask = 1 << (4 - j);
                if (isEven) {
                    // 经度
                    const lonMid = (lonMin + lonMax) / 2;
                    if ((cd & mask) !== 0) {
                        lonMin = lonMid;
                    } else {
                        lonMax = lonMid;
                    }
                } else {
                    // 纬度
                    const latMid = (latMin + latMax) / 2;
                    if ((cd & mask) !== 0) {
                        latMin = latMid;
                    } else {
                        latMax = latMid;
                    }
                }
                isEven = !isEven;
            }
        }
        
        return {
            latitude: (latMin + latMax) / 2,
            longitude: (lonMin + lonMax) / 2,
            latitudeRange: [latMin, latMax],
            longitudeRange: [lonMin, lonMax],
            error: {
                latitude: (latMax - latMin) / 2,
                longitude: (lonMax - lonMin) / 2
            }
        };
    }
}

// UI 交互类
class GeohashCalculator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.latitudeInput = document.getElementById('latitude');
        this.longitudeInput = document.getElementById('longitude');
        this.precisionSelect = document.getElementById('precision');
        this.calculateBtn = document.getElementById('calculateBtn');
        this.geohashResult = document.getElementById('geohashResult');
        // 移除 copyBtn
        this.neighborsDiv = document.createElement('div');
        this.neighborsDiv.className = 'neighbors-grid';
        this.neighborsDiv.style.display = 'none';
        document.querySelector('.geohash-calculator').appendChild(this.neighborsDiv);
    }

    bindEvents() {
        this.calculateBtn.addEventListener('click', () => this.handleCalculate());
        // 移除 copyBtn 事件绑定
    }

    validateCoordinates(lat, lon) {
        if (isNaN(lat) || isNaN(lon)) {
            throw new Error('请输入有效的经纬度值');
        }
        if (lat < -90 || lat > 90) {
            throw new Error('纬度必须在 -90 到 90 之间');
        }
        if (lon < -180 || lon > 180) {
            throw new Error('经度必须在 -180 到 180 之间');
        }
    }

    handleCalculate() {
        try {
            const lat = parseFloat(this.latitudeInput.value);
            const lon = parseFloat(this.longitudeInput.value);
            const precision = parseInt(this.precisionSelect.value);

            this.validateCoordinates(lat, lon);

            const geohash = GeohashUtil.encode(lat, lon, precision);
            this.geohashResult.value = geohash;

            const neighbors = GeohashUtil.getNeighbors(geohash);
            this.displayNeighbors(geohash, neighbors);
            this.neighborsDiv.style.display = 'block';
        } catch (error) {
            alert(error.message);
        }
    }

    // 移除 handleCopy 方法

    displayNeighbors(geohash, neighbors) {
        this.neighborsDiv.innerHTML = `
            <div class="neighbors-title">相邻的 Geohash：</div>
            <div class="neighbors-row">
                <div>${neighbors.nw}</div>
                <div>${neighbors.n}</div>
                <div>${neighbors.ne}</div>
            </div>
            <div class="neighbors-row">
                <div>${neighbors.w}</div>
                <div class="current">${geohash}</div>
                <div>${neighbors.e}</div>
            </div>
            <div class="neighbors-row">
                <div>${neighbors.sw}</div>
                <div>${neighbors.s}</div>
                <div>${neighbors.se}</div>
            </div>
        `;
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new GeohashCalculator();
});