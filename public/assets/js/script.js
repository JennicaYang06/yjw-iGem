
// Initialize tooltips for brain visualization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Animate stats on scroll
    const stats = document.querySelectorAll('.stat-number');
    
    // Function to animate counting
    function animateCount(element, target) {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 20);
    }
    
    // Intersection Observer for animation on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statBox = entry.target;
                const statNumber = statBox.querySelector('.stat-number');
                
                if (statNumber && !statNumber.classList.contains('animated')) {
                    const targetValue = parseInt(statNumber.textContent);
                    statNumber.textContent = '0';
                    statNumber.classList.add('animated');
                    
                    // Animate only if it's a number
                    if (!isNaN(targetValue)) {
                        animateCount(statNumber, targetValue);
                    }
                }
            }
        });
    }, observerOptions);
    
    // Observe each stat box
    document.querySelectorAll('.stat-box').forEach(box => {
        observer.observe(box);
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            navbar.style.padding = '0.5rem 0';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            navbar.style.padding = '0.75rem 0';
        }
    });
    
    // Smooth scrolling for anchor links (skip navigation links handled by page-specific scripts)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // Skip links with data-section attribute (handled by methods.html navigation)
        if (anchor.hasAttribute('data-section')) return;
        
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Calculate dynamic navbar height
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 80;
                
                window.scrollTo({
                    top: targetElement.offsetTop - navbarHeight,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const navbarToggler = document.querySelector('.navbar-toggler');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            }
        });
    });
    
    // Console greeting for developers
    console.log('%c iGEM Wiki Coding Selection Website', 'color: #2c3e50; font-size: 18px; font-weight: bold;');
    console.log('%c Demonstrating front-end development skills for iGEM ShanghaiTech 2026 selection', 'color: #8a9ca3;');
    console.log('%c Built with: HTML5, CSS3, JavaScript ES6+, Bootstrap 5', 'color: #5d6d7e;');
});

class SmartBubble {
    constructor() {
        this.triggers = document.querySelectorAll('.trigger');
        this.init();
    }

    init() {
        this.triggers.forEach(trigger => {
            // 统一使用点击事件，而不是根据设备类型区分
            trigger.addEventListener('click', this.handleTrigger.bind(this, trigger));
            
            // 为键盘访问添加支持
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleTrigger(trigger, e);
                }
            });
            
            // 防止泡泡内部点击事件冒泡到document导致关闭
            const bubble = trigger.querySelector('.speech-bubble');
            if (bubble) {
                bubble.addEventListener('click', (e) => e.stopPropagation());
            }
        });

        // 点击页面任意其他地方关闭所有泡泡
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.trigger')) {
                this.hideAllBubbles();
            }
        });

        // 也监听触摸开始事件，但不阻止默认行为
        document.addEventListener('touchstart', (e) => {
            if (!e.target.closest('.trigger')) {
                this.hideAllBubbles();
            }
        });
    }

    handleTrigger(trigger, e) {
        // 阻止事件冒泡和默认行为
        e.preventDefault();
        e.stopPropagation();

        const bubble = trigger.querySelector('.speech-bubble');
        if (!bubble) return;

        const isActive = trigger.classList.contains('active');

        // 先关闭所有其他泡泡
        this.hideAllBubbles();

        // 如果点击的不是已激活的，则打开这个泡泡
        if (!isActive) {
            this.showBubble(trigger, bubble);
        }
    }

    showBubble(trigger, bubble) {
        // 显示泡泡
        trigger.classList.add('active');
        
        // 重置位置
        bubble.style.left = '';
        bubble.style.right = '';
        bubble.style.top = '';
        bubble.style.bottom = '';
        bubble.style.transform = '';
        
        // 移除所有方向类
        bubble.classList.remove('bottom', 'left', 'right');
        
        // 强制浏览器重绘
        void bubble.offsetWidth;

        // 计算最佳位置
        this.adjustBubblePosition(trigger, bubble);

        // 更新ARIA状态
        trigger.setAttribute('aria-expanded', 'true');
    }

    adjustBubblePosition(trigger, bubble) {
        const triggerRect = trigger.getBoundingClientRect();
        const bubbleRect = bubble.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // 1. 判断垂直方向：默认在下方，如果下方空间不足则显示在上方
        let verticalClass = 'bottom'; // 默认在下方
        const spaceBelow = viewportHeight - (triggerRect.bottom - scrollTop);
        const spaceAbove = triggerRect.top - scrollTop;
        
        if (spaceBelow < bubbleRect.height + 15 && spaceAbove > bubbleRect.height + 15) {
            verticalClass = ''; // 显示在上方
        }

        // 2. 判断水平方向
        let horizontalClass = '';
        const bubbleHalfWidth = bubbleRect.width / 2;
        const triggerCenter = triggerRect.left + triggerRect.width / 2;
        
        // 检查左侧空间
        if (triggerCenter - bubbleHalfWidth < 10) {
            horizontalClass = 'right'; // 左对齐
        } 
        // 检查右侧空间
        else if (triggerCenter + bubbleHalfWidth > viewportWidth - 10) {
            horizontalClass = 'left'; // 右对齐
        }

        // 应用计算出的类
        if (verticalClass) bubble.classList.add(verticalClass);
        if (horizontalClass) bubble.classList.add(horizontalClass);
        
        // 调试信息
        console.log('泡泡尺寸:', bubbleRect.width, 'x', bubbleRect.height);
        console.log('视口尺寸:', viewportWidth, 'x', viewportHeight);
        console.log('触发元素位置:', triggerRect);
        console.log('应用类:', verticalClass, horizontalClass);
    }

    hideBubble(trigger) {
        trigger.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
    }

    hideAllBubbles() {
        this.triggers.forEach(trigger => {
            this.hideBubble(trigger);
        });
    }
}

// 修复重复的DOMContentLoaded监听器
document.addEventListener('DOMContentLoaded', () => {
    // 延迟一点初始化，确保所有动态内容已加载
    setTimeout(() => {
        try {
            new SmartBubble();
        } catch (error) {
            console.error('SmartBubble 初始化失败:', error);
        }
    }, 100);
});