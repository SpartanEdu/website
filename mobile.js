/**
 * SPARTAN.EDU - MOBILE iOS STYLE (FIXED)
 * Chapter toggle completely fixed + iOS animations
 */

(function() {
    'use strict';

    console.log('🍎 iOS Mobile.js v2 loading...');

    function isMobile() {
        return window.innerWidth <= 768;
    }

    const MobileApp = {
        initialized: false,
        expandedChapters: new Set(),
        isToggling: false,

        init: function() {
            if (!isMobile()) {
                console.log('📱 Desktop mode - skipping mobile');
                return;
            }

            console.log('📱 iOS mobile mode activated');
            this.waitForLogin();
            this.setupScrollEffects();
        },

        waitForLogin: function() {
            const appShell = document.getElementById('app-shell');
            
            if (!appShell) {
                setTimeout(() => this.waitForLogin(), 200);
                return;
            }

            if (appShell.classList.contains('hidden')) {
                console.log('⏳ Waiting for login...');
                const observer = new MutationObserver(() => {
                    if (!appShell.classList.contains('hidden')) {
                        console.log('✅ User logged in');
                        observer.disconnect();
                        setTimeout(() => this.setup(), 300);
                    }
                });
                observer.observe(appShell, { attributes: true });
            } else {
                setTimeout(() => this.setup(), 300);
            }
        },

        setup: function() {
            if (this.initialized) return;
            console.log('🍎 Setting up iOS mobile UI...');
            
            this.createHeader();
            this.createBottomNav();
            this.loadExpandedState();
            
            // Override PathwayCompact.toggleChapter if it exists
            if (window.PathwayCompact && typeof PathwayCompact.toggleChapter === 'function') {
                console.log('⚠️ Overriding PathwayCompact.toggleChapter for mobile');
                PathwayCompact.toggleChapter = (chapterId) => {
                    console.log('🔄 Desktop toggle called, redirecting to mobile handler');
                    const element = document.querySelector(`.chapter-item[data-chapter-id="${chapterId}"]`);
                    if (element) {
                        this.toggleChapter(element, chapterId);
                    }
                };
            }
            
            this.initialized = true;
            console.log('✅ iOS mobile UI ready!');
        },

        setupScrollEffects: function() {
            let lastScroll = 0;
            let ticking = false;

            window.addEventListener('scroll', () => {
                lastScroll = window.pageYOffset;
                
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.updateHeaderOnScroll(lastScroll);
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        },

        updateHeaderOnScroll: function(scrollY) {
            const header = document.querySelector('.mobile-header');
            if (!header) return;

            if (scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        },

        createHeader: function() {
            let header = document.querySelector('.mobile-header');
            if (header) header.remove();

            header = document.createElement('div');
            header.className = 'mobile-header';
            header.innerHTML = `
                <button class="mobile-header-menu" aria-label="Menu">
                    <i class="fa-solid fa-bars"></i>
                </button>
                <div class="mobile-header-logo">Spartan.Edu</div>
                <div style="width: 40px;"></div>
            `;

            document.body.insertBefore(header, document.body.firstChild);
            console.log('✅ iOS header created');
        },

        createBottomNav: function() {
            let nav = document.querySelector('.bottom-nav');
            if (nav) nav.remove();

            nav = document.createElement('div');
            nav.className = 'bottom-nav';

            const items = [
                { id: 'piano', icon: 'fa-music', label: 'Home' },
                { id: 'flashcards', icon: 'fa-layer-group', label: 'Cards' },
                { id: 'tasks', icon: 'fa-list-check', label: 'Tasks' },
                { id: 'community', icon: 'fa-comments', label: 'Chat' },
                { id: 'pathway', icon: 'fa-route', label: 'Learn' }
            ];

            items.forEach((item, i) => {
                const div = document.createElement('div');
                div.className = 'bottom-nav-item' + (i === 0 ? ' active' : '');
                div.setAttribute('data-module', item.id);
                div.innerHTML = `
                    <i class="fa-solid ${item.icon} bottom-nav-icon"></i>
                    <span class="bottom-nav-label">${item.label}</span>
                `;

                div.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.navigate(item.id);
                }, { passive: false });

                nav.appendChild(div);
            });

            document.body.appendChild(nav);
            console.log('✅ iOS bottom nav created');
        },

        navigate: function(moduleId) {
            console.log('📱 Navigate →', moduleId);

            // Update bottom nav
            document.querySelectorAll('.bottom-nav-item').forEach(item => {
                if (item.getAttribute('data-module') === moduleId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            // Hide all modules
            document.querySelectorAll('[id^="mod-"]').forEach(m => {
                m.classList.add('hidden');
            });

            // Show target
            const target = document.getElementById('mod-' + moduleId);
            if (target) {
                target.classList.remove('hidden');
                
                // iOS-style animation
                target.style.opacity = '0';
                target.style.transform = 'scale(0.95)';
                
                requestAnimationFrame(() => {
                    target.style.transition = 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
                    target.style.opacity = '1';
                    target.style.transform = 'scale(1)';
                });

                console.log('✅ Showing:', moduleId);
            }

            // Haptic
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Setup chapter toggles for pathway
            if (moduleId === 'pathway') {
                setTimeout(() => {
                    this.setupChapterToggles();
                    this.applyExpandedState();
                }, 300);
            }
        },

        setupChapterToggles: function() {
            console.log('📚 Setting up chapter toggles...');

            const headers = document.querySelectorAll('.chapter-header');
            console.log('Found', headers.length, 'chapter headers');

            headers.forEach((header, index) => {
                // Get chapter item
                const item = header.closest('.chapter-item');
                if (!item) return;

                // Ensure data-chapter-id exists
                let chapterId = item.getAttribute('data-chapter-id');
                if (!chapterId) {
                    chapterId = 'chapter-mobile-' + index;
                    item.setAttribute('data-chapter-id', chapterId);
                    console.log('Created ID:', chapterId);
                }

                // Remove inline onclick
                header.removeAttribute('onclick');

                // Clone to remove all listeners
                const newHeader = header.cloneNode(true);
                header.parentNode.replaceChild(newHeader, header);

                // Add single unified listener
                newHeader.addEventListener('click', (e) => {
                    // Check if clicking buttons
                    if (e.target.closest('button') || 
                        e.target.closest('.chapter-actions-compact') ||
                        e.target.closest('.btn-icon-sm')) {
                        console.log('🔘 Button clicked, not toggling');
                        e.stopPropagation();
                        return;
                    }

                    // Prevent rapid toggles
                    if (this.isToggling) {
                        console.log('⏸ Toggle in progress');
                        return;
                    }

                    const currentItem = newHeader.closest('.chapter-item');
                    const currentId = currentItem.getAttribute('data-chapter-id');
                    
                    console.log('📖 Toggle chapter:', currentId);
                    this.toggleChapter(currentItem, currentId);
                    
                    e.stopPropagation();
                    e.preventDefault();
                }, { passive: false });
            });

            console.log('✅ Chapter toggles ready');
        },

        toggleChapter: function(element, chapterId) {
            if (!element || !chapterId) {
                console.error('❌ Invalid element or ID');
                return;
            }

            // Set toggling flag
            this.isToggling = true;
            console.log('🔄 Toggling:', chapterId);

            const isExpanded = element.classList.contains('expanded');
            const container = element.querySelector('.chapter-lessons-container');
            
            if (!container) {
                console.error('❌ No lessons container');
                this.isToggling = false;
                return;
            }

            if (isExpanded) {
                // Collapse
                console.log('⬆️ Collapsing');
                
                // Get current height
                const currentHeight = container.scrollHeight;
                container.style.height = currentHeight + 'px';
                
                // Force reflow
                container.offsetHeight;
                
                // Animate to 0
                requestAnimationFrame(() => {
                    container.style.height = '0px';
                });

                element.classList.remove('expanded');
                this.expandedChapters.delete(chapterId);
            } else {
                // Expand
                console.log('⬇️ Expanding');
                
                // Remove height temporarily to measure
                const prevHeight = container.style.height;
                container.style.height = 'auto';
                const targetHeight = container.scrollHeight;
                container.style.height = prevHeight || '0px';
                
                // Force reflow
                container.offsetHeight;
                
                // Animate to target
                requestAnimationFrame(() => {
                    container.style.height = targetHeight + 'px';
                });

                element.classList.add('expanded');
                this.expandedChapters.add(chapterId);
            }

            // Save state
            this.saveExpandedState();

            // Haptic
            if (navigator.vibrate) {
                navigator.vibrate(5);
            }

            // Reset flag and cleanup after animation
            setTimeout(() => {
                this.isToggling = false;
                
                // Clean up inline height on expanded items
                if (!isExpanded && container) {
                    container.style.height = '';
                }
                
                console.log('✅ Toggle complete');
            }, 450);
        },

        saveExpandedState: function() {
            try {
                const state = Array.from(this.expandedChapters);
                localStorage.setItem('spartan_mobile_expanded', JSON.stringify(state));
                console.log('💾 Saved:', state.length, 'chapters');
            } catch (e) {
                console.error('Save failed:', e);
            }
        },

        loadExpandedState: function() {
            try {
                const saved = localStorage.getItem('spartan_mobile_expanded');
                if (saved) {
                    this.expandedChapters = new Set(JSON.parse(saved));
                    console.log('📂 Loaded:', this.expandedChapters.size, 'chapters');
                }
            } catch (e) {
                console.error('Load failed:', e);
            }
        },

        applyExpandedState: function() {
            console.log('🔄 Applying saved state...');
            
            let applied = 0;
            this.expandedChapters.forEach(chapterId => {
                const element = document.querySelector(`.chapter-item[data-chapter-id="${chapterId}"]`);
                if (element) {
                    element.classList.add('expanded');
                    
                    const container = element.querySelector('.chapter-lessons-container');
                    if (container) {
                        // Remove transition temporarily
                        container.style.transition = 'none';
                        container.style.height = 'auto';
                        
                        // Re-enable transition after a frame
                        setTimeout(() => {
                            container.style.transition = '';
                        }, 50);
                    }
                    
                    applied++;
                }
            });
            
            console.log('✅ Applied', applied, 'expanded states');
        }
    };

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => MobileApp.init(), 100);
        });
    } else {
        setTimeout(() => MobileApp.init(), 100);
    }

    // Handle resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const wasMobile = MobileApp.initialized;
            const isMobileNow = isMobile();
            
            if (isMobileNow && !wasMobile) {
                MobileApp.init();
            } else if (!isMobileNow && wasMobile) {
                document.querySelector('.mobile-header')?.remove();
                document.querySelector('.bottom-nav')?.remove();
                MobileApp.initialized = false;
                console.log('📱 Switched to desktop mode');
            }
        }, 300);
    }, { passive: true });

    // Expose for debugging
    window.MobileApp = MobileApp;

    console.log('✅ iOS Mobile.js v2 loaded');

})();
