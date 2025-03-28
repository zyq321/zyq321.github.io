// 导航栏组件化实现
document.addEventListener('DOMContentLoaded', function() {
    // 获取当前页面的文件名，用于设置active状态
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // 创建导航栏HTML
    const navHTML = `
    <nav class="navbar">
        <a href="index.html" ${currentPage === 'index.html' ? 'class="active"' : ''}>时间转换器</a>
        <a href="calculator.html" ${currentPage === 'calculator.html' ? 'class="active"' : ''}>GeoHash计算器</a>
        <a href="converter.html" ${currentPage === 'converter.html' ? 'class="active"' : ''}>进制转换器</a>
        <a href="ipchecker.html" ${currentPage === 'ipchecker.html' ? 'class="active"' : ''}>IP网段检查器</a>
    </nav>
    <div class="visit-count">
        <script async src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>
        <span id="busuanzi_container_site_uv">本站总访问人数<span id="busuanzi_value_site_uv"></span>次</span>
    </div>
    `;
    
    // 查找页面中的导航栏占位元素
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        navPlaceholder.innerHTML = navHTML;
    } else {
        // 如果没有找到占位元素，则在body的开头插入导航栏
        const bodyElement = document.body;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = navHTML;
        
        // 将导航栏插入到body的第一个子元素之前
        if (bodyElement.firstChild) {
            bodyElement.insertBefore(tempDiv.firstElementChild, bodyElement.firstChild);
            bodyElement.insertBefore(tempDiv.firstElementChild, bodyElement.firstChild.nextSibling);
        } else {
            bodyElement.appendChild(tempDiv.firstElementChild);
            bodyElement.appendChild(tempDiv.firstElementChild);
        }
    }
});