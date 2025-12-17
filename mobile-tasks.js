/* ═══════════════════════════════════════════════════════════════════════════
   TASKS MODULE - MOBILE COMPLETE FUNCTIONALITY
   Full-featured mobile task management
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';
    
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;
    
    console.log('📋 Mobile Tasks Module loading...');
    
    /* ═══════════════════════════════════════════════════════════════════════
       📱 MOBILE TASKS UI MANAGER
       ═══════════════════════════════════════════════════════════════════ */
    
    window.MobileTasks = {
        currentProject: null,
        fabMenuOpen: false,
        
        init: function() {
            this.createMobileUI();
            this.setupEventListeners();
            this.observeTaskChanges();
            console.log('✅ Mobile Tasks UI initialized');
        },
        
        /* ═══════════════════════════════════════════════════════════════════
           🎨 CREATE MOBILE UI COMPONENTS
           ═══════════════════════════════════════════════════════════════ */
        
        createMobileUI: function() {
            // 1. Create Project Selector Bar
            this.createProjectSelector();
            
            // 2. Create FAB with Menu
            this.createFAB();
            
            // 3. Create Task Panel Backdrop
            this.createTaskPanelBackdrop();
            
            // 4. Transform Task Rows to Mobile Cards
            this.transformTasksToMobile();
            
            // 5. Add Quick Add Button
            this.createQuickAddButton();
            
            // 6. Add Project Stats
            this.createProjectStats();
        },
        
        createProjectSelector: function() {
            if (document.getElementById('mobile-project-selector')) return;
            
            const selector = document.createElement('div');
            selector.id = 'mobile-project-selector';
            
            // Load projects from State
            if (window.State && window.State.projects) {
                selector.innerHTML = this.renderProjectChips();
            } else {
                selector.innerHTML = '<div class="mobile-project-chip add-project" onclick="MobileTasks.addProject()"><i class="fa-solid fa-plus"></i> New Project</div>';
            }
            
            document.body.appendChild(selector);
        },
        
        renderProjectChips: function() {
            const projects = window.State?.projects || [];
            
            let html = '';
            projects.forEach((project, index) => {
                const isActive = this.currentProject === index || (!this.currentProject && index === 0);
                html += `
                    <div class="mobile-project-chip ${isActive ? 'active' : ''}" 
                         data-index="${index}"
                         onclick="MobileTasks.selectProject(${index})">
                        ${project.name}
                        ${project.tasks ? `<span style="opacity: 0.7; margin-left: 4px;">(${project.tasks.length})</span>` : ''}
                    </div>
                `;
            });
            
            html += '<div class="mobile-project-chip add-project" onclick="MobileTasks.addProject()"><i class="fa-solid fa-plus"></i></div>';
            
            return html;
        },
        
        selectProject: function(index) {
            this.currentProject = index;
            
            // Update chips
            document.querySelectorAll('.mobile-project-chip').forEach((chip, i) => {
                chip.classList.toggle('active', i === index);
            });
            
            // Call original Tasks function if exists
            if (window.Tasks && window.Tasks.selectProject) {
                window.Tasks.selectProject(index);
            }
            
            // Update UI
            this.transformTasksToMobile();
            this.updateProjectStats();
            
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate([5]);
            }
        },
        
        addProject: function() {
            if (window.Modals && window.Tasks) {
                window.Modals.prompt('New Project', 'Project Name:', (name) => {
                    if (window.Tasks.createProject) {
                        window.Tasks.createProject(name);
                        
                        // Refresh selector
                        setTimeout(() => {
                            const selector = document.getElementById('mobile-project-selector');
                            if (selector) {
                                selector.innerHTML = this.renderProjectChips();
                            }
                        }, 100);
                    }
                });
            }
        },
        
        createFAB: function() {
            if (document.getElementById('mobile-task-fab')) return;
            
            // FAB Button
            const fab = document.createElement('button');
            fab.id = 'mobile-task-fab';
            fab.innerHTML = '<i class="fa-solid fa-plus"></i>';
            fab.onclick = () => this.toggleFABMenu();
            document.body.appendChild(fab);
            
            // FAB Menu
            const menu = document.createElement('div');
            menu.className = 'fab-menu';
            menu.innerHTML = `
                <div class="fab-menu-item" onclick="MobileTasks.addTask()">
                    <i class="fa-solid fa-check"></i>
                    <span>New Task</span>
                </div>
                <div class="fab-menu-item" onclick="MobileTasks.addProject()">
                    <i class="fa-solid fa-folder"></i>
                    <span>New Project</span>
                </div>
                <div class="fab-menu-item" onclick="MobileTasks.showFilters()">
                    <i class="fa-solid fa-filter"></i>
                    <span>Filter Tasks</span>
                </div>
            `;
            document.body.appendChild(menu);
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!fab.contains(e.target) && !menu.contains(e.target)) {
                    this.closeFABMenu();
                }
            });
        },
        
        toggleFABMenu: function() {
            const menu = document.querySelector('.fab-menu');
            const fab = document.getElementById('mobile-task-fab');
            
            this.fabMenuOpen = !this.fabMenuOpen;
            
            menu.classList.toggle('active', this.fabMenuOpen);
            fab.innerHTML = this.fabMenuOpen 
                ? '<i class="fa-solid fa-xmark"></i>' 
                : '<i class="fa-solid fa-plus"></i>';
            
            if (navigator.vibrate) {
                navigator.vibrate([5]);
            }
        },
        
        closeFABMenu: function() {
            const menu = document.querySelector('.fab-menu');
            const fab = document.getElementById('mobile-task-fab');
            
            if (this.fabMenuOpen) {
                this.fabMenuOpen = false;
                menu.classList.remove('active');
                fab.innerHTML = '<i class="fa-solid fa-plus"></i>';
            }
        },
        
        addTask: function() {
            this.closeFABMenu();
            
            if (window.Tasks && window.Tasks.addTask) {
                window.Tasks.addTask();
            } else {
                if (window.Notify) {
                    window.Notify.show('Please select a project first', 'error');
                }
            }
        },
        
        showFilters: function() {
            this.closeFABMenu();
            
            // Create filter bottom sheet
            const modal = document.createElement('div');
            modal.className = 'modal-overlay active';
            modal.innerHTML = `
                <div class="modal-box" style="padding: 24px;">
                    <h2 style="margin-bottom: 20px;"><i class="fa-solid fa-filter"></i> Filter Tasks</h2>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 12px; font-weight: 600; color: var(--text-secondary);">Priority</label>
                        <div style="display: flex; gap: 8px;">
                            <button class="filter-chip" data-filter="priority-all" onclick="MobileTasks.applyFilter('priority', 'all')">All</button>
                            <button class="filter-chip" data-filter="priority-high" onclick="MobileTasks.applyFilter('priority', 'high')">High</button>
                            <button class="filter-chip" data-filter="priority-medium" onclick="MobileTasks.applyFilter('priority', 'medium')">Medium</button>
                            <button class="filter-chip" data-filter="priority-low" onclick="MobileTasks.applyFilter('priority', 'low')">Low</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 12px; font-weight: 600; color: var(--text-secondary);">Status</label>
                        <div style="display: flex; gap: 8px;">
                            <button class="filter-chip active" data-filter="status-all" onclick="MobileTasks.applyFilter('status', 'all')">All</button>
                            <button class="filter-chip" data-filter="status-active" onclick="MobileTasks.applyFilter('status', 'active')">Active</button>
                            <button class="filter-chip" data-filter="status-completed" onclick="MobileTasks.applyFilter('status', 'completed')">Completed</button>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary w-full" onclick="this.closest('.modal-overlay').remove()">
                        Apply Filters
                    </button>
                </div>
            `;
            document.body.appendChild(modal);
        },
        
        applyFilter: function(type, value) {
            // Toggle active state
            const btn = document.querySelector(`[data-filter="${type}-${value}"]`);
            document.querySelectorAll(`[data-filter^="${type}-"]`).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Apply filter logic here
            console.log(`Filter: ${type} = ${value}`);
            
            if (navigator.vibrate) {
                navigator.vibrate([5]);
            }
        },
        
        createTaskPanelBackdrop: function() {
            if (document.querySelector('.task-panel-backdrop')) return;
            
            const backdrop = document.createElement('div');
            backdrop.className = 'task-panel-backdrop';
            backdrop.onclick = () => this.closeTaskPanel();
            document.body.appendChild(backdrop);
        },
        
        openTaskPanel: function() {
            const panel = document.getElementById('task-panel');
            const backdrop = document.querySelector('.task-panel-backdrop');
            
            if (panel) {
                panel.classList.add('active');
                backdrop.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        },
        
        closeTaskPanel: function() {
            const panel = document.getElementById('task-panel');
            const backdrop = document.querySelector('.task-panel-backdrop');
            
            if (panel) {
                panel.classList.remove('active');
                backdrop.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            // Call original close if exists
            if (window.Tasks && window.Tasks.closePanel) {
                window.Tasks.closePanel();
            }
        },
        
        /* ═══════════════════════════════════════════════════════════════════
           🎨 TRANSFORM TASKS TO MOBILE CARDS
           ═══════════════════════════════════════════════════════════════ */
        
        transformTasksToMobile: function() {
            const taskRows = document.getElementById('task-rows');
            if (!taskRows) return;
            
            // Check if we have tasks
            const tasks = taskRows.querySelectorAll('.task-row');
            
            if (tasks.length === 0) {
                this.showEmptyState();
                return;
            }
            
            tasks.forEach(taskRow => {
                if (taskRow.dataset.mobilified) return;
                taskRow.dataset.mobilified = 'true';
                
                // Get task data
                const checkbox = taskRow.querySelector('td:first-child input[type="checkbox"]');
                const title = taskRow.querySelector('td:nth-child(2)')?.textContent || '';
                const assignee = taskRow.querySelector('td:nth-child(3)')?.textContent || '';
                const dueDate = taskRow.querySelector('td:nth-child(4)')?.textContent || '';
                const priority = taskRow.querySelector('td:nth-child(5)')?.textContent || 'low';
                const completed = checkbox?.checked || false;
                
                // Transform to mobile card
                taskRow.innerHTML = `
                    <div class="task-card-header">
                        <div class="task-checkbox">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <div class="task-title-mobile">${title}</div>
                    </div>
                    <div class="task-card-meta">
                        ${dueDate ? `<div class="task-meta-item"><i class="fa-solid fa-calendar"></i> ${dueDate}</div>` : ''}
                        ${assignee ? `<div class="task-meta-item"><i class="fa-solid fa-user"></i> ${assignee}</div>` : ''}
                        ${priority ? `<div class="task-meta-item task-priority-${priority.toLowerCase()}"><i class="fa-solid fa-flag"></i> ${priority}</div>` : ''}
                    </div>
                `;
                
                if (completed) {
                    taskRow.classList.add('completed');
                }
                
                // Add click handler
                taskRow.onclick = (e) => {
                    if (e.target.closest('.task-checkbox')) {
                        this.toggleTask(taskRow);
                    } else {
                        this.openTaskDetails(taskRow);
                    }
                };
                
                // Add swipe gestures
                this.addSwipeGestures(taskRow);
            });
        },
        
        toggleTask: function(taskRow) {
            taskRow.classList.toggle('completed');
            
            if (navigator.vibrate) {
                navigator.vibrate([10, 50, 10]);
            }
            
            // Update in original Tasks module
            // This would need to be hooked into the actual Tasks.complete() function
        },
        
        openTaskDetails: function(taskRow) {
            // Extract task index or ID
            const taskIndex = Array.from(taskRow.parentNode.children).indexOf(taskRow);
            
            // Call original task opening function if exists
            if (window.Tasks && window.Tasks.openTask) {
                window.Tasks.openTask(taskIndex);
            }
            
            // Open panel
            this.openTaskPanel();
            
            if (navigator.vibrate) {
                navigator.vibrate([5]);
            }
        },
        
        addSwipeGestures: function(taskRow) {
            let touchStartX = 0;
            let touchCurrentX = 0;
            let isSwiping = false;
            
            taskRow.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                isSwiping = true;
            }, { passive: true });
            
            taskRow.addEventListener('touchmove', (e) => {
                if (!isSwiping) return;
                
                touchCurrentX = e.touches[0].clientX;
                const diff = touchStartX - touchCurrentX;
                
                if (diff > 50) {
                    taskRow.classList.add('swiping');
                } else {
                    taskRow.classList.remove('swiping');
                }
            }, { passive: true });
            
            taskRow.addEventListener('touchend', () => {
                isSwiping = false;
                
                setTimeout(() => {
                    taskRow.classList.remove('swiping');
                }, 2000);
            }, { passive: true });
        },
        
        showEmptyState: function() {
            const taskRows = document.getElementById('task-rows');
            if (!taskRows) return;
            
            taskRows.innerHTML = `
                <div class="task-empty-state">
                    <div class="task-empty-icon">
                        <i class="fa-solid fa-inbox"></i>
                    </div>
                    <div class="task-empty-title">No tasks yet</div>
                    <div class="task-empty-subtitle">Tap the + button to create your first task</div>
                </div>
            `;
        },
        
        createQuickAddButton: function() {
            const taskRows = document.getElementById('task-rows');
            if (!taskRows || document.querySelector('.quick-add-task')) return;
            
            const quickAdd = document.createElement('div');
            quickAdd.className = 'quick-add-task';
            quickAdd.innerHTML = '<i class="fa-solid fa-plus"></i> Quick Add Task';
            quickAdd.onclick = () => this.addTask();
            
            taskRows.parentNode.appendChild(quickAdd);
        },
        
        createProjectStats: function() {
            const taskMain = document.querySelector('.task-main');
            if (!taskMain || document.querySelector('.mobile-project-stats')) return;
            
            const stats = document.createElement('div');
            stats.className = 'mobile-project-stats';
            stats.innerHTML = `
                <div class="mobile-stat-item">
                    <div class="mobile-stat-number" id="stat-total">0</div>
                    <div class="mobile-stat-label">Total</div>
                </div>
                <div class="mobile-stat-item">
                    <div class="mobile-stat-number" id="stat-active">0</div>
                    <div class="mobile-stat-label">Active</div>
                </div>
                <div class="mobile-stat-item">
                    <div class="mobile-stat-number" id="stat-done">0</div>
                    <div class="mobile-stat-label">Done</div>
                </div>
            `;
            
            taskMain.insertBefore(stats, taskMain.firstChild);
            this.updateProjectStats();
        },
        
        updateProjectStats: function() {
            const tasks = document.querySelectorAll('.task-row');
            const completed = document.querySelectorAll('.task-row.completed');
            
            const total = tasks.length;
            const done = completed.length;
            const active = total - done;
            
            const totalEl = document.getElementById('stat-total');
            const activeEl = document.getElementById('stat-active');
            const doneEl = document.getElementById('stat-done');
            
            if (totalEl) totalEl.textContent = total;
            if (activeEl) activeEl.textContent = active;
            if (doneEl) doneEl.textContent = done;
        },
        
        /* ═══════════════════════════════════════════════════════════════════
           🔄 OBSERVE TASK CHANGES
           ═══════════════════════════════════════════════════════════════ */
        
        observeTaskChanges: function() {
            const taskRows = document.getElementById('task-rows');
            if (!taskRows) return;
            
            const observer = new MutationObserver(() => {
                this.transformTasksToMobile();
                this.updateProjectStats();
            });
            
            observer.observe(taskRows, {
                childList: true,
                subtree: true
            });
        },
        
        setupEventListeners: function() {
            // Override original Tasks.closePanel
            if (window.Tasks) {
                const originalClose = window.Tasks.closePanel;
                window.Tasks.closePanel = () => {
                    this.closeTaskPanel();
                    if (originalClose) originalClose.call(window.Tasks);
                };
            }
            
            // Handle task panel swipe down
            const taskPanel = document.getElementById('task-panel');
            if (taskPanel) {
                let startY = 0;
                let currentY = 0;
                
                taskPanel.addEventListener('touchstart', (e) => {
                    startY = e.touches[0].clientY;
                }, { passive: true });
                
                taskPanel.addEventListener('touchmove', (e) => {
                    currentY = e.touches[0].clientY;
                    const diff = currentY - startY;
                    
                    if (diff > 0 && taskPanel.scrollTop === 0) {
                        taskPanel.style.transform = `translateY(${diff}px)`;
                    }
                }, { passive: true });
                
                taskPanel.addEventListener('touchend', () => {
                    const diff = currentY - startY;
                    
                    if (diff > 100) {
                        this.closeTaskPanel();
                    }
                    
                    taskPanel.style.transform = '';
                }, { passive: true });
            }
        }
    };
    
    /* ═══════════════════════════════════════════════════════════════════════
       🚀 INITIALIZE
       ═══════════════════════════════════════════════════════════════════ */
    
    function init() {
        // Wait for Tasks module to be ready
        const checkReady = setInterval(() => {
            if (document.getElementById('mod-tasks')) {
                clearInterval(checkReady);
                
                // Initialize mobile tasks UI
                setTimeout(() => {
                    window.MobileTasks.init();
                    console.log('✅ Mobile Tasks Module ready!');
                }, 1000);
            }
        }, 500);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
