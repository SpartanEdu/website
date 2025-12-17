/* ═══════════════════════════════════════════════════════════════════════════
   SPARTAN.EDU MOBILE ULTIMATE - PREMIUM JAVASCRIPT
   Advanced mobile interactions and gestures
   ═══════════════════════════════════════════════════════════════════════════ */

// This extends mobile.js with premium features

(function() {
    'use strict';
    
    // Check if mobile
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;
    
    console.log('🚀 Mobile ULTIMATE features loading...');
    
    /* ═══════════════════════════════════════════════════════════════════════
       🤲 SWIPE GESTURES
       ═══════════════════════════════════════════════════════════════════ */
    
    class SwipeHandler {
        constructor() {
            this.touchStartX = 0;
            this.touchStartY = 0;
            this.touchEndX = 0;
            this.touchEndY = 0;
            this.minSwipeDistance = 50;
            
            this.init();
        }
        
        init() {
            document.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
                this.touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });
            
            document.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.touchEndY = e.changedTouches[0].screenY;
                this.handleSwipe();
            }, { passive: true });
        }
        
        handleSwipe() {
            const diffX = this.touchEndX - this.touchStartX;
            const diffY = this.touchEndY - this.touchStartY;
            
            // Horizontal swipe
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.minSwipeDistance) {
                if (diffX > 0) {
                    this.onSwipeRight();
                } else {
                    this.onSwipeLeft();
                }
            }
            
            // Vertical swipe
            if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > this.minSwipeDistance) {
                if (diffY > 0) {
                    this.onSwipeDown();
                } else {
                    this.onSwipeUp();
                }
            }
        }
        
        onSwipeRight() {
            // Close modals or go back
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal && window.Modals) {
                window.Modals.close();
                this.hapticFeedback('light');
            }
        }
        
        onSwipeLeft() {
            // Could open menu or navigate forward
        }
        
        onSwipeDown() {
            // Pull to refresh or close bottom sheets
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                const modalBox = activeModal.querySelector('.modal-box');
                if (modalBox && this.touchStartY < 100) {
                    window.Modals.close();
                    this.hapticFeedback('light');
                }
            }
        }
        
        onSwipeUp() {
            // Could show quick actions
        }
        
        hapticFeedback(type = 'light') {
            if (navigator.vibrate) {
                const patterns = {
                    light: [5],
                    medium: [10],
                    heavy: [15],
                    success: [10, 50, 10],
                    error: [10, 50, 10, 50, 10]
                };
                navigator.vibrate(patterns[type] || patterns.light);
            }
        }
    }
    
    /* ═══════════════════════════════════════════════════════════════════════
       📱 PULL TO REFRESH
       ═══════════════════════════════════════════════════════════════════ */
    
    class PullToRefresh {
        constructor() {
            this.startY = 0;
            this.currentY = 0;
            this.pulling = false;
            this.threshold = 100;
            
            this.init();
        }
        
        init() {
            // Create indicator
            const indicator = document.createElement('div');
            indicator.className = 'pull-to-refresh';
            indicator.innerHTML = '<i class="fa-solid fa-rotate"></i>';
            document.body.appendChild(indicator);
            this.indicator = indicator;
            
            // Touch events
            const mainContent = document.querySelector('.main-content') || document.body;
            
            mainContent.addEventListener('touchstart', (e) => {
                if (mainContent.scrollTop === 0) {
                    this.startY = e.touches[0].clientY;
                    this.pulling = true;
                }
            }, { passive: true });
            
            mainContent.addEventListener('touchmove', (e) => {
                if (!this.pulling) return;
                
                this.currentY = e.touches[0].clientY;
                const distance = this.currentY - this.startY;
                
                if (distance > 0 && distance < this.threshold * 1.5) {
                    this.indicator.classList.add('active');
                    this.indicator.style.transform = `translateX(-50%) scale(${Math.min(distance / this.threshold, 1)})`;
                }
            }, { passive: true });
            
            mainContent.addEventListener('touchend', () => {
                if (!this.pulling) return;
                
                const distance = this.currentY - this.startY;
                
                if (distance > this.threshold) {
                    this.refresh();
                } else {
                    this.reset();
                }
                
                this.pulling = false;
            }, { passive: true });
        }
        
        refresh() {
            this.indicator.style.transform = 'translateX(-50%) scale(1)';
            
            setTimeout(() => {
                if (window.Notify) {
                    window.Notify.show('✨ Refreshed!');
                }
                this.reset();
            }, 1000);
        }
        
        reset() {
            this.indicator.classList.remove('active');
            this.indicator.style.transform = 'translateX(-50%) scale(0)';
            this.startY = 0;
            this.currentY = 0;
        }
    }
    
    /* ═══════════════════════════════════════════════════════════════════════
       🎯 ENHANCED BUTTON FEEDBACK
       ═══════════════════════════════════════════════════════════════════ */
    
    function enhanceButtons() {
        const buttons = document.querySelectorAll('.btn, button');
        
        buttons.forEach(btn => {
            if (btn.dataset.enhanced) return;
            btn.dataset.enhanced = 'true';
            
            btn.addEventListener('touchstart', function() {
                this.classList.add('haptic-feedback');
                
                // Haptic
                if (navigator.vibrate) {
                    navigator.vibrate([5]);
                }
            }, { passive: true });
            
            btn.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('haptic-feedback');
                }, 300);
            }, { passive: true });
        });
    }
    
    /* ═══════════════════════════════════════════════════════════════════════
       📊 SCROLL PROGRESS INDICATOR
       ═══════════════════════════════════════════════════════════════════ */
    
    class ScrollIndicator {
        constructor() {
            this.init();
        }
        
        init() {
            const indicator = document.createElement('div');
            indicator.className = 'scroll-indicator';
            indicator.innerHTML = '<div class="scroll-indicator-thumb"></div>';
            document.body.appendChild(indicator);
            
            this.indicator = indicator;
            this.thumb = indicator.querySelector('.scroll-indicator-thumb');
            
            window.addEventListener('scroll', () => this.update(), { passive: true });
            this.update();
        }
        
        update() {
            const winScroll = document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            this.thumb.style.height = `${Math.min(scrolled, 100)}%`;
            
            // Hide when at top
            if (winScroll < 50) {
                this.indicator.style.opacity = '0';
            } else {
                this.indicator.style.opacity = '1';
            }
        }
    }
    
    /* ═══════════════════════════════════════════════════════════════════════
       🎨 FLOATING ACTION BUTTON (FAB)
       ═══════════════════════════════════════════════════════════════════ */
    
    class FloatingActionButton {
        constructor() {
            this.init();
        }
        
        init() {
            const fab = document.createElement('button');
            fab.className = 'fab hidden';
            fab.innerHTML = '<i class="fa-solid fa-plus"></i>';
            document.body.appendChild(fab);
            
            this.fab = fab;
            
            // Show/hide based on scroll
            let lastScroll = 0;
            window.addEventListener('scroll', () => {
                const currentScroll = window.pageYOffset;
                
                if (currentScroll > 300) {
                    if (currentScroll > lastScroll) {
                        // Scrolling down - hide
                        this.fab.classList.add('hidden');
                    } else {
                        // Scrolling up - show
                        this.fab.classList.remove('hidden');
                    }
                } else {
                    this.fab.classList.add('hidden');
                }
                
                lastScroll = currentScroll;
            }, { passive: true });
            
            // Click action - scroll to top
            fab.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (navigator.vibrate) {
                    navigator.vibrate([10]);
                }
            });
        }
    }
    
    /* ═══════════════════════════════════════════════════════════════════════
       🔄 BOTTOM SHEET MODAL ENHANCEMENTS
       ═══════════════════════════════════════════════════════════════════ */
    
    function enhanceModals() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains('modal-overlay')) {
                        addModalGestures(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true });
        
        // Enhance existing modals
        document.querySelectorAll('.modal-overlay').forEach(addModalGestures);
    }
    
    function addModalGestures(modal) {
        if (modal.dataset.gesturesAdded) return;
        modal.dataset.gesturesAdded = 'true';
        
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        
        const modalBox = modal.querySelector('.modal-box');
        if (!modalBox) return;
        
        modalBox.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
        }, { passive: true });
        
        modalBox.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            
            if (diff > 0) {
                modalBox.style.transform = `translateY(${diff}px)`;
            }
        }, { passive: true });
        
        modalBox.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            const diff = currentY - startY;
            
            if (diff > 100) {
                // Close modal
                if (window.Modals) {
                    window.Modals.close();
                }
            } else {
                // Snap back
                modalBox.style.transform = 'translateY(0)';
            }
            
            isDragging = false;
        }, { passive: true });
    }
    
    /* ═══════════════════════════════════════════════════════════════════════
       🎵 ENHANCED PIANO FOR MOBILE
       ═══════════════════════════════════════════════════════════════════ */
    
    function enhancePianoMobile() {
        const pianoKeys = document.getElementById('piano-keys');
        if (!pianoKeys) return;
        
        // Make keys more touch-friendly
        const keys = pianoKeys.querySelectorAll('.key');
        keys.forEach(key => {
            key.style.cursor = 'pointer';
            
            // Add touch events
            key.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const note = key.dataset.note;
                if (note && window.Piano) {
                    window.Piano.play(note, key);
                }
                
                // Visual feedback
                key.classList.add('active');
                
                // Haptic
                if (navigator.vibrate) {
                    navigator.vibrate([3]);
                }
            }, { passive: false });
            
            key.addEventListener('touchend', () => {
                setTimeout(() => {
                    key.classList.remove('active');
                }, 100);
            });
        });
    }
    
    /* ═══════════════════════════════════════════════════════════════════════
       ⚡ AUTO-HIDE HEADER ON SCROLL
       ═══════════════════════════════════════════════════════════════════ */
    
    function autoHideHeader() {
        const header = document.querySelector('.mobile-header');
        if (!header) return;
        
        let lastScroll = 0;
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScroll = window.pageYOffset;
                    
                    if (currentScroll > lastScroll && currentScroll > 80) {
                        // Scrolling down
                        header.style.transform = 'translateY(-100%)';
                    } else {
                        // Scrolling up
                        header.style.transform = 'translateY(0)';
                    }
                    
                    lastScroll = currentScroll;
                    ticking = false;
                });
                
                ticking = true;
            }
        }, { passive: true });
    }
    
    /* ═══════════════════════════════════════════════════════════════════════
       📱 DEVICE ORIENTATION
       ═══════════════════════════════════════════════════════════════════ */
    
    function handleOrientation() {
        window.addEventListener('orientationchange', () => {
            // Adjust UI based on orientation
            setTimeout(() => {
                if (window.orientation === 90 || window.orientation === -90) {
                    // Landscape
                    document.body.classList.add('landscape-mode');
                } else {
                    // Portrait
                    document.body.classList.remove('landscape-mode');
                }
            }, 200);
        });
    }
    
    /* ═══════════════════════════════════════════════════════════════════════
       🔧 PERFORMANCE OPTIMIZATIONS
       ═══════════════════════════════════════════════════════════════════ */
    
    function optimizePerformance() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
        
        // Debounce resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // Recalculate layouts if needed
                if (window.Piano && window.Piano.render) {
                    window.Piano.render();
                }
            }, 250);
        });
    }
    
    /* ═══════════════════════════════════════════════════════════════════════
       🚀 INITIALIZE ALL FEATURES
       ═══════════════════════════════════════════════════════════════════ */
    
    function init() {
        console.log('🎨 Initializing Mobile ULTIMATE features...');
        
        // Initialize features
        new SwipeHandler();
        new PullToRefresh();
        new ScrollIndicator();
        new FloatingActionButton();
        
        enhanceButtons();
        enhanceModals();
        handleOrientation();
        optimizePerformance();
        
        // Delayed init for dynamic content
        setTimeout(() => {
            enhancePianoMobile();
            enhanceButtons(); // Re-enhance for dynamic buttons
        }, 2000);
        
        // Re-enhance on navigation
        const observer = new MutationObserver(() => {
            enhanceButtons();
            enhancePianoMobile();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ Mobile ULTIMATE features ready!');
        console.log('📱 Features: Swipe gestures, Pull-to-refresh, FAB, Haptics');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
