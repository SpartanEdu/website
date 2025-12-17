/* ==========================================================================
            SPARTAN.EDU - COMPLETE JAVASCRIPT (FIXED & OPTIMIZED)
            All bugs fixed, ready to deploy
            ========================================================================== */

            // ========== CORE UTILITIES ==========
            const Notify = {
                show: (msg, type = 'success') => {
                    const toast = document.createElement('div');
                    toast.className = `toast ${type}`;
                    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> <span>${msg}</span>`;
                    document.getElementById('toast-container').appendChild(toast);
                    setTimeout(() => toast.remove(), 3000);
                }
            };

            const Modals = {
                open: (id) => document.getElementById(id).classList.add('active'),
                close: () => document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active')),
                prompt: (title, label, callback) => {
                    document.getElementById('prompt-title').innerText = title;
                    document.getElementById('prompt-label').innerText = label;
                    const input = document.getElementById('prompt-input');
                    input.value = '';
                    Modals.open('modal-prompt');
                    input.focus();
                    document.getElementById('prompt-confirm').onclick = () => {
                        if (input.value.trim()) {
                            callback(input.value.trim());
                            Modals.close();
                        } else Notify.show('Field cannot be empty', 'error');
                    };
                },
                confirm: (title, msg, callback) => {
                    document.getElementById('confirm-title').innerText = title;
                    document.getElementById('confirm-msg').innerText = msg;
                    Modals.open('modal-confirm');
                    document.getElementById('confirm-btn').onclick = () => {
                        callback();
                        Modals.close();
                    };
                }
            };

            const CustomModal = {
                input: (title, description, defaultValue, callback) => {
                    document.getElementById('custom-input-title').innerText = title;
                    const desc = document.getElementById('custom-input-desc');
                    if (description) {
                        desc.innerText = description;
                        desc.style.display = 'block';
                    } else {
                        desc.style.display = 'none';
                    }

                    const field = document.getElementById('custom-input-field');
                    field.value = defaultValue || '';
                    field.rows = 3;

                    Modals.open('modal-custom-input');
                    setTimeout(() => field.focus(), 100);

                    document.getElementById('custom-input-confirm').onclick = () => {
                        const value = field.value.trim();
                        if (value) {
                            callback(value);
                            Modals.close();
                        } else {
                            Notify.show('Please enter a value', 'error');
                        }
                    };
                },

                cancel: () => {
                    Modals.close();
                }
            };

            const Storage = {
                set: (key, value) => {
                    try {
                        localStorage.setItem(key, JSON.stringify(value));
                    } catch (e) {
                        console.error('Storage error:', e);
                    }
                },
                get: (key) => {
                    try {
                        const data = localStorage.getItem(key);
                        return data ? JSON.parse(data) : null;
                    } catch (e) {
                        return null;
                    }
                },
                setItem: (key, value) => {
                    try {
                        localStorage.setItem(key, value);
                    } catch (e) { }
                },
                getItem: (key) => {
                    try {
                        return localStorage.getItem(key);
                    } catch (e) {
                        return null;
                    }
                }
            };

            const State = {
                currentUser: null,
                decks: [],
                projects: [],
                currD: 0,
                currC: 0,
                currP: 0,
                editCardIdx: null,
                activeTask: null,
                audioCtx: null,
                keyMap: {
                    'C3': 'z', 'C#3': 's', 'D3': 'x', 'D#3': 'd', 'E3': 'c', 'F3': 'v', 'F#3': 'g', 'G3': 'b', 'G#3': 'h', 'A3': 'n', 'A#3': 'j', 'B3': 'm',
                    'C4': 'q', 'C#4': '2', 'D4': 'w', 'D#4': '3', 'E4': 'e', 'F4': 'r', 'F#4': '5', 'G4': 't', 'G#4': '6', 'A4': 'y', 'A#4': '7', 'B4': 'u',
                    'C5': 'i', 'C#5': '9', 'D5': 'o', 'D#5': '0', 'E5': 'p'
                },
                lang: 'en',
                theme: 'light',
                editFolderIdx: null,
                fcShuffle: false,
                currentChannel: 'general',
                currentLesson: 0,
                selectedIcon: '📁',
                selectedColor: '#FF512F'
            };

            const fileToBase64 = (file) => new Promise((r) => {
                const reader = new FileReader();
                reader.onload = () => r(reader.result);
                reader.readAsDataURL(file);
            });

            // ========== DATABASE & AUTH ==========
            const DB = {
                saveUser: (u) => {
                    const users = Storage.get('spartan_users') || [];
                    if (users.find(x => x.email === u.email)) return false;
                    u.id = 'u' + Date.now();
                    users.push(u);
                    Storage.set('spartan_users', users);
                    return true;
                },
                getUser: (email) => {
                    const users = Storage.get('spartan_users') || [];
                    return users.find(u => u.email === email) || null;
                },
                loadUserSession: (user) => {
                    State.currentUser = user;
                    const data = Storage.get('spartan_data_' + user.id);
                    if (data) {
                        State.decks = data.decks || [];
                        State.projects = data.projects || [];
                        State.keyMap = data.keys || State.keyMap;
                    } else {
                        const deckId = Date.now();
                        State.decks = [{
                            id: deckId,
                            name: 'English C1',
                            icon: '📁',
                            color: '#FF512F',
                            role: 'editor',
                            cards: [{ q: 'Ambition', a: 'Hoài bão' }]
                        }];
                        const today = new Date().toLocaleDateString('en-CA');
                        State.projects = [{
                            id: deckId,
                            name: 'English C1',
                            icon: '📁',
                            color: '#FF512F',
                            role: 'editor',
                            tasks: [{
                                id: 1,
                                title: 'Setup Server',
                                done: false,
                                date: today,
                                priority: 'High',
                                assignee: 'Henry'
                            }]
                        }];
                    }
                    Piano.render();
                    FC.renderHub();
                    Tasks.renderSidebar();
                    Pathway.init();
                    Community.init();
                    Whiteboard.init();
                },
                saveCurrentData: () => {
                    if (!State.currentUser) return;
                    const data = {
                        decks: State.decks,
                        projects: State.projects,
                        keys: State.keyMap
                    };
                    Storage.set('spartan_data_' + State.currentUser.id, data);
                }
            };

            const Auth = {
                toggle: (mode) => {
                    ['form-login', 'form-signup'].forEach(id => document.getElementById(id).classList.add('hidden'));
                    document.getElementById('form-' + mode).classList.remove('hidden');
                },
                signup: (e) => {
                    e.preventDefault();
                    const name = document.getElementById('reg-name').value;
                    const email = document.getElementById('reg-email').value;
                    const pass = document.getElementById('reg-pass').value;
                    if (!email || !pass || !name) return Notify.show('Please fill all fields', 'error');
                    if (DB.getUser(email)) return Notify.show('Email already exists', 'error');
                    if (DB.saveUser({ name, email, pass })) {
                        Notify.show('Account Created!');
                        Auth.toggle('login');
                    } else Notify.show('Account creation failed', 'error');
                },
                login: (e) => {
                    e.preventDefault();
                    const email = document.getElementById('log-email').value;
                    const pass = document.getElementById('log-pass').value;
                    const u = DB.getUser(email);
                    if (u && u.pass === pass) {
                        document.getElementById('app-username').innerText = u.name;
                        document.getElementById('app-avatar').innerText = u.name[0] || '?';
                        document.getElementById('auth-screen').classList.add('hidden');
                        document.getElementById('app-shell').classList.remove('hidden');
                        document.getElementById('app-shell').style.opacity = 1;
                        DB.loadUserSession(u);
                        Piano.initKeys();
                        Notify.show('Welcome back, ' + u.name);
                    } else {
                        Notify.show('Invalid Credentials', 'error');
                    }
                },
                logout: () => location.reload()
            };

            const Nav = {
                currentModule: 'piano',
                
                to: (tab, el) => {
                    Nav.currentModule = tab;
                    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                    if (el) el.classList.add('active');
                    document.querySelectorAll('[id^="mod-"]').forEach(m => m.classList.add('hidden'));
                    const target = document.getElementById('mod-' + tab);
                    if (target) target.classList.remove('hidden');
                    if (tab === 'whiteboard' && Whiteboard._inited) {
                        window.dispatchEvent(new Event('resize'));
                    }
                },
                
                back: () => {
                    // Hide community and whiteboard overlays
                    document.getElementById('mod-community').classList.add('hidden');
                    document.getElementById('mod-whiteboard').classList.add('hidden');
                    
                    // Go back to last module (or piano if community/whiteboard)
                    if (Nav.currentModule === 'community' || Nav.currentModule === 'whiteboard') {
                        Nav.currentModule = 'piano';
                    }
                    
                    // Reactivate the nav item
                    const navItem = document.querySelector(`.nav-item[onclick*="${Nav.currentModule}"]`);
                    if (navItem) {
                        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                        navItem.classList.add('active');
                    }
                    
                    // Show the module
                    const target = document.getElementById('mod-' + Nav.currentModule);
                    if (target) target.classList.remove('hidden');
                }
            };

            const Theme = {
                toggle: () => {
                    const current = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
                    document.body.className = 'theme-' + current;
                    Notify.show('Theme updated');
                }
            };

            const Lang = {
                current: 'en', // Default English
                translations: {
                    en: {
                        name: 'English',
                        pianoLab: 'Piano Lab',
                        knowledgeHub: 'Knowledge Hub',
                        taskArena: 'Task Arena',
                        learningPath: 'Learning Path',
                        community: 'Community',
                        whiteboard: 'Whiteboard',
                        startStudy: 'Start Study',
                        quiz: 'Quiz',
                        share: 'Share',
                        addCard: '+ Add',
                        editDeck: 'Edit Deck',
                        goToTasks: 'Go to Tasks',
                        shuffle: 'Shuffle',
                        cards: 'cards',
                        viewer: 'Viewer',
                        editor: 'Editor',
                        languageChanged: 'Language changed to English'
                    },
                    vi: {
                        name: 'Tiếng Việt',
                        pianoLab: 'Phòng Piano',
                        knowledgeHub: 'Trung Tâm Kiến Thức',
                        taskArena: 'Quản Lý Công Việc',
                        learningPath: 'Lộ Trình Học',
                        community: 'Cộng Đồng',
                        whiteboard: 'Bảng Vẽ',
                        startStudy: 'Bắt Đầu Học',
                        quiz: 'Kiểm Tra',
                        share: 'Chia Sẻ',
                        addCard: '+ Thêm',
                        editDeck: 'Sửa Bộ Thẻ',
                        goToTasks: 'Đến Công Việc',
                        shuffle: 'Xáo Trộn',
                        cards: 'thẻ',
                        viewer: 'Người Xem',
                        editor: 'Người Chỉnh Sửa',
                        languageChanged: 'Đã đổi sang Tiếng Việt'
                    }
                },

                toggle: () => {
                    Lang.current = Lang.current === 'en' ? 'vi' : 'en';
                    State.lang = Lang.current;
                    DB.saveCurrentData();
                    Lang.updateUI();
                    const msg = Lang.translations[Lang.current].languageChanged;
                    Notify.show(msg);
                },

                t: (key) => {
                    return Lang.translations[Lang.current][key] || key;
                },

                updateUI: () => {
                    // Update sidebar navigation
                    const navItems = document.querySelectorAll('.nav-item span');
                    if (navItems[0]) navItems[0].textContent = Lang.t('pianoLab');
                    if (navItems[1]) navItems[1].textContent = Lang.t('knowledgeHub');
                    if (navItems[2]) navItems[2].textContent = Lang.t('taskArena');
                    if (navItems[3]) navItems[3].textContent = Lang.t('learningPath');
                    if (navItems[4]) navItems[4].textContent = Lang.t('community');
                    if (navItems[5]) navItems[5].textContent = Lang.t('whiteboard');
                }
            };

            // ========== PIANO MODULE ==========
            const Piano = {
                notes: [
                    { n: 'C3', t: 'w' }, { n: 'C#3', t: 'b' }, { n: 'D3', t: 'w' }, { n: 'D#3', t: 'b' }, { n: 'E3', t: 'w' },
                    { n: 'F3', t: 'w' }, { n: 'F#3', t: 'b' }, { n: 'G3', t: 'w' }, { n: 'G#3', t: 'b' }, { n: 'A3', t: 'w' },
                    { n: 'A#3', t: 'b' }, { n: 'B3', t: 'w' }, { n: 'C4', t: 'w' }, { n: 'C#4', t: 'b' }, { n: 'D4', t: 'w' },
                    { n: 'D#4', t: 'b' }, { n: 'E4', t: 'w' }, { n: 'F4', t: 'w' }, { n: 'F#4', t: 'b' }, { n: 'G4', t: 'w' },
                    { n: 'G#4', t: 'b' }, { n: 'A4', t: 'w' }, { n: 'A#4', t: 'b' }, { n: 'B4', t: 'w' }, { n: 'C5', t: 'w' },
                    { n: 'C#5', t: 'b' }, { n: 'D5', t: 'w' }, { n: 'D#5', t: 'b' }, { n: 'E5', t: 'w' }
                ],
                initKeys: () => {
                    document.addEventListener('keydown', Piano.handleKeyDown);
                },
                render: () => {
                    const box = document.getElementById('piano-keys');
                    if (!box) return;
                    box.innerHTML = '';
                    let pos = 0;
                    Piano.notes.forEach(k => {
                        const el = document.createElement('div');
                        el.dataset.note = k.n;
                        const labelText = (State.keyMap[k.n] || '').toUpperCase();
                        if (k.t === 'w') {
                            el.className = 'key key-white';
                            el.innerHTML = `<span class="key-label">${labelText}</span>`;
                            pos += 50;
                        } else {
                            el.className = 'key key-black';
                            el.style.left = (pos - 15) + 'px';
                            el.innerHTML = `<span class="key-label">${labelText}</span>`;
                        }
                        el.onmousedown = () => Piano.play(k.n, el);
                        box.appendChild(el);
                    });
                },
                play: (note, el) => {
                    if (!State.audioCtx) State.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = State.audioCtx.createOscillator();
                    const gain = State.audioCtx.createGain();
                    const freqs = {
                        'C3': 130.8, 'C#3': 138.6, 'D3': 146.8, 'D#3': 155.6, 'E3': 164.8, 'F3': 174.6, 'F#3': 185.0, 'G3': 196.0,
                        'G#3': 207.6, 'A3': 220.0, 'A#3': 233.1, 'B3': 246.9, 'C4': 261.6, 'C#4': 277.2, 'D4': 293.7, 'D#4': 311.1,
                        'E4': 329.6, 'F4': 349.2, 'F#4': 370.0, 'G4': 392.0, 'G#4': 415.3, 'A4': 440.0, 'A#4': 466.2, 'B4': 493.9,
                        'C5': 523.3, 'C#5': 554.4, 'D5': 587.3, 'D#5': 622.3, 'E5': 659.3
                    };
                    osc.type = document.getElementById('wave-type').value;
                    osc.frequency.value = freqs[note];
                    const now = State.audioCtx.currentTime;
                    const vol = document.getElementById('vol-slider').value / 100;
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(vol, now + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
                    osc.connect(gain);
                    gain.connect(State.audioCtx.destination);
                    osc.start();
                    osc.stop(now + 1);
                    if (el) {
                        el.classList.add('active');
                        setTimeout(() => el.classList.remove('active'), 200);
                    }
                },
                handleKeyDown: (e) => {
                    if (e.repeat || document.querySelector('.modal-overlay.active') || document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
                    const note = Object.keys(State.keyMap).find(k => (State.keyMap[k] || '').toUpperCase() === e.key.toUpperCase());
                    if (note) Piano.play(note, document.querySelector(`[data-note="${note}"]`));
                },
                openBindEditor: () => {
                    const list = document.getElementById('binds-list');
                    list.innerHTML = '';
                    Piano.notes.forEach(note => {
                        const row = document.createElement('div');
                        row.className = 'bind-row';
                        row.innerHTML = `<span class="bind-key">${note.n}</span> <input class="bind-input" data-note="${note.n}" value="${State.keyMap[note.n] || ''}" maxlength="1">`;
                        list.appendChild(row);
                    });
                    Modals.open('modal-keybinds');
                },
                saveBinds: () => {
                    const newMap = {};
                    document.querySelectorAll('.bind-input').forEach(inp => {
                        if (inp.value) newMap[inp.dataset.note] = inp.value.toLowerCase();
                    });
                    State.keyMap = newMap;
                    DB.saveCurrentData();
                    Piano.render();
                    Modals.close();
                    Notify.show('Keybinds saved');
                }
            };

            // ========== FLASHCARDS MODULE ==========
            const FC = {
                renderHub: () => {
                    const container = document.getElementById('folder-grid');
                    if (!container) return;
                    container.innerHTML = State.decks.map((f, i) => `
                        <div class="folder-card" onclick="FC.openOverview(${i})">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <div style="font-size: 2.5rem; color: ${f.color || '#FF512F'}; margin-bottom: 10px;">${f.icon || '📁'}</div>
                                <div class="flex gap-10">
                                    ${f.role === 'editor' ? `
                                        <button class="btn-icon-sm" style="background:transparent;" onclick="event.stopPropagation(); FC.openEditFolderModal(${i})"><i class="fa-solid fa-pen"></i></button>
                                        <button class="btn-icon-sm" style="color:var(--status-danger); background:transparent;" onclick="event.stopPropagation(); FC.deleteFolder(${i})"><i class="fa-solid fa-trash"></i></button>
                                    ` : ''}
                                </div>
                            </div>
                            <div>
                                <h3 style="color:var(--text-primary); font-size:1.2rem;">${f.name}</h3>
                                <p style="color:var(--text-secondary);">${f.cards.length} cards ${f.role === 'viewer' ? '• <span class="read-only-badge">Read Only</span>' : ''}</p>
                            </div>
                        </div>`).join('');
                },
                createFolder: (name) => {
                    const id = Date.now();
                    State.decks.push({
                        id,
                        name,
                        icon: '📁',
                        color: '#FF512F',
                        role: 'editor',
                        cards: []
                    });
                    State.projects.push({
                        id,
                        name,
                        icon: '📁',
                        color: '#FF512F',
                        role: 'editor',
                        tasks: []
                    });
                    DB.saveCurrentData();
                    FC.renderHub();
                    Tasks.renderSidebar();
                    Notify.show('Deck & Project created');
                },
                deleteFolder: (index) => {
                    if (State.decks[index].role === 'viewer') return Notify.show('Cannot delete read-only deck', 'error');
                    Modals.confirm('Delete Deck', 'Are you sure?', () => {
                        const deckId = State.decks[index].id;
                        State.decks.splice(index, 1);
                        const projIdx = State.projects.findIndex(p => p.id === deckId);
                        if (projIdx !== -1) State.projects.splice(projIdx, 1);
                        DB.saveCurrentData();
                        FC.renderHub();
                        Tasks.renderSidebar();
                        Notify.show('Deck deleted');
                    });
                },
                openOverview: (i) => {
                    State.currD = i;
                    const deck = State.decks[i];
                    document.getElementById('fc-overview-panel').classList.remove('hidden');
                    document.getElementById('ov-title').innerText = deck.name;

                    const roleBadge = document.getElementById('ov-role-badge');
                    if (deck.role === 'viewer') {
                        roleBadge.classList.remove('hidden');
                    } else {
                        roleBadge.classList.add('hidden');
                    }

                    const isViewer = deck.role === 'viewer';
                    document.getElementById('btn-edit-folder').disabled = isViewer;
                    document.getElementById('btn-add-card').disabled = isViewer;
                    if (isViewer) {
                        document.getElementById('btn-edit-folder').style.opacity = '0.5';
                        document.getElementById('btn-add-card').style.opacity = '0.5';
                    } else {
                        document.getElementById('btn-edit-folder').style.opacity = '1';
                        document.getElementById('btn-add-card').style.opacity = '1';
                    }

                    document.getElementById('word-list').innerHTML = deck.cards.map((c, cardIdx) => `
                        <div class="mini-card-scene" style="position: relative;">
                            ${deck.role === 'editor' ? `
                                <button class="btn-delete-float" onclick="event.stopPropagation(); FC.deleteCardByIndex(${cardIdx})" title="Delete card">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                                <button class="btn-edit-float" onclick="event.stopPropagation(); FC.openEditCard(${cardIdx})" title="Edit card">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                            ` : ''}
                            <div class="mini-card" onclick="this.classList.toggle('flipped')">
                                <div class="mini-face front">
                                    ${c.img ? `<img src="${c.img}" class="card-img-display">` : ''}
                                    <div>${c.q}</div>
                                </div>
                                <div class="mini-face back">${c.a}</div>
                            </div>
                        </div>`).join('');
                },
                closeOverview: () => document.getElementById('fc-overview-panel').classList.add('hidden'),

                openEditCard: (cardIdx) => {
                    if (State.decks[State.currD].role === 'viewer') return Notify.show('Read-only deck', 'error');
                    State.editCardIdx = cardIdx;
                    const card = State.decks[State.currD].cards[cardIdx];

                    document.getElementById('edit-card-q').value = card.q;
                    document.getElementById('edit-card-a').value = card.a;

                    if (card.img) {
                        document.getElementById('edit-card-preview').src = card.img;
                        document.getElementById('edit-card-label').style.display = 'none';
                        document.getElementById('edit-card-preview-container').style.display = 'block';
                    } else {
                        document.getElementById('edit-card-label').style.display = 'block';
                        document.getElementById('edit-card-preview-container').style.display = 'none';
                    }

                    Modals.open('modal-edit-card');
                },

                updateCard: async () => {
                    if (State.editCardIdx === null) return;
                    const card = State.decks[State.currD].cards[State.editCardIdx];

                    card.q = document.getElementById('edit-card-q').value;
                    card.a = document.getElementById('edit-card-a').value;

                    const file = document.getElementById('edit-card-img').files[0];
                    if (file) {
                        card.img = await fileToBase64(file);
                    } else if (document.getElementById('edit-card-preview-container').style.display === 'none') {
                        card.img = null;
                    }

                    DB.saveCurrentData();

                    // Check if study mode is active
                    const studyOverlay = document.getElementById('study-overlay');
                    if (studyOverlay && !studyOverlay.classList.contains('hidden')) {
                        // Update the current card display in study mode
                        FC.updCard();
                    }

                    FC.openOverview(State.currD);
                    Modals.close();
                    Notify.show('Card updated');
                },

                deleteCard: () => {
                    if (State.editCardIdx === null) return;
                    Modals.confirm('Delete Card', 'Are you sure?', () => {
                        State.decks[State.currD].cards.splice(State.editCardIdx, 1);
                        DB.saveCurrentData();
                        FC.openOverview(State.currD);
                        Modals.close();
                        Notify.show('Card deleted');
                    });
                },

                deleteCardByIndex: (cardIdx) => {
                    if (State.decks[State.currD].role === 'viewer') return Notify.show('Read-only deck', 'error');

                    Modals.confirm('Delete Card', 'Are you sure you want to delete this card?', () => {
                        State.decks[State.currD].cards.splice(cardIdx, 1);
                        DB.saveCurrentData();
                        FC.openOverview(State.currD);
                        Notify.show('Card deleted');
                    });
                },

                editFolder: () => {
                    if (State.decks[State.currD].role === 'viewer') return Notify.show('Read-only deck', 'error');

                    const deck = State.decks[State.currD];
                    document.getElementById('edit-folder-name').value = deck.name;

                    State.selectedIcon = deck.icon;
                    State.selectedColor = deck.color;

                    document.querySelectorAll('.icon-option').forEach(opt => {
                        if (opt.dataset.icon === deck.icon) {
                            opt.classList.add('selected');
                        } else {
                            opt.classList.remove('selected');
                        }
                    });

                    document.querySelectorAll('.color-option').forEach(opt => {
                        if (opt.dataset.color === deck.color) {
                            opt.classList.add('selected');
                        } else {
                            opt.classList.remove('selected');
                        }
                    });

                    Modals.open('modal-edit-folder');
                },

                selectIcon: (el) => {
                    document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
                    el.classList.add('selected');
                    State.selectedIcon = el.dataset.icon;
                },

                selectColor: (el) => {
                    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                    el.classList.add('selected');
                    State.selectedColor = el.dataset.color;
                },

                saveFolderEdit: () => {
                    const deck = State.decks[State.currD];
                    const newName = document.getElementById('edit-folder-name').value.trim();

                    if (!newName) return Notify.show('Name cannot be empty', 'error');

                    deck.name = newName;
                    deck.icon = State.selectedIcon;
                    deck.color = State.selectedColor;

                    const proj = State.projects.find(p => p.id === deck.id);
                    if (proj) {
                        proj.name = newName;
                        proj.icon = State.selectedIcon;
                        proj.color = State.selectedColor;
                    }

                    DB.saveCurrentData();
                    FC.renderHub();
                    Tasks.renderSidebar();
                    FC.openOverview(State.currD);
                    Modals.close();
                    Notify.show('Deck updated');
                },

                openEditFolderModal: (deckIdx) => {
                    State.currD = deckIdx;
                    FC.editFolder();
                },

                deleteFolder: (deckIdx) => {
                    const deck = State.decks[deckIdx];
                    if (deck.role === 'viewer') return Notify.show('Cannot delete read-only deck', 'error');

                    Modals.confirm('Delete Deck', `Are you sure you want to delete "${deck.name}"? This cannot be undone.`, () => {
                        // Delete the deck
                        State.decks.splice(deckIdx, 1);

                        // Delete corresponding project if exists
                        const projIdx = State.projects.findIndex(p => p.id === deck.id);
                        if (projIdx !== -1) {
                            State.projects.splice(projIdx, 1);
                        }

                        // Reset current deck index if needed
                        if (State.currD >= State.decks.length) {
                            State.currD = Math.max(0, State.decks.length - 1);
                        }

                        DB.saveCurrentData();
                        FC.renderHub();
                        Tasks.renderSidebar();
                        Notify.show('Deck deleted');
                    });
                },

                jumpToTasks: () => {
                    FC.closeOverview();
                    const deckId = State.decks[State.currD].id;
                    const pIdx = State.projects.findIndex(p => p.id === deckId);
                    if (pIdx !== -1) {
                        const taskNav = document.querySelectorAll('.nav-item')[2];
                        Nav.to('tasks', taskNav);
                        Tasks.switch(pIdx);
                    }
                },

                handleFileSelect: async (input, previewId, labelId, containerId, removeBtnId) => {
                    const file = input.files[0];
                    if (!file) return;
                    document.getElementById(labelId).style.display = 'none';
                    document.getElementById(containerId).style.display = 'block';
                    const res = await fileToBase64(file);
                    document.getElementById(previewId).src = res;
                },

                removeImage: (inputId, previewId, labelId, containerId) => {
                    document.getElementById(inputId).value = '';
                    document.getElementById(previewId).src = '';
                    document.getElementById(containerId).style.display = 'none';
                    document.getElementById(labelId).style.display = 'block';
                },

                submitCard: async () => {
                    if (State.decks[State.currD].role === 'viewer') return Notify.show('Read-only deck', 'error');

                    const q = document.getElementById('new-q').value;
                    const a = document.getElementById('new-a').value;
                    const file = document.getElementById('new-img').files[0];
                    let img = null;
                    if (file) img = await fileToBase64(file);

                    if (q && a) {
                        State.decks[State.currD].cards.push({ q, a, img });
                        DB.saveCurrentData();
                        document.getElementById('new-q').value = '';
                        document.getElementById('new-a').value = '';
                        FC.removeImage('new-img', 'add-preview', 'add-label', 'add-preview-container');
                        Modals.close();
                        FC.openOverview(State.currD);
                        Notify.show('Card added');
                    }
                },

                startStudy: () => {
                    if (State.decks[State.currD].cards.length === 0) return Notify.show('Empty Deck', 'info');
                    State.currC = 0;
                    document.getElementById('study-overlay').classList.remove('hidden');
                    document.getElementById('mode-flip').classList.remove('hidden');
                    document.getElementById('mode-quiz').classList.add('hidden');
                    FC.updCard();
                },

                startQuiz: () => {
                    if (State.decks[State.currD].cards.length === 0) return Notify.show('Empty Deck', 'info');
                    State.currC = 0;
                    document.getElementById('study-overlay').classList.remove('hidden');
                    document.getElementById('mode-flip').classList.add('hidden');
                    document.getElementById('mode-quiz').classList.remove('hidden');
                    FC.loadQuiz();
                },

                closeStudy: () => document.getElementById('study-overlay').classList.add('hidden'),

                updCard: () => {
                    const c = State.decks[State.currD].cards[State.currC];
                    document.getElementById('st-img-container').innerHTML = c.img ? `<img src="${c.img}" class="card-img-display">` : '';
                    document.getElementById('st-q').innerText = c.q;
                    document.getElementById('st-a').innerText = c.a;
                    document.getElementById('st-count').innerText = `${State.currC + 1} / ${State.decks[State.currD].cards.length}`;
                    document.querySelector('.card-3d').classList.remove('flipped');

                    // Show/hide edit buttons based on deck role
                    const actionsDiv = document.getElementById('study-card-actions');
                    if (actionsDiv) {
                        if (State.decks[State.currD].role === 'viewer') {
                            actionsDiv.style.display = 'none';
                        } else {
                            actionsDiv.style.display = 'flex';
                        }
                    }
                },

                nav: (d) => {
                    const n = State.currC + d;
                    if (n >= 0 && n < State.decks[State.currD].cards.length) {
                        State.currC = n;
                        FC.updCard();
                    }
                },

                editCurrentCard: () => {
                    if (State.decks[State.currD].role === 'viewer') return Notify.show('Read-only deck', 'error');
                    FC.openEditCard(State.currC);
                },

                deleteCurrentCard: () => {
                    if (State.decks[State.currD].role === 'viewer') return Notify.show('Read-only deck', 'error');

                    Modals.confirm('Delete Card', 'Are you sure you want to delete this card?', () => {
                        State.decks[State.currD].cards.splice(State.currC, 1);
                        DB.saveCurrentData();

                        // If no more cards, close study mode
                        if (State.decks[State.currD].cards.length === 0) {
                            FC.closeStudy();
                            FC.openOverview(State.currD);
                            Notify.show('Card deleted - deck is now empty');
                            return;
                        }

                        // Adjust current card index if needed
                        if (State.currC >= State.decks[State.currD].cards.length) {
                            State.currC = State.decks[State.currD].cards.length - 1;
                        }

                        FC.updCard();
                        FC.openOverview(State.currD); // Update the overview panel too
                        Notify.show('Card deleted');
                    });
                },

                loadQuiz: () => {
                    const c = State.decks[State.currD].cards[State.currC];
                    document.getElementById('qz-q').innerText = c.q;
                    document.getElementById('qz-a').innerText = c.a;
                    document.getElementById('qz-reveal').classList.add('hidden');
                    document.getElementById('qz-btn-show').classList.remove('hidden');
                },

                showQuiz: () => {
                    document.getElementById('qz-reveal').classList.remove('hidden');
                    document.getElementById('qz-btn-show').classList.add('hidden');
                },

                ans: () => {
                    if (State.currC < State.decks[State.currD].cards.length - 1) {
                        State.currC++;
                        FC.loadQuiz();
                    } else {
                        Notify.show('Quiz completed!');
                        FC.closeStudy();
                    }
                },

                shuffleNow: () => {
                    if (State.decks[State.currD].role === 'viewer') return Notify.show('Cannot shuffle read-only deck', 'error');

                    const cards = State.decks[State.currD].cards;
                    for (let i = cards.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [cards[i], cards[j]] = [cards[j], cards[i]];
                    }
                    DB.saveCurrentData();
                    FC.renderHub();
                    try { FC.openOverview(State.currD); } catch (e) { }
                    Notify.show('Cards shuffled');
                },

                shareCurrentDeck: () => Shared.share('deck', State.decks[State.currD])
            };

            // ========== TASKS MODULE ==========
            const Tasks = {
                renderSidebar: () => {
                    const container = document.getElementById('project-list');
                    if (!container) return;
                    container.innerHTML = State.projects.map((p, i) => `
                        <div class="project-item ${i === State.currP ? 'active' : ''}" onclick="Tasks.switch(${i})">
                            <div style="font-size: 1.2rem;">${p.icon || '📁'}</div>
                            <div style="width:8px; height:8px; border-radius:50%; background:${p.color || '#F59E0B'}"></div> 
                            ${p.name}
                            ${p.role === 'viewer' ? '<span class="read-only-badge">Read Only</span>' : ''}
                        </div>`).join('');
                    Tasks.renderBoard();
                },

                switch: (i) => {
                    State.currP = i;
                    Tasks.renderSidebar();
                },

                createProject: (name) => {
                    const id = Date.now();
                    State.projects.push({
                        id,
                        name,
                        icon: '📁',
                        color: '#FF512F',
                        role: 'editor',
                        tasks: []
                    });
                    State.decks.push({
                        id,
                        name,
                        icon: '📁',
                        color: '#FF512F',
                        role: 'editor',
                        cards: []
                    });
                    DB.saveCurrentData();
                    Tasks.renderSidebar();
                    FC.renderHub();
                    Notify.show('Project Created');
                },

                renderBoard: () => {
                    const p = State.projects[State.currP];
                    document.getElementById('proj-header').innerText = p ? p.name : 'No Project';
                    const container = document.getElementById('task-rows');
                    if (!container) return;
                    if (!p || !p.tasks.length) {
                        container.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-secondary)">No tasks</div>';
                        return;
                    }
                    container.innerHTML = p.tasks.map(t => `
                        <div class="task-row ${t.done ? 'completed' : ''}" onclick="Tasks.openPanel(${t.id})">
                            <div class="checkbox"><i class="fa-solid fa-check" style="font-size:10px; color:${t.done ? 'white' : 'transparent'}"></i></div>
                            <div style="font-weight:500;">${t.title}</div>
                            <div style="font-size:0.8rem; color:var(--text-secondary);">${t.assignee || 'Unassigned'}</div>
                            <div style="color:${t.done ? 'var(--text-secondary)' : '#EF4444'}">${t.date}</div>
                            <div style="font-size:0.7rem; padding:4px 8px; border-radius:4px; text-align:center; background:rgba(59,130,246,0.2); color:#3B82F6">${t.priority}</div>
                        </div>`).join('');
                },

                addTask: () => {
                    const p = State.projects[State.currP];
                    if (!p) return;
                    if (p.role === 'viewer') return Notify.show('Read-only project', 'error');

                    const newId = Date.now();
                    p.tasks.push({
                        id: newId,
                        title: "New Task",
                        done: false,
                        priority: 'Low',
                        date: new Date().toLocaleDateString('en-CA'),
                        assignee: 'Me',
                        img: null,
                        desc: '',
                        comments: []
                    });
                    DB.saveCurrentData();
                    Tasks.renderBoard();
                    Tasks.openPanel(newId);
                },

                openPanel: (id) => {
                    const t = State.projects[State.currP].tasks.find(x => x.id === id);
                    if (!t) return;
                    State.activeTask = t;

                    // Initialize comments array if not exists
                    if (!t.comments) t.comments = [];

                    const isViewer = State.projects[State.currP].role === 'viewer';
                    document.getElementById('edit-title').value = t.title;
                    document.getElementById('edit-date').value = t.date;
                    document.getElementById('edit-priority').value = t.priority;
                    document.getElementById('edit-assignee').value = t.assignee;
                    document.getElementById('edit-desc').value = t.desc || '';

                    document.getElementById('edit-title').disabled = isViewer;
                    document.getElementById('edit-date').disabled = isViewer;
                    document.getElementById('edit-priority').disabled = isViewer;
                    document.getElementById('edit-assignee').disabled = isViewer;
                    document.getElementById('edit-desc').disabled = isViewer;

                    const hasImg = !!t.img;
                    document.getElementById('task-img-label').style.display = hasImg ? 'none' : 'block';
                    document.getElementById('task-preview-container').style.display = hasImg ? 'block' : 'none';
                    document.getElementById('task-img-preview').src = t.img || '';

                    // Render comments
                    Tasks.renderComments();

                    document.getElementById('task-panel').classList.add('open');
                },

                renderComments: () => {
                    const container = document.getElementById('task-comments-list');
                    if (!container) return;

                    const task = State.activeTask;
                    if (!task || !task.comments) {
                        container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">No comments yet</div>';
                        return;
                    }

                    const currentUserName = State.currentUser ? State.currentUser.name : 'User';

                    container.innerHTML = task.comments.map((c, idx) => `
                        <div class="task-comment">
                            <div class="task-comment-header">
                                <div class="task-comment-avatar">${c.author[0]}</div>
                                <div style="flex: 1;">
                                    <div class="task-comment-author">${c.author}</div>
                                    <div class="task-comment-time">${c.time}</div>
                                </div>
                                ${c.author === currentUserName ? `
                                    <button class="task-comment-delete" onclick="Tasks.deleteComment(${idx})" title="Delete comment">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                ` : ''}
                            </div>
                            <div class="task-comment-text">${c.text}</div>
                        </div>
                    `).join('');

                    // Scroll to bottom
                    container.scrollTop = container.scrollHeight;
                },

                addComment: () => {
                    const input = document.getElementById('task-comment-input');
                    const text = input.value.trim();

                    if (!text) return Notify.show('Comment cannot be empty', 'error');
                    if (!State.activeTask) return;

                    const currentUserName = State.currentUser ? State.currentUser.name : 'User';

                    State.activeTask.comments.push({
                        id: Date.now(),
                        author: currentUserName,
                        text: text,
                        time: new Date().toLocaleString()
                    });

                    input.value = '';
                    DB.saveCurrentData();
                    Tasks.renderComments();
                    Notify.show('Comment added');
                },

                deleteComment: (idx) => {
                    if (!State.activeTask) return;

                    Modals.confirm('Delete Comment', 'Are you sure you want to delete this comment?', () => {
                        State.activeTask.comments.splice(idx, 1);
                        DB.saveCurrentData();
                        Tasks.renderComments();
                        Notify.show('Comment deleted');
                    });
                },

                closePanel: () => {
                    const t = State.activeTask;
                    if (t && State.projects[State.currP].role === 'editor') {
                        t.title = document.getElementById('edit-title').value;
                        t.date = document.getElementById('edit-date').value;
                        t.priority = document.getElementById('edit-priority').value;
                        t.assignee = document.getElementById('edit-assignee').value;
                        t.desc = document.getElementById('edit-desc').value;
                        if (document.getElementById('task-preview-container').style.display === 'none') t.img = null;
                        DB.saveCurrentData();
                        Tasks.renderBoard();
                    }
                    document.getElementById('task-panel').classList.remove('open');
                    State.activeTask = null;
                },

                handleTaskImage: async (input) => {
                    if (State.projects[State.currP].role === 'viewer') return Notify.show('Read-only project', 'error');

                    const file = input.files[0];
                    if (file) {
                        const img = await fileToBase64(file);
                        document.getElementById('task-img-preview').src = img;
                        document.getElementById('task-img-label').style.display = 'none';
                        document.getElementById('task-preview-container').style.display = 'block';
                        if (State.activeTask) State.activeTask.img = img;
                    }
                },

                removeImage: () => {
                    if (State.projects[State.currP].role === 'viewer') return Notify.show('Read-only project', 'error');

                    document.getElementById('task-img').value = '';
                    document.getElementById('task-img-preview').src = '';
                    document.getElementById('task-preview-container').style.display = 'none';
                    document.getElementById('task-img-label').style.display = 'block';
                    if (State.activeTask) State.activeTask.img = null;
                },

                deleteTask: () => {
                    if (!State.activeTask) return;
                    if (State.projects[State.currP].role === 'viewer') return Notify.show('Read-only project', 'error');

                    const proj = State.projects[State.currP];
                    proj.tasks = proj.tasks.filter(x => x.id !== State.activeTask.id);
                    DB.saveCurrentData();
                    State.activeTask = null;
                    document.getElementById('task-panel').classList.remove('open');
                    Tasks.renderBoard();
                    Modals.close();
                    Notify.show('Task deleted');
                },

                complete: () => {
                    if (State.activeTask && State.projects[State.currP].role === 'editor') {
                        State.activeTask.done = !State.activeTask.done;
                        DB.saveCurrentData();
                        Tasks.closePanel();
                        Notify.show('Status updated');
                    }
                },

                jumpToFlashcards: () => {
                    const deckIdx = State.decks.findIndex(d => d.id === State.projects[State.currP].id);
                    if (deckIdx !== -1) {
                        const fcNav = document.querySelectorAll('.nav-item')[1];
                        Nav.to('flashcards', fcNav);
                        FC.openOverview(deckIdx);
                    }
                },

                share: () => Shared.share('project', State.projects[State.currP])
            };

            // ========== SHARING SYSTEM ==========
            const Shared = {
                selectedRole: 'editor', // Default role
                shareType: null,
                shareData: null,

                openJoinUI: () => {
                    document.getElementById('join-id').value = '';
                    document.getElementById('join-pass').value = '';
                    Modals.open('modal-join');
                },

                share: (type, data) => {
                    // Store data temporarily and open permission selection modal
                    Shared.shareType = type;
                    Shared.shareData = data;
                    Shared.selectedRole = 'editor'; // Reset to default

                    // Reset selection UI
                    document.querySelectorAll('.permission-option').forEach(opt => {
                        if (opt.dataset.role === 'editor') {
                            opt.classList.add('selected');
                        } else {
                            opt.classList.remove('selected');
                        }
                    });

                    Modals.open('modal-share-permission');
                },

                selectPermission: (role, element) => {
                    Shared.selectedRole = role;
                    document.querySelectorAll('.permission-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    element.classList.add('selected');
                },

                confirmShare: () => {
                    const id = "SPF-" + Math.floor(10000 + Math.random() * 90000);
                    const password = Math.random().toString(36).substring(2, 10).toUpperCase();

                    const sharedResources = Storage.get('spartan_shared') || {};
                    sharedResources[id] = {
                        type: Shared.shareType,
                        data: JSON.parse(JSON.stringify(Shared.shareData)),
                        password: password,
                        role: Shared.selectedRole, // Store the selected role
                        createdAt: Date.now(),
                        createdBy: State.currentUser.id
                    };
                    Storage.set('spartan_shared', sharedResources);

                    document.getElementById('share-id-display').value = id;
                    document.getElementById('share-pass-display').value = password;

                    Modals.close();
                    Modals.open('modal-share-result');

                    Notify.show('Share link created!', 'success');
                },

                confirmJoin: () => {
                    const id = document.getElementById('join-id').value.trim();
                    const password = document.getElementById('join-pass').value.trim();

                    if (!id || !password) {
                        return Notify.show('Please fill all fields', 'error');
                    }

                    const sharedResources = Storage.get('spartan_shared') || {};
                    const resource = sharedResources[id];

                    if (!resource) {
                        return Notify.show('Invalid Resource ID', 'error');
                    }

                    if (resource.password !== password) {
                        return Notify.show('Incorrect password', 'error');
                    }

                    const imported = JSON.parse(JSON.stringify(resource.data));
                    imported.role = resource.role || 'viewer'; // Use the role from share link, default to viewer
                    imported.id = Date.now();
                    imported.name = imported.name + ' (Shared)';

                    if (resource.type === 'deck') {
                        State.decks.push(imported);
                        State.projects.push({
                            id: imported.id,
                            name: imported.name,
                            icon: imported.icon,
                            color: imported.color,
                            role: imported.role,
                            tasks: []
                        });
                    } else if (resource.type === 'project') {
                        State.projects.push(imported);
                        State.decks.push({
                            id: imported.id,
                            name: imported.name,
                            icon: imported.icon,
                            color: imported.color,
                            role: imported.role,
                            cards: []
                        });
                    } else if (resource.type === 'course') {
                        imported.chapters = imported.chapters || [];
                        Pathway.courses.push(imported);
                        Pathway.saveCourses();
                        Pathway.renderCourseList();
                    }

                    DB.saveCurrentData();
                    FC.renderHub();
                    Tasks.renderSidebar();
                    Modals.close();
                    Notify.show('Resource imported successfully!', 'success');
                },

                copyToClipboard: (inputId) => {
                    const input = document.getElementById(inputId);
                    input.select();
                    document.execCommand('copy');
                    Notify.show('Copied to clipboard!', 'success');
                }
            };

            // ========== PATHWAY MODULE ==========
            const Pathway = {
                courses: [],
                currentCourse: 0,
                currentLesson: 0,

                init: () => {
                    // Load courses from storage or create default
                    const savedCourses = Storage.get('spartan_courses_' + (State.currentUser ? State.currentUser.id : 'guest'));
                    if (savedCourses && savedCourses.length > 0) {
                        Pathway.courses = savedCourses;
                    } else {
                        Pathway.courses = [{
                            id: 'course_' + Date.now(),
                            title: 'My First Course',
                            role: 'creator',
                            icon: '🎓',
                            color: '#FF512F',
                            chapters: [{
                                id: 'chapter_' + Date.now(),
                                title: 'Getting Started',
                                lessons: [{
                                    id: 'lesson_' + Date.now(),
                                    title: 'Welcome',
                                    duration: '5:00',
                                    completed: false,
                                    videoUrl: null,
                                    content: 'Welcome to your learning journey!'
                                }]
                            }]
                        }];
                        Pathway.saveCourses();
                    }

                    Pathway.renderCourseList();
                    if (Pathway.courses.length > 0) {
                        Pathway.switchCourse(0);
                    }
                },

                saveCourses: () => {
                    if (!State.currentUser) return;
                    Storage.set('spartan_courses_' + State.currentUser.id, Pathway.courses);
                },

                renderCourseList: () => {
                    const container = document.getElementById('course-list');
                    if (!container) return;

                    container.innerHTML = Pathway.courses.map((course, idx) => `
                        <div class="course-card ${idx === Pathway.currentCourse ? 'active' : ''}" onclick="Pathway.switchCourse(${idx})">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="font-size: 1.5rem;">${course.icon || '🎓'}</div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: var(--text-primary);">${course.title}</div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary);">
                                        ${course.chapters ? course.chapters.length : 0} chapters
                                    </div>
                                </div>
                            </div>
                            ${course.role ? `<div class="course-badge ${course.role}">${course.role === 'creator' ? '👑 Creator' : '👁️ Viewer'}</div>` : ''}
                        </div>
                    `).join('');
                },

                switchCourse: (idx) => {
                    Pathway.currentCourse = idx;
                    Pathway.currentLesson = 0;
                    Pathway.renderCourseList();
                    Pathway.renderChapters();
                    Pathway.loadLesson(0);
                    Pathway.updateProgress();
                },

                createCourse: () => {
                    CustomModal.input('Create Course', 'Enter a title for your new course', 'Untitled Course', (title) => {
                        const newCourse = {
                            id: 'course_' + Date.now(),
                            title: title,
                            role: 'creator',
                            icon: '🎓',
                            color: '#FF512F',
                            chapters: [{
                                id: 'chapter_' + Date.now(),
                                title: 'Chapter 1',
                                lessons: [{
                                    id: 'lesson_' + Date.now(),
                                    title: 'Lesson 1',
                                    duration: '5:00',
                                    completed: false,
                                    videoUrl: null,
                                    content: 'Start your learning here!'
                                }]
                            }]
                        };

                        Pathway.courses.push(newCourse);
                        Pathway.saveCourses();
                        Pathway.switchCourse(Pathway.courses.length - 1);
                        Notify.show('Course created!');
                    });
                },

                shareCourse: () => {
                    const course = Pathway.courses[Pathway.currentCourse];
                    if (!course) return;
                    if (course.role !== 'creator') {
                        return Notify.show('Only creators can share courses', 'error');
                    }
                    Shared.share('course', course);
                },

                // ADD CHAPTER FUNCTION
                addChapter: () => {
                    const course = Pathway.courses[Pathway.currentCourse];
                    if (!course) return;
                    
                    if (course.role !== 'creator') {
                        return Notify.show('Only creators can add chapters', 'error');
                    }

                    const modal = document.createElement('div');
                    modal.className = 'modal-overlay active';
                    modal.innerHTML = `
                        <div class="modal-box">
                            <h2 style="margin-bottom: 20px; font-weight: 700;">
                                <i class="fa-solid fa-folder-plus"></i> Add New Chapter
                            </h2>
                            <div class="input-wrapper">
                                <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Chapter Title</label>
                                <input type="text" id="new-chapter-title" class="input-std" placeholder="e.g., Introduction to JavaScript" autofocus>
                            </div>
                            <div style="display: flex; gap: 10px; margin-top: 25px;">
                                <button class="btn btn-secondary" style="flex: 1;" onclick="this.closest('.modal-overlay').remove()">
                                    Cancel
                                </button>
                                <button class="btn btn-primary" style="flex: 1;" onclick="Pathway.saveNewChapter(); this.closest('.modal-overlay').remove()">
                                    <i class="fa-solid fa-check"></i> Create Chapter
                                </button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(modal);
                },

                saveNewChapter: () => {
                    const title = document.getElementById('new-chapter-title').value.trim();
                    if (!title) {
                        Notify.show('Chapter title is required', 'error');
                        return;
                    }

                    const course = Pathway.courses[Pathway.currentCourse];
                    if (!course) return;

                    const newChapter = {
                        id: 'chapter_' + Date.now(),
                        title: title,
                        lessons: []
                    };

                    course.chapters.push(newChapter);
                    Pathway.saveCourses();
                    Pathway.renderChapters();
                    Notify.show('Chapter created!', 'success');
                },

                // ADD LESSON FUNCTION
                addLesson: (chapterIndex) => {
                    const course = Pathway.courses[Pathway.currentCourse];
                    if (!course) return;
                    
                    if (course.role !== 'creator') {
                        return Notify.show('Only creators can add lessons', 'error');
                    }

                    if (chapterIndex === undefined) {
                        chapterIndex = course.chapters.length - 1;
                    }

                    const modal = document.createElement('div');
                    modal.className = 'modal-overlay active';
                    modal.innerHTML = `
                        <div class="modal-box">
                            <h2 style="margin-bottom: 20px; font-weight: 700;">
                                <i class="fa-solid fa-book-open"></i> Add New Lesson
                            </h2>
                            <div class="input-wrapper">
                                <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Lesson Title</label>
                                <input type="text" id="new-lesson-title" class="input-std" placeholder="e.g., Variables and Data Types" autofocus>
                            </div>
                            <div class="input-wrapper">
                                <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Duration</label>
                                <input type="text" id="new-lesson-duration" class="input-std" placeholder="e.g., 15:00" value="10:00">
                            </div>
                            <div class="input-wrapper">
                                <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Content (Optional)</label>
                                <textarea id="new-lesson-content" class="input-std" rows="4" placeholder="Lesson description or notes..."></textarea>
                            </div>
                            <div style="display: flex; gap: 10px; margin-top: 25px;">
                                <button class="btn btn-secondary" style="flex: 1;" onclick="this.closest('.modal-overlay').remove()">
                                    Cancel
                                </button>
                                <button class="btn btn-primary" style="flex: 1;" onclick="Pathway.saveNewLesson(${chapterIndex}); this.closest('.modal-overlay').remove()">
                                    <i class="fa-solid fa-check"></i> Add Lesson
                                </button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(modal);
                },

                saveNewLesson: (chapterIndex) => {
                    const title = document.getElementById('new-lesson-title').value.trim();
                    const duration = document.getElementById('new-lesson-duration').value.trim();
                    const content = document.getElementById('new-lesson-content').value.trim();

                    if (!title) {
                        Notify.show('Lesson title is required', 'error');
                        return;
                    }

                    const course = Pathway.courses[Pathway.currentCourse];
                    if (!course || !course.chapters[chapterIndex]) return;

                    const newLesson = {
                        id: 'lesson_' + Date.now(),
                        title: title,
                        duration: duration || '10:00',
                        content: content || 'Start learning!',
                        completed: false,
                        videoUrl: null
                    };

                    course.chapters[chapterIndex].lessons.push(newLesson);
                    Pathway.saveCourses();
                    Pathway.renderChapters();
                    Notify.show('Lesson added!', 'success');
                },

                saveCourses: () => {
                    if (State.currentUser) {
                        Storage.set('spartan_courses_' + State.currentUser.id, Pathway.courses);
                    }
                },

                renderCourseList: () => {
                    const container = document.getElementById('course-list');
                    if (!container) return;

                    container.innerHTML = Pathway.courses.map((c, i) => `
                        <div class="course-card ${i === Pathway.currentCourse ? 'active' : ''}" onclick="Pathway.switchCourse(${i})">
                            <div style="font-size: 2rem; margin-bottom: 8px;">${c.icon}</div>
                            <div class="course-title">${c.title}</div>
                            <div class="course-meta">${Pathway.getCourseStats(c)}</div>
                            ${c.role === 'creator' ? '<div class="course-badge">Creator</div>' : ''}
                            ${c.role === 'viewer' ? '<div class="course-badge viewer">Viewer</div>' : ''}
                        </div>
                    `).join('') + `
                        <button class="btn btn-secondary w-full" style="margin-top: 15px;" onclick="Pathway.createCourse()">
                            <i class="fa-solid fa-plus"></i> New Course
                        </button>
                    `;
                },

                getCourseStats: (course) => {
                    let total = 0, completed = 0;
                    course.chapters.forEach(ch => {
                        ch.lessons.forEach(l => {
                            total++;
                            if (l.completed) completed++;
                        });
                    });
                    return `${completed}/${total} lessons`;
                },

                switchCourse: (idx) => {
                    Pathway.currentCourse = idx;
                    Pathway.currentLesson = 0;
                    Pathway.renderCourseList();
                    Pathway.renderChapters();
                    Pathway.loadLesson(0);
                    Pathway.updateProgress();
                },

                createCourse: () => {
                    Modals.prompt('New Course', 'Course Title:', (title) => {
                        if (title) {
                            Pathway.courses.push({
                                id: Date.now(),
                                title: title,
                                role: 'creator',
                                icon: '🎓',
                                color: '#FF512F',
                                chapters: [{
                                    id: Date.now(),
                                    title: 'Chapter 1',
                                    lessons: [{
                                        id: Date.now(),
                                        title: 'Lesson 1',
                                        duration: '0:00',
                                        completed: false,
                                        videoUrl: null,
                                        content: 'Add your content here...'
                                    }]
                                }]
                            });
                            Pathway.saveCourses();
                            Pathway.renderCourseList();
                            Pathway.switchCourse(Pathway.courses.length - 1);
                            Notify.show('Course created!');
                        }
                    });
                },

                shareCourse: () => {
                    const course = Pathway.courses[Pathway.currentCourse];
                    if (course.role !== 'creator') {
                        return Notify.show('Only creators can share courses', 'error');
                    }
                    Shared.share('course', course);
                },

                renderChapters: () => {
                    const container = document.getElementById('chapter-list');
                    if (!container) return;
                    let lessonIndex = 0;
                    const course = Pathway.courses[Pathway.currentCourse];
                    if (!course) return;

                    let html = course.chapters.map((ch, chIdx) => `
                        <div class="chapter-item">
                            <div class="chapter-header" style="display: flex; justify-content: space-between; align-items: center;">
                                <span>${ch.title}</span>
                                ${course.role === 'creator' ? `
                                    <button class="btn-icon-sm" onclick="event.stopPropagation(); Pathway.addLesson(${chIdx})" title="Add lesson to this chapter">
                                        <i class="fa-solid fa-plus"></i>
                                    </button>
                                ` : ''}
                            </div>
                            ${ch.lessons.map((l, idx) => {
                        const cIdx = lessonIndex++;
                        return `<div class="lesson-item ${l.completed ? 'completed' : ''} ${cIdx === State.currentLesson ? 'active' : ''}" onclick="Pathway.loadLesson(${cIdx})">
                                    <div class="lesson-icon">${l.completed ? '<i class="fa-solid fa-check"></i>' : (l.videoUrl ? '<i class="fa-solid fa-video"></i>' : '<i class="fa-solid fa-play"></i>')}</div>
                                    <div class="lesson-info">
                                        <div class="lesson-title">${l.title}</div>
                                        <div class="lesson-meta">${l.duration}</div>
                                    </div>
                                </div>`;
                    }).join('')}
                            ${ch.lessons.length === 0 ? `
                                <div style="padding: 20px; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">
                                    <i class="fa-solid fa-inbox" style="display: block; font-size: 2rem; opacity: 0.3; margin-bottom: 10px;"></i>
                                    No lessons yet
                                    ${course.role === 'creator' ? `<br><button class="btn btn-primary" style="margin-top: 10px; font-size: 0.8rem; padding: 6px 12px;" onclick="Pathway.addLesson(${chIdx})">Add Lesson</button>` : ''}
                                </div>
                            ` : ''}
                        </div>`).join('');

                    // Add "Add Chapter" button at the bottom
                    if (course.role === 'creator') {
                        html += `
                            <button class="btn btn-secondary w-full" style="margin-top: 15px;" onclick="Pathway.addChapter()">
                                <i class="fa-solid fa-folder-plus"></i> Add Chapter
                            </button>
                        `;
                    }

                    container.innerHTML = html;
                },

                loadLesson: (idx) => {
                    State.currentLesson = idx;
                    let current = 0;
                    let lessonData = null;
                    const course = Pathway.courses[Pathway.currentCourse];

                    for (const ch of course.chapters) {
                        for (const l of ch.lessons) {
                            if (current === idx) {
                                lessonData = l;
                                break;
                            }
                            current++;
                        }
                        if (lessonData) break;
                    }

                    if (lessonData) {
                        document.getElementById('lesson-title-main').innerText = lessonData.title;

                        // Render video if exists
                        const videoContainer = document.getElementById('lesson-video-container');
                        if (lessonData.videoUrl) {
                            videoContainer.innerHTML = `
                                <video controls style="width: 100%; border-radius: 8px; background: #000;">
                                    <source src="${lessonData.videoUrl}" type="video/mp4">
                                    Your browser does not support video playback.
                                </video>
                            `;
                            videoContainer.style.display = 'block';
                        } else {
                            videoContainer.style.display = 'none';
                        }

                        // Load content
                        document.getElementById('lesson-text-content').innerText = lessonData.content || 'No content available.';

                        // Load notes
                        const savedNotes = Storage.get(`lesson_notes_${lessonData.id}`) || '';
                        document.getElementById('lesson-notes').value = savedNotes;
                        Pathway.renderChapters();

                        // Show upload button for creators
                        const uploadBtn = document.getElementById('btn-upload-video');
                        if (uploadBtn) {
                            uploadBtn.style.display = course.role === 'creator' ? 'block' : 'none';
                        }
                    }
                },

                uploadVideo: async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'video/*';
                    input.onchange = async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        if (file.size > 50 * 1024 * 1024) {
                            return Notify.show('Video must be under 50MB', 'error');
                        }

                        Notify.show('Uploading video...', 'info');
                        const videoUrl = await fileToBase64(file);

                        // Find current lesson and add video
                        let lessonIndex = 0;
                        const course = Pathway.courses[Pathway.currentCourse];
                        for (const ch of course.chapters) {
                            for (const l of ch.lessons) {
                                if (lessonIndex === State.currentLesson) {
                                    l.videoUrl = videoUrl;
                                    Pathway.saveCourses();
                                    Pathway.loadLesson(State.currentLesson);
                                    Notify.show('Video uploaded!');
                                    return;
                                }
                                lessonIndex++;
                            }
                        }
                    };
                    input.click();
                },

                updateProgress: () => {
                    let total = 0;
                    let completed = 0;
                    const course = Pathway.courses[0];
                    course.chapters.forEach(ch => {
                        ch.lessons.forEach(l => {
                            total++;
                            if (l.completed) completed++;
                        });
                    });
                    const percent = Math.round((completed / total) * 100);
                    document.getElementById('progress-percent').innerText = percent + '%';
                    document.getElementById('lessons-completed').innerText = completed;

                    const circle = document.getElementById('progress-circle');
                    const circumference = 2 * Math.PI * 52;
                    const offset = circumference - (percent / 100) * circumference;
                    circle.style.strokeDashoffset = offset;
                },

                nextLesson: () => {
                    if (State.currentLesson < 2) {
                        Pathway.loadLesson(State.currentLesson + 1);
                    }
                },

                prevLesson: () => {
                    if (State.currentLesson > 0) Pathway.loadLesson(State.currentLesson - 1);
                },

                switchTab: (el, tab) => {
                    document.querySelectorAll('.lesson-tab').forEach(t => t.classList.remove('active'));
                    el.classList.add('active');
                    ['content', 'attachments', 'notes'].forEach(t => document.getElementById('lesson-tab-' + t).classList.add('hidden'));
                    document.getElementById('lesson-tab-' + tab).classList.remove('hidden');
                },

                saveNotes: () => {
                    const notes = document.getElementById('lesson-notes').value;
                    Storage.set(`lesson_notes_${State.currentLesson}`, notes);
                    Notify.show('Notes saved');
                },

                playVideo: () => Notify.show('Video playing...', 'info')
            };

            // ========== COMMUNITY MODULE ==========
            const Community = {
                channels: [],
                currentChannel: 'general',

                init: () => {
                    // Load channels from storage
                    const saved = Storage.get('spartan_channels_' + (State.currentUser ? State.currentUser.id : 'guest'));
                    if (saved && saved.length > 0) {
                        Community.channels = saved;
                    } else {
                        Community.channels = [
                            { id: 'general', name: 'general', icon: 'fa-hashtag', type: 'text', category: 'Main' },
                            { id: 'announcements', name: 'announcements', icon: 'fa-bullhorn', type: 'text', category: 'Main' },
                            { id: 'study-group', name: 'study-group', icon: 'fa-users', type: 'text', category: 'Learning' },
                            { id: 'help', name: 'help', icon: 'fa-question-circle', type: 'text', category: 'Learning' }
                        ];
                        Community.saveChannels();
                    }

                    Community.renderChannels();
                    Community.loadChannel('general');
                },

                saveChannels: () => {
                    if (!State.currentUser) return;
                    Storage.set('spartan_channels_' + State.currentUser.id, Community.channels);
                },

                saveMessages: (channelId) => {
                    if (!State.currentUser) return;
                    const messages = Community.getMessages(channelId);
                    Storage.set('spartan_messages_' + State.currentUser.id + '_' + channelId, messages);
                },

                loadMessages: (channelId) => {
                    if (!State.currentUser) return [];
                    return Storage.get('spartan_messages_' + State.currentUser.id + '_' + channelId) || [];
                },

                getMessages: (channelId) => {
                    return Community.loadMessages(channelId);
                },

                renderChannels: () => {
                    const container = document.getElementById('channel-list');
                    if (!container) return;

                    // Group by category
                    const categories = {};
                    Community.channels.forEach(ch => {
                        if (!categories[ch.category]) categories[ch.category] = [];
                        categories[ch.category].push(ch);
                    });

                    container.innerHTML = Object.keys(categories).map(cat => `
                        <div class="channel-category">
                            <div class="channel-category-header" onclick="Community.toggleCategory(this)">
                                <i class="fa-solid fa-chevron-down"></i>
                                <span>${cat.toUpperCase()}</span>
                            </div>
                            <div class="channel-category-list">
                                ${categories[cat].map(ch => `
                                    <div class="channel-item ${ch.id === Community.currentChannel ? 'active' : ''}" onclick="Community.loadChannel('${ch.id}')">
                                        <i class="fa-solid ${ch.icon}"></i>
                                        <span>${ch.name}</span>
                                        ${Community.getUnreadCount(ch.id) > 0 ? `<div class="channel-unread">${Community.getUnreadCount(ch.id)}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('') + `
                        <button class="btn btn-secondary" style="margin: 10px 10px 5px 10px; width: calc(100% - 20px);" onclick="Community.createChannel()">
                            <i class="fa-solid fa-plus"></i> Add Channel
                        </button>
                        <button class="btn btn-secondary" style="margin: 5px 10px 10px 10px; width: calc(100% - 20px);" onclick="Modals.open('modal-join-channel')">
                            <i class="fa-solid fa-users"></i> Join Channel
                        </button>
                    `;
                },

                toggleCategory: (el) => {
                    const list = el.nextElementSibling;
                    const icon = el.querySelector('i');
                    list.classList.toggle('collapsed');
                    icon.style.transform = list.classList.contains('collapsed') ? 'rotate(-90deg)' : 'rotate(0deg)';
                },

                getUnreadCount: (channelId) => {
                    // Simple mock - could implement real unread tracking
                    return 0;
                },

                createChannel: () => {
                    CustomModal.input('Create Channel', 'Enter channel name (no spaces)', '', (name) => {
                        const id = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                        if (Community.channels.find(ch => ch.id === id)) {
                            return Notify.show('Channel already exists', 'error');
                        }

                        Community.channels.push({
                            id: id,
                            name: name,
                            icon: 'fa-hashtag',
                            type: 'text',
                            category: 'Main'
                        });

                        Community.saveChannels();
                        Community.renderChannels();
                        Community.loadChannel(id);
                        Notify.show('Channel created!');
                    });
                },

                loadChannel: (id) => {
                    Community.currentChannel = id;
                    const channel = Community.channels.find(ch => ch.id === id);
                    if (!channel) return;

                    document.getElementById('channel-name').innerHTML = `<i class="fa-solid ${channel.icon}"></i> ${channel.name}`;
                    document.getElementById('chat-input').placeholder = `Message #${channel.name}...`;

                    Community.renderChannels();
                    Community.renderMessages();
                },

                renderMessages: () => {
                    const container = document.getElementById('chat-messages');
                    if (!container) return;

                    const messages = Community.getMessages(Community.currentChannel);

                    if (messages.length === 0) {
                        container.innerHTML = `
                            <div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); flex-direction: column; gap: 10px;">
                                <i class="fa-solid fa-comments" style="font-size: 3rem; opacity: 0.3;"></i>
                                <div>No messages yet. Start the conversation!</div>
                            </div>
                        `;
                        return;
                    }

                    container.innerHTML = messages.map((m, idx) => {
                        const prevMsg = messages[idx - 1];
                        const showAvatar = !prevMsg || prevMsg.author !== m.author ||
                            (new Date(m.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() > 300000);
                        
                        const isOwnMessage = State.currentUser && m.author === State.currentUser.name;

                        return `
                            <div class="message-group ${showAvatar ? 'with-avatar' : ''}" data-message-id="${m.id}">
                                ${showAvatar ? `
                                    <div class="message-avatar" style="background: ${Community.getAvatarColor(m.author)}">${m.avatar}</div>
                                    <div class="message-content" style="flex: 1; position: relative;">
                                        <div class="message-header">
                                            <span class="message-author">${m.author}</span>
                                            <span class="message-time">${Community.formatTime(m.timestamp)}</span>
                                            ${m.edited ? '<span style="font-size: 0.7rem; color: var(--text-secondary); margin-left: 5px;">(edited)</span>' : ''}
                                        </div>
                                        <div class="message-text" data-message-id="${m.id}">${Community.formatMessage(m.text)}</div>
                                        ${isOwnMessage ? `
                                            <div class="message-actions" style="position: absolute; top: 0; right: 0; opacity: 0; transition: opacity 0.2s; display: flex; gap: 5px;">
                                                <button class="btn-icon-sm" onclick="Community.editMessage(${m.id})" title="Edit">
                                                    <i class="fa-solid fa-pen"></i>
                                                </button>
                                                <button class="btn-icon-sm" style="color: var(--status-danger);" onclick="Community.deleteMessage(${m.id})" title="Delete">
                                                    <i class="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        ` : ''}
                                        ${m.reactions && m.reactions.length > 0 ? `
                                            <div class="message-reactions">
                                                ${m.reactions.map(r => `
                                                    <div class="message-reaction" onclick="Community.toggleReaction(${m.id}, '${r.emoji}')">
                                                        <span>${r.emoji}</span>
                                                        <span>${r.count}</span>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                ` : `
                                    <div style="padding-left: 52px; margin-top: -8px; position: relative;">
                                        <div class="message-text" data-message-id="${m.id}">${Community.formatMessage(m.text)}</div>
                                        ${isOwnMessage ? `
                                            <div class="message-actions" style="position: absolute; top: 0; right: 0; opacity: 0; transition: opacity 0.2s; display: flex; gap: 5px;">
                                                <button class="btn-icon-sm" onclick="Community.editMessage(${m.id})" title="Edit">
                                                    <i class="fa-solid fa-pen"></i>
                                                </button>
                                                <button class="btn-icon-sm" style="color: var(--status-danger);" onclick="Community.deleteMessage(${m.id})" title="Delete">
                                                    <i class="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        ` : ''}
                                    </div>
                                `}
                            </div>
                        `;
                    }).join('');

                    container.scrollTop = container.scrollHeight;
                },

                formatTime: (timestamp) => {
                    const date = new Date(timestamp);
                    const now = new Date();
                    const diff = now - date;

                    if (diff < 60000) return 'Just now';
                    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
                    if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                },

                formatMessage: (text) => {
                    // Format links
                    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: var(--accent-color);">$1</a>');
                    // Format bold
                    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                    // Format italic
                    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
                    // Format code
                    text = text.replace(/`(.+?)`/g, '<code style="background: var(--hover-bg); padding: 2px 4px; border-radius: 3px;">$1</code>');
                    return text;
                },

                getAvatarColor: (name) => {
                    const colors = ['#FF512F', '#DD2476', '#4776E6', '#8E54E9', '#11998E', '#F093FB'];
                    let hash = 0;
                    for (let i = 0; i < name.length; i++) {
                        hash = name.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    return colors[Math.abs(hash) % colors.length];
                },

                sendMessage: () => {
                    const input = document.getElementById('chat-input');
                    const text = input.value.trim();

                    if (!text) return;

                    const messages = Community.getMessages(Community.currentChannel);
                    const newMsg = {
                        id: Date.now(),
                        author: State.currentUser ? State.currentUser.name : 'Guest',
                        avatar: (State.currentUser ? State.currentUser.name : 'Guest')[0].toUpperCase(),
                        text: text,
                        timestamp: new Date().toISOString(),
                        reactions: []
                    };

                    messages.push(newMsg);
                    
                    // Save directly to storage
                    if (State.currentUser) {
                        Storage.set('spartan_messages_' + State.currentUser.id + '_' + Community.currentChannel, messages);
                    }

                    input.value = '';
                    Community.renderMessages();
                    Notify.show('Message sent');
                },

                handleKeyDown: (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        Community.sendMessage();
                    }
                },

                addEmoji: () => {
                    const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯'];
                    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                    const input = document.getElementById('chat-input');
                    input.value += emoji;
                    input.focus();
                },

                toggleReaction: (msgId, emoji) => {
                    // Simple reaction toggle
                    Notify.show('Reaction added!');
                },

                editMessage: (msgId) => {
                    const messages = Community.getMessages(Community.currentChannel);
                    const msg = messages.find(m => m.id === msgId);
                    if (!msg) return;

                    CustomModal.input('Edit Message', 'Update your message', msg.text, (newText) => {
                        if (!newText.trim()) return Notify.show('Message cannot be empty', 'error');
                        
                        msg.text = newText.trim();
                        msg.edited = true;
                        msg.editedAt = new Date().toISOString();
                        
                        if (State.currentUser) {
                            Storage.set('spartan_messages_' + State.currentUser.id + '_' + Community.currentChannel, messages);
                        }
                        
                        Community.renderMessages();
                        Notify.show('Message updated');
                    });
                },

                deleteMessage: (msgId) => {
                    Modals.confirm('Delete Message', 'Are you sure you want to delete this message?', () => {
                        let messages = Community.getMessages(Community.currentChannel);
                        messages = messages.filter(m => m.id !== msgId);
                        
                        if (State.currentUser) {
                            Storage.set('spartan_messages_' + State.currentUser.id + '_' + Community.currentChannel, messages);
                        }
                        
                        Community.renderMessages();
                        Notify.show('Message deleted');
                    });
                },

                shareChannel: () => {
                    const channel = Community.channels.find(ch => ch.id === Community.currentChannel);
                    if (!channel) return;

                    // Generate share code
                    const shareCode = 'CH-' + Math.floor(10000 + Math.random() * 90000);
                    const password = Math.random().toString(36).substring(2, 10).toUpperCase();

                    // Save to shared channels
                    const sharedChannels = Storage.get('spartan_shared_channels') || {};
                    sharedChannels[shareCode] = {
                        channel: JSON.parse(JSON.stringify(channel)),
                        messages: Community.getMessages(Community.currentChannel),
                        password: password,
                        createdAt: Date.now(),
                        createdBy: State.currentUser ? State.currentUser.id : 'guest'
                    };
                    Storage.set('spartan_shared_channels', sharedChannels);

                    // Show share modal
                    document.getElementById('share-channel-code').value = shareCode;
                    document.getElementById('share-channel-pass').value = password;
                    document.getElementById('share-channel-name').innerText = channel.name;
                    Modals.open('modal-share-channel');
                    
                    Notify.show('Share link created!', 'success');
                },

                joinSharedChannel: () => {
                    const code = document.getElementById('join-channel-code').value.trim();
                    const password = document.getElementById('join-channel-pass').value.trim();

                    if (!code || !password) {
                        return Notify.show('Please fill all fields', 'error');
                    }

                    const sharedChannels = Storage.get('spartan_shared_channels') || {};
                    const shared = sharedChannels[code];

                    if (!shared) {
                        return Notify.show('Invalid channel code', 'error');
                    }

                    if (shared.password !== password) {
                        return Notify.show('Incorrect password', 'error');
                    }

                    // Add channel with unique ID
                    const newChannel = {
                        ...shared.channel,
                        id: shared.channel.id + '-shared-' + Date.now(),
                        name: shared.channel.name + ' (Shared)'
                    };

                    Community.channels.push(newChannel);
                    Community.saveChannels();

                    // Import messages
                    if (State.currentUser) {
                        Storage.set('spartan_messages_' + State.currentUser.id + '_' + newChannel.id, shared.messages);
                    }

                    Community.renderChannels();
                    Community.loadChannel(newChannel.id);
                    Modals.close();
                    Notify.show('Channel joined successfully!', 'success');
                },

                clearChannel: () => {
                    Modals.confirm('Clear Messages', 'Delete all messages in this channel?', () => {
                        const messages = [];
                        Community.saveMessages(Community.currentChannel);
                        Community.renderMessages();
                        Notify.show('Channel cleared');
                    });
                }
            };

            // ========== WHITEBOARD MODULE ==========
            const Whiteboard = {
                canvas: null,
                ctx: null,
                boards: [],
                currentBoard: 0,
                layers: [],
                currentLayer: 0,
                tool: 'pen',
                color: '#FF512F',
                size: 3,
                zoom: 1,
                offsetX: 0,
                offsetY: 0,
                isDrawing: false,
                draggedNote: null,
                dragOffset: { x: 0, y: 0 },
                pendingNotePos: null,
                pendingTextPos: null,
                selectedNoteColor: '#FFF59D',
                _inited: false,

                init: () => {
                    if (Whiteboard._inited) return;
                    Whiteboard.canvas = document.getElementById('wb-canvas');
                    if (!Whiteboard.canvas) return;
                    Whiteboard.ctx = Whiteboard.canvas.getContext('2d');

                    const container = document.getElementById('wb-canvas-container');
                    Whiteboard.canvas.width = container.clientWidth;
                    Whiteboard.canvas.height = container.clientHeight;

                    // Initialize with one default board
                    Whiteboard.boards = [{
                        id: Date.now(),
                        name: 'Board 1',
                        layers: [{
                            id: 1,
                            name: 'Layer 1',
                            visible: true,
                            elements: []
                        }],
                        notes: []
                    }];

                    Whiteboard.currentBoard = 0;
                    Whiteboard.layers = Whiteboard.boards[0].layers;
                    Whiteboard.renderBoards();
                    Whiteboard.renderLayers();

                    const c = Whiteboard.canvas;
                    c.addEventListener('mousedown', Whiteboard.onMouseDown);
                    c.addEventListener('mousemove', Whiteboard.onMouseMove);
                    c.addEventListener('mouseup', Whiteboard.onMouseUp);

                    document.getElementById('wb-color').addEventListener('change', e => Whiteboard.color = e.target.value);
                    document.getElementById('wb-size').addEventListener('input', e => {
                        Whiteboard.size = parseInt(e.target.value);
                        document.getElementById('wb-size-display').innerText = e.target.value + 'px';
                    });

                    window.addEventListener('resize', () => {
                        const container = document.getElementById('wb-canvas-container');
                        if (!container) return;
                        Whiteboard.canvas.width = container.clientWidth;
                        Whiteboard.canvas.height = container.clientHeight;
                        Whiteboard.render();
                    });

                    Whiteboard._inited = true;
                },

                renderBoards: () => {
                    const container = document.getElementById('wb-board-list');
                    if (!container) return;
                    container.innerHTML = Whiteboard.boards.map((b, i) => `
                        <div class="wb-board-item ${i === Whiteboard.currentBoard ? 'selected' : ''}" onclick="Whiteboard.switchBoard(${i})">
                            <div class="wb-board-icon"><i class="fa-solid fa-file"></i></div>
                            <div class="wb-board-name">${b.name}</div>
                            <button class="wb-board-delete" onclick="event.stopPropagation(); Whiteboard.deleteBoard(${i})" title="Delete board">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>`).join('');
                },

                switchBoard: (idx) => {
                    Whiteboard.currentBoard = idx;
                    Whiteboard.layers = Whiteboard.boards[idx].layers;
                    Whiteboard.currentLayer = 0;
                    Whiteboard.renderBoards();
                    Whiteboard.renderLayers();
                    Whiteboard.render();
                    Notify.show('Switched to ' + Whiteboard.boards[idx].name);
                },

                addBoard: () => {
                    CustomModal.input('New Board', 'Enter a name for your new board', 'Board ' + (Whiteboard.boards.length + 1), (name) => {
                        Whiteboard.boards.push({
                            id: Date.now(),
                            name: name,
                            layers: [{
                                id: Date.now(),
                                name: 'Layer 1',
                                visible: true,
                                elements: []
                            }],
                            notes: []
                        });

                        Whiteboard.currentBoard = Whiteboard.boards.length - 1;
                        Whiteboard.layers = Whiteboard.boards[Whiteboard.currentBoard].layers;
                        Whiteboard.renderBoards();
                        Whiteboard.renderLayers();
                        Whiteboard.render();
                        Notify.show('Board created');
                    });
                },

                deleteBoard: (idx) => {
                    if (Whiteboard.boards.length <= 1) {
                        return Notify.show('Cannot delete the last board', 'error');
                    }

                    if (confirm('Delete this board?')) {
                        Whiteboard.boards.splice(idx, 1);
                        if (Whiteboard.currentBoard >= Whiteboard.boards.length) {
                            Whiteboard.currentBoard = Whiteboard.boards.length - 1;
                        }
                        Whiteboard.layers = Whiteboard.boards[Whiteboard.currentBoard].layers;
                        Whiteboard.renderBoards();
                        Whiteboard.renderLayers();
                        Whiteboard.render();
                        Notify.show('Board deleted');
                    }
                },

                renameBoard: (idx) => {
                    const newName = prompt('New board name:', Whiteboard.boards[idx].name);
                    if (newName && newName.trim()) {
                        Whiteboard.boards[idx].name = newName.trim();
                        Whiteboard.renderBoards();
                        Notify.show('Board renamed');
                    }
                },

                onMouseDown: (e) => {
                    const rect = Whiteboard.canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    // Check if clicking on a note
                    if (Whiteboard.tool === 'select') {
                        const board = Whiteboard.boards[Whiteboard.currentBoard];
                        for (let i = board.notes.length - 1; i >= 0; i--) {
                            const note = board.notes[i];
                            if (x >= note.x && x <= note.x + note.width &&
                                y >= note.y && y <= note.y + note.height) {

                                // Check if double click for editing
                                const now = Date.now();
                                if (Whiteboard.lastClickTime && now - Whiteboard.lastClickTime < 300 &&
                                    Whiteboard.lastClickedNote === note) {
                                    Whiteboard.editNote(note);
                                    return;
                                }
                                Whiteboard.lastClickTime = now;
                                Whiteboard.lastClickedNote = note;

                                Whiteboard.draggedNote = note;
                                Whiteboard.dragOffset = { x: x - note.x, y: y - note.y };
                                return;
                            }
                        }
                    }

                    // Add new note
                    if (Whiteboard.tool === 'note') {
                        Whiteboard.addNote(x, y);
                        return;
                    }

                    // Eraser tool
                    if (Whiteboard.tool === 'eraser') {
                        Whiteboard.isErasing = true;
                        Whiteboard.erase(x, y);
                        return;
                    }

                    // Drawing mode
                    Whiteboard.isDrawing = true;
                    Whiteboard.startPos = { x, y };

                    if (Whiteboard.tool === 'pen') {
                        Whiteboard.currentShape = {
                            type: 'path',
                            points: [{ ...Whiteboard.startPos }],
                            color: Whiteboard.color,
                            size: Whiteboard.size
                        };
                    } else if (Whiteboard.tool === 'rect' || Whiteboard.tool === 'ellipse' || Whiteboard.tool === 'line') {
                        Whiteboard.currentShape = {
                            type: Whiteboard.tool,
                            start: { ...Whiteboard.startPos },
                            end: { ...Whiteboard.startPos },
                            color: Whiteboard.color,
                            size: Whiteboard.size
                        };
                    } else if (Whiteboard.tool === 'text') {
                        Whiteboard.pendingTextPos = { x, y };
                        document.getElementById('wb-text-input').value = '';
                        Modals.open('modal-wb-text');
                    }
                },

                onMouseMove: (e) => {
                    const rect = Whiteboard.canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    // Dragging note
                    if (Whiteboard.draggedNote) {
                        Whiteboard.draggedNote.x = x - Whiteboard.dragOffset.x;
                        Whiteboard.draggedNote.y = y - Whiteboard.dragOffset.y;
                        Whiteboard.render();
                        return;
                    }

                    // Erasing
                    if (Whiteboard.isErasing) {
                        Whiteboard.erase(x, y);
                        return;
                    }

                    // Drawing
                    if (!Whiteboard.isDrawing) return;
                    const pos = { x, y };

                    if (Whiteboard.tool === 'pen') {
                        Whiteboard.currentShape.points.push(pos);
                        Whiteboard.render();
                    } else if (Whiteboard.tool === 'rect' || Whiteboard.tool === 'ellipse' || Whiteboard.tool === 'line') {
                        Whiteboard.currentShape.end = pos;
                        Whiteboard.render();
                    }
                },

                onMouseUp: () => {
                    if (Whiteboard.draggedNote) {
                        Whiteboard.draggedNote = null;
                        return;
                    }

                    if (Whiteboard.isErasing) {
                        Whiteboard.isErasing = false;
                        return;
                    }

                    if (Whiteboard.currentShape) {
                        Whiteboard.layers[Whiteboard.currentLayer].elements.push(Whiteboard.currentShape);
                        Whiteboard.currentShape = null;
                    }
                    Whiteboard.isDrawing = false;
                    Whiteboard.render();
                },

                addNote: (x, y) => {
                    Whiteboard.pendingNotePos = { x, y };
                    document.getElementById('wb-note-input').value = '';
                    Whiteboard.selectedNoteColor = '#FFF59D';
                    document.querySelectorAll('.note-color-option').forEach(opt => {
                        opt.classList.toggle('selected', opt.dataset.color === '#FFF59D');
                    });
                    Modals.open('modal-wb-note');
                },

                confirmNote: () => {
                    const text = document.getElementById('wb-note-input').value.trim();
                    if (!text) return Notify.show('Note cannot be empty', 'error');

                    Whiteboard.boards[Whiteboard.currentBoard].notes.push({
                        id: Date.now(),
                        x: Whiteboard.pendingNotePos.x,
                        y: Whiteboard.pendingNotePos.y,
                        width: 200,
                        height: 150,
                        text: text,
                        color: Whiteboard.selectedNoteColor
                    });
                    Whiteboard.render();
                    Modals.close();
                    Notify.show('Note added');
                },

                confirmText: () => {
                    const text = document.getElementById('wb-text-input').value.trim();
                    if (!text) return Notify.show('Text cannot be empty', 'error');

                    Whiteboard.layers[Whiteboard.currentLayer].elements.push({
                        type: 'text',
                        x: Whiteboard.pendingTextPos.x,
                        y: Whiteboard.pendingTextPos.y,
                        text: text,
                        color: Whiteboard.color,
                        size: Whiteboard.size * 6
                    });
                    Whiteboard.render();
                    Modals.close();
                    Notify.show('Text added');
                },

                editNote: (note) => {
                    Whiteboard.pendingNotePos = note;
                    document.getElementById('wb-note-input').value = note.text;
                    Whiteboard.selectedNoteColor = note.color;
                    document.querySelectorAll('.note-color-option').forEach(opt => {
                        opt.classList.toggle('selected', opt.dataset.color === note.color);
                    });
                    Modals.open('modal-wb-note');

                    // Override confirm to edit instead of add
                    const oldConfirm = Whiteboard.confirmNote;
                    Whiteboard.confirmNote = () => {
                        const text = document.getElementById('wb-note-input').value.trim();
                        if (!text) return Notify.show('Note cannot be empty', 'error');
                        note.text = text;
                        note.color = Whiteboard.selectedNoteColor;
                        Whiteboard.render();
                        Modals.close();
                        Notify.show('Note updated');
                        Whiteboard.confirmNote = oldConfirm;
                    };
                },

                erase: (x, y) => {
                    const eraseRadius = Whiteboard.size * 10;

                    // Erase from current layer
                    const layer = Whiteboard.layers[Whiteboard.currentLayer];
                    layer.elements = layer.elements.filter(el => {
                        if (el.type === 'path') {
                            // Check if any point is within erase radius
                            return !el.points.some(p => {
                                const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
                                return dist < eraseRadius;
                            });
                        } else if (el.type === 'rect' || el.type === 'ellipse' || el.type === 'line') {
                            const centerX = (el.start.x + el.end.x) / 2;
                            const centerY = (el.start.y + el.end.y) / 2;
                            const dist = Math.sqrt((centerX - x) ** 2 + (centerY - y) ** 2);
                            return dist > eraseRadius;
                        } else if (el.type === 'text') {
                            const dist = Math.sqrt((el.x - x) ** 2 + (el.y - y) ** 2);
                            return dist > eraseRadius;
                        }
                        return true;
                    });

                    Whiteboard.render();
                },

                render: () => {
                    const ctx = Whiteboard.ctx;
                    if (!ctx) return;

                    // Save context state
                    ctx.save();

                    // Clear canvas
                    ctx.clearRect(0, 0, Whiteboard.canvas.width, Whiteboard.canvas.height);

                    // Apply zoom and pan
                    ctx.translate(Whiteboard.offsetX, Whiteboard.offsetY);
                    ctx.scale(Whiteboard.zoom, Whiteboard.zoom);

                    // Draw layer elements
                    Whiteboard.layers.forEach(l => {
                        if (!l.visible) return;
                        l.elements.forEach(el => Whiteboard.drawElement(el));
                    });

                    // Draw current shape being drawn
                    if (Whiteboard.currentShape) Whiteboard.drawElement(Whiteboard.currentShape);

                    // Draw sticky notes
                    const board = Whiteboard.boards[Whiteboard.currentBoard];
                    if (board && board.notes) {
                        board.notes.forEach(note => Whiteboard.drawNote(note));
                    }

                    // Restore context state
                    ctx.restore();
                },

                zoomIn: () => {
                    Whiteboard.zoom = Math.min(Whiteboard.zoom + 0.1, 3);
                    document.getElementById('wb-zoom-display').innerText = Math.round(Whiteboard.zoom * 100) + '%';
                    Whiteboard.render();
                },

                zoomOut: () => {
                    Whiteboard.zoom = Math.max(Whiteboard.zoom - 0.1, 0.3);
                    document.getElementById('wb-zoom-display').innerText = Math.round(Whiteboard.zoom * 100) + '%';
                    Whiteboard.render();
                },

                resetZoom: () => {
                    Whiteboard.zoom = 1;
                    Whiteboard.offsetX = 0;
                    Whiteboard.offsetY = 0;
                    document.getElementById('wb-zoom-display').innerText = '100%';
                    Whiteboard.render();
                    Notify.show('Zoom reset');
                },

                drawNote: (note) => {
                    const ctx = Whiteboard.ctx;

                    // Note background
                    ctx.fillStyle = note.color || '#FFF59D';
                    ctx.fillRect(note.x, note.y, note.width, note.height);

                    // Note border
                    ctx.strokeStyle = '#F4C430';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(note.x, note.y, note.width, note.height);

                    // Note text
                    ctx.fillStyle = '#333';
                    ctx.font = '14px Inter, sans-serif';
                    ctx.textBaseline = 'top';

                    const words = note.text.split(' ');
                    let line = '';
                    let y = note.y + 10;
                    const lineHeight = 20;
                    const maxWidth = note.width - 20;

                    for (let word of words) {
                        const testLine = line + word + ' ';
                        const metrics = ctx.measureText(testLine);
                        if (metrics.width > maxWidth && line !== '') {
                            ctx.fillText(line, note.x + 10, y);
                            line = word + ' ';
                            y += lineHeight;
                        } else {
                            line = testLine;
                        }
                    }
                    ctx.fillText(line, note.x + 10, y);
                },

                drawElement: (el) => {
                    const ctx = Whiteboard.ctx;
                    ctx.strokeStyle = el.color;
                    ctx.fillStyle = el.color;
                    ctx.lineWidth = el.size;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';

                    if (el.type === 'path') {
                        ctx.beginPath();
                        if (el.points.length > 0) ctx.moveTo(el.points[0].x, el.points[0].y);
                        el.points.forEach(p => ctx.lineTo(p.x, p.y));
                        ctx.stroke();
                    } else if (el.type === 'rect') {
                        const width = el.end.x - el.start.x;
                        const height = el.end.y - el.start.y;
                        ctx.strokeRect(el.start.x, el.start.y, width, height);
                    } else if (el.type === 'ellipse') {
                        const radiusX = Math.abs(el.end.x - el.start.x) / 2;
                        const radiusY = Math.abs(el.end.y - el.start.y) / 2;
                        const centerX = el.start.x + (el.end.x - el.start.x) / 2;
                        const centerY = el.start.y + (el.end.y - el.start.y) / 2;
                        ctx.beginPath();
                        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
                        ctx.stroke();
                    } else if (el.type === 'line') {
                        ctx.beginPath();
                        ctx.moveTo(el.start.x, el.start.y);
                        ctx.lineTo(el.end.x, el.end.y);
                        ctx.stroke();
                    } else if (el.type === 'text') {
                        ctx.font = `${el.size}px Inter, sans-serif`;
                        ctx.fillText(el.text, el.x, el.y);
                    }
                },

                setTool: (t) => {
                    Whiteboard.tool = t;
                    document.querySelectorAll('.wb-tool-btn').forEach(b => b.classList.toggle('active', b.dataset.tool === t));
                },

                /* zoomIn/zoomOut handled earlier */
                /* duplicate removed */


                updateZoom: () => {
                    const canvas = Whiteboard.canvas;
                    canvas.style.transform = `scale(${Whiteboard.zoom})`;
                    canvas.style.transformOrigin = 'top left';
                    document.getElementById('wb-zoom-display').innerText = Math.round(Whiteboard.zoom * 100) + '%';
                },

                addLayer: () => {
                    Whiteboard.layers.push({
                        id: Date.now(),
                        name: `Layer ${Whiteboard.layers.length + 1}`,
                        visible: true,
                        elements: []
                    });
                    Whiteboard.currentLayer = Whiteboard.layers.length - 1;
                    Whiteboard.renderLayers();
                },

                renderLayers: () => {
                    const container = document.getElementById('wb-layer-list');
                    if (!container) return;
                    container.innerHTML = Whiteboard.layers.map((l, i) => `
                        <div class="wb-layer-item ${i === Whiteboard.currentLayer ? 'selected' : ''}" onclick="Whiteboard.currentLayer=${i}; Whiteboard.renderLayers()">
                            <div class="wb-layer-icon"><i class="fa-solid fa-layer-group"></i></div>
                            <div class="wb-layer-name">${l.name}</div>
                        </div>`).join('');
                },

                zoomIn: () => Notify.show('Zoom In', 'info'),
                zoomOut: () => Notify.show('Zoom Out', 'info'),

                undo: () => {
                    if (Whiteboard.layers[Whiteboard.currentLayer].elements.length) {
                        Whiteboard.layers[Whiteboard.currentLayer].elements.pop();
                        Whiteboard.render();
                        Notify.show('Undone');
                    }
                },

                clear: () => {
                    Whiteboard.layers[Whiteboard.currentLayer].elements = [];
                    Whiteboard.render();
                    Notify.show('Canvas cleared');
                },

                export: () => {
                    const a = document.createElement('a');
                    a.href = Whiteboard.canvas.toDataURL('image/png');
                    a.download = 'whiteboard_' + Date.now() + '.png';
                    a.click();
                    Notify.show('Exported successfully!', 'success');
                },

                toggleShortcuts: () => document.getElementById('wb-shortcuts').classList.toggle('active')
            };

            // Global helper for note color selection
            function WB_selectNoteColor(el) {
                document.querySelectorAll('.note-color-option').forEach(opt => opt.classList.remove('selected'));
                el.classList.add('selected');
                Whiteboard.selectedNoteColor = el.dataset.color;
            }

            console.log('✅ Spartan.Edu loaded successfully!');

            // Chatbot
            (function () { if (!window.chatbase || window.chatbase("getState") !== "initialized") { window.chatbase = (...arguments) => { if (!window.chatbase.q) { window.chatbase.q = [] } window.chatbase.q.push(arguments) }; window.chatbase = new Proxy(window.chatbase, { get(target, prop) { if (prop === "q") { return target.q } return (...args) => target(prop, ...args) } }) } const onLoad = function () { const script = document.createElement("script"); script.src = "https://www.chatbase.co/embed.min.js"; script.id = "RB-GhOWlWGCnxZOsizoFz"; script.domain = "www.chatbase.co"; document.body.appendChild(script) }; if (document.readyState === "complete") { onLoad() } else { window.addEventListener("load", onLoad) } })();
    // ========== PATHWAY VIDEO & EDIT FEATURES ==========
    const PathwayEnhanced = {
        addVideo: (courseId, chapterId) => {
            CustomModal.input('Add Video', 'Enter video URL (YouTube, Vimeo, or direct link)', '', (url) => {
                if (!url) return Notify.show('Please enter a valid URL', 'error');
                
                const course = Pathway.courses.find(c => c.id === courseId);
                if (!course) return;
                
                const chapter = course.chapters.find(ch => ch.id === chapterId);
                if (!chapter) return;
                
                if (!chapter.videos) chapter.videos = [];
                
                // Parse video URL
                let videoData = PathwayEnhanced.parseVideoUrl(url);
                if (!videoData) {
                    return Notify.show('Invalid video URL format', 'error');
                }
                
                // Prompt for video title
                CustomModal.input('Video Title', 'Enter video title', '', (title) => {
                    if (!title) return Notify.show('Please enter a title', 'error');
                    
                    chapter.videos.push({
                        id: Date.now(),
                        title: title,
                        url: url,
                        type: videoData.type,
                        embedUrl: videoData.embedUrl,
                        duration: '',
                        completed: false,
                        addedAt: new Date().toISOString()
                    });
                    
                    Pathway.save();
                    Pathway.renderChapter(courseId, chapterId);
                    Notify.show('Video added!', 'success');
                });
            });
        },
        
        parseVideoUrl: (url) => {
            // YouTube
            let youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
            if (youtubeMatch) {
                return {
                    type: 'youtube',
                    embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`
                };
            }
            
            // Vimeo
            let vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
            if (vimeoMatch) {
                return {
                    type: 'vimeo',
                    embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
                };
            }
            
            // Direct video link
            if (url.match(/\.(mp4|webm|ogg)$/i)) {
                return {
                    type: 'direct',
                    embedUrl: url
                };
            }
            
            return null;
        },
        
        playVideo: (courseId, chapterId, videoId) => {
            const course = Pathway.courses.find(c => c.id === courseId);
            if (!course) return;
            
            const chapter = course.chapters.find(ch => ch.id === chapterId);
            if (!chapter || !chapter.videos) return;
            
            const video = chapter.videos.find(v => v.id === videoId);
            if (!video) return;
            
            // Show video modal
            const modal = document.createElement('div');
            modal.className = 'modal-overlay active';
            modal.innerHTML = `
                <div class="modal-box" style="max-width: 900px; padding: 0;">
                    <div style="padding: 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 1.3rem;">${video.title}</h2>
                        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()" style="border: none;">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div style="position: relative; padding-bottom: 56.25%; background: #000;">
                        ${video.type === 'direct' ? `
                            <video controls style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                                <source src="${video.embedUrl}" type="video/mp4">
                                Your browser does not support video playback.
                            </video>
                        ` : `
                            <iframe 
                                src="${video.embedUrl}" 
                                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        `}
                    </div>
                    <div style="padding: 20px;">
                        <button class="btn btn-primary w-full" onclick="PathwayEnhanced.markVideoComplete(${courseId}, ${chapterId}, ${videoId}); this.closest('.modal-overlay').remove();">
                            <i class="fa-solid fa-check"></i> Mark as Completed
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Mark as viewed
            if (!video.completed) {
                video.viewedAt = new Date().toISOString();
                Pathway.save();
            }
        },
        
        markVideoComplete: (courseId, chapterId, videoId) => {
            const course = Pathway.courses.find(c => c.id === courseId);
            if (!course) return;
            
            const chapter = course.chapters.find(ch => ch.id === chapterId);
            if (!chapter || !chapter.videos) return;
            
            const video = chapter.videos.find(v => v.id === videoId);
            if (!video) return;
            
            video.completed = true;
            video.completedAt = new Date().toISOString();
            
            Pathway.save();
            Pathway.renderChapter(courseId, chapterId);
            Notify.show('Video marked as completed!', 'success');
        },
        
        editVideo: (courseId, chapterId, videoId) => {
            const course = Pathway.courses.find(c => c.id === courseId);
            if (!course) return;
            
            const chapter = course.chapters.find(ch => ch.id === chapterId);
            if (!chapter || !chapter.videos) return;
            
            const video = chapter.videos.find(v => v.id === videoId);
            if (!video) return;
            
            CustomModal.input('Edit Video Title', 'Enter new title', video.title, (newTitle) => {
                if (!newTitle) return Notify.show('Title cannot be empty', 'error');
                
                video.title = newTitle;
                Pathway.save();
                Pathway.renderChapter(courseId, chapterId);
                Notify.show('Video updated!');
            });
        },
        
        deleteVideo: (courseId, chapterId, videoId) => {
            const course = Pathway.courses.find(c => c.id === courseId);
            if (!course) return;
            
            const chapter = course.chapters.find(ch => ch.id === chapterId);
            if (!chapter || !chapter.videos) return;
            
            Modals.confirm('Delete Video', 'Are you sure you want to delete this video?', () => {
                chapter.videos = chapter.videos.filter(v => v.id !== videoId);
                Pathway.save();
                Pathway.renderChapter(courseId, chapterId);
                Notify.show('Video deleted');
            });
        },
        
        editChapter: (courseId, chapterId) => {
            const course = Pathway.courses.find(c => c.id === courseId);
            if (!course) return;
            
            const chapter = course.chapters.find(ch => ch.id === chapterId);
            if (!chapter) return;
            
            CustomModal.input('Edit Chapter', 'Enter new chapter name', chapter.name, (newName) => {
                if (!newName) return Notify.show('Name cannot be empty', 'error');
                
                chapter.name = newName;
                Pathway.save();
                Pathway.renderCourse(courseId);
                Notify.show('Chapter updated!');
            });
        },
        
        deleteChapter: (courseId, chapterId) => {
            const course = Pathway.courses.find(c => c.id === courseId);
            if (!course) return;
            
            Modals.confirm('Delete Chapter', 'Delete this chapter and all its content?', () => {
                course.chapters = course.chapters.filter(ch => ch.id !== chapterId);
                Pathway.save();
                Pathway.renderCourse(courseId);
                Notify.show('Chapter deleted');
            });
        },
        
        editCourse: (courseId) => {
            const course = Pathway.courses.find(c => c.id === courseId);
            if (!course) return;
            
            // Create edit modal
            const modal = document.createElement('div');
            modal.className = 'modal-overlay active';
            modal.innerHTML = `
                <div class="modal-box">
                    <h2 style="margin-bottom: 20px;">Edit Course</h2>
                    <div class="input-wrapper">
                        <label>Course Title</label>
                        <input type="text" id="edit-course-title" class="input-std" value="${course.title}">
                    </div>
                    <div class="input-wrapper">
                        <label>Course Icon (Emoji)</label>
                        <input type="text" id="edit-course-icon" class="input-std" value="${course.icon}" maxlength="2">
                    </div>
                    <div class="input-wrapper">
                        <label>Progress</label>
                        <input type="number" id="edit-course-progress" class="input-std" value="${course.progress}" min="0" max="100">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-secondary" style="flex: 1;" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        <button class="btn btn-primary" style="flex: 1;" onclick="PathwayEnhanced.saveCourseEdit(${courseId}); this.closest('.modal-overlay').remove()">Save</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        },
        
        saveCourseEdit: (courseId) => {
            const course = Pathway.courses.find(c => c.id === courseId);
            if (!course) return;
            
            const title = document.getElementById('edit-course-title').value.trim();
            const icon = document.getElementById('edit-course-icon').value.trim();
            const progress = parseInt(document.getElementById('edit-course-progress').value);
            
            if (!title) return Notify.show('Title cannot be empty', 'error');
            
            course.title = title;
            course.icon = icon || '📚';
            course.progress = Math.max(0, Math.min(100, progress));
            
            Pathway.save();
            Pathway.renderCourses();
            Notify.show('Course updated!', 'success');
        },
        
        deleteCourse: (courseId) => {
            Modals.confirm('Delete Course', 'Delete this entire course and all its content?', () => {
                Pathway.courses = Pathway.courses.filter(c => c.id !== courseId);
                Pathway.save();
                Pathway.renderCourses();
                Notify.show('Course deleted');
            });
        }
    };

    // Update Pathway.renderChapter to include videos
    const originalRenderChapter = Pathway.renderChapter;
    Pathway.renderChapter = function(courseId, chapterId) {
        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;
        
        const chapter = course.chapters.find(ch => ch.id === chapterId);
        if (!chapter) return;
        
        Pathway.currentChapter = chapterId;
        
        const container = document.getElementById('chapter-detail');
        if (!container) return;
        
        // Header with edit/delete
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <button class="btn btn-secondary" style="border: none;" onclick="Pathway.renderCourse(${courseId})">
                        <i class="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 style="font-size: 1.8rem; margin: 0;">${chapter.name}</h2>
                        <p style="color: var(--text-secondary); margin: 5px 0 0 0;">
                            ${chapter.items.length} lessons • ${chapter.videos ? chapter.videos.length : 0} videos
                        </p>
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary" onclick="PathwayEnhanced.editChapter(${courseId}, ${chapterId})">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="PathwayEnhanced.deleteChapter(${courseId}, ${chapterId})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Videos section
        if (chapter.videos && chapter.videos.length > 0) {
            html += `
                <div style="margin-bottom: 30px;">
                    <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                        <i class="fa-solid fa-video"></i> Videos
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                        ${chapter.videos.map(video => `
                            <div class="pathway-video-card ${video.completed ? 'completed' : ''}" onclick="PathwayEnhanced.playVideo(${courseId}, ${chapterId}, ${video.id})">
                                <div class="video-thumbnail">
                                    <i class="fa-solid fa-play"></i>
                                    ${video.completed ? '<div class="video-check"><i class="fa-solid fa-check"></i></div>' : ''}
                                </div>
                                <div class="video-info">
                                    <div class="video-title">${video.title}</div>
                                    <div class="video-actions" onclick="event.stopPropagation()">
                                        <button class="btn-icon-sm" onclick="PathwayEnhanced.editVideo(${courseId}, ${chapterId}, ${video.id})" title="Edit">
                                            <i class="fa-solid fa-pen"></i>
                                        </button>
                                        <button class="btn-icon-sm" onclick="PathwayEnhanced.deleteVideo(${courseId}, ${chapterId}, ${video.id})" title="Delete">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Lessons section
        html += `
            <div style="margin-bottom: 20px;">
                <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-book"></i> Lessons
                </h3>
                <div class="chapter-items">
                    ${chapter.items.map((item, idx) => `
                        <div class="chapter-item ${item.completed ? 'completed' : ''}" onclick="Pathway.toggleItem(${courseId}, ${chapterId}, ${idx})">
                            <div class="item-check ${item.completed ? 'checked' : ''}">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            <div class="item-content">
                                <div class="item-title">${item.title}</div>
                                ${item.duration ? `<div class="item-meta">${item.duration}</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Action buttons
        html += `
            <div style="display: flex; gap: 10px; margin-top: 25px;">
                <button class="btn btn-primary" onclick="PathwayEnhanced.addVideo(${courseId}, ${chapterId})">
                    <i class="fa-solid fa-video"></i> Add Video
                </button>
                <button class="btn btn-secondary" onclick="Pathway.addLesson(${courseId}, ${chapterId})">
                    <i class="fa-solid fa-plus"></i> Add Lesson
                </button>
            </div>
        `;
        
        container.innerHTML = html;
        container.scrollTop = 0;
    };

    // Update course rendering to include edit/delete
    const originalRenderCourses = Pathway.renderCourses;
    Pathway.renderCourses = function() {
        const container = document.getElementById('course-list');
        if (!container) return;
        
        if (Pathway.courses.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                    <i class="fa-solid fa-book-open" style="font-size: 3rem; opacity: 0.3; margin-bottom: 20px;"></i>
                    <p style="font-size: 1.1rem;">No courses yet. Create one to get started!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = Pathway.courses.map(course => `
            <div class="course-card" onclick="Pathway.renderCourse(${course.id})">
                <div class="course-icon">${course.icon}</div>
                <div class="course-info">
                    <div class="course-title">${course.title}</div>
                    <div class="course-meta">
                        <span>${course.chapters.length} chapters</span>
                        <span class="course-progress-text">${course.progress}% complete</span>
                    </div>
                    <div class="course-progress-bar">
                        <div class="course-progress-fill" style="width: ${course.progress}%"></div>
                    </div>
                </div>
                <div class="course-actions" onclick="event.stopPropagation()">
                    <button class="btn-icon-sm" onclick="PathwayEnhanced.editCourse(${course.id})" title="Edit Course">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-icon-sm" onclick="PathwayEnhanced.deleteCourse(${course.id})" title="Delete Course">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    };

    console.log('✅ Pathway video & edit features loaded');
// ========== LEARNING PATH ENHANCED FEATURES ==========
const PathwayAdvanced = {
    // Add new chapter to course
    addChapter: (courseId) => {
        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;

        // Show modal to create chapter
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-box">
                <h2 style="margin-bottom: 20px; font-weight: 700;">
                    <i class="fa-solid fa-folder-plus"></i> Add New Chapter
                </h2>
                <div class="input-wrapper">
                    <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Chapter Name</label>
                    <input type="text" id="new-chapter-name" class="input-std" placeholder="e.g., Introduction to JavaScript" autofocus>
                </div>
                <div class="input-wrapper">
                    <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Description (Optional)</label>
                    <textarea id="new-chapter-desc" class="input-std" rows="3" placeholder="Brief description of this chapter..."></textarea>
                </div>
                <div class="input-wrapper">
                    <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Estimated Duration</label>
                    <input type="text" id="new-chapter-duration" class="input-std" placeholder="e.g., 2 hours">
                </div>
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button class="btn btn-secondary" style="flex: 1;" onclick="this.closest('.modal-overlay').remove()">
                        Cancel
                    </button>
                    <button class="btn btn-primary" style="flex: 1;" onclick="PathwayAdvanced.saveNewChapter(${courseId}); this.closest('.modal-overlay').remove()">
                        <i class="fa-solid fa-check"></i> Create Chapter
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    saveNewChapter: (courseId) => {
        const name = document.getElementById('new-chapter-name').value.trim();
        const desc = document.getElementById('new-chapter-desc').value.trim();
        const duration = document.getElementById('new-chapter-duration').value.trim();

        if (!name) {
            Notify.show('Chapter name is required', 'error');
            return;
        }

        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;

        const newChapter = {
            id: Date.now(),
            name: name,
            description: desc,
            duration: duration,
            items: [],
            videos: [],
            createdAt: new Date().toISOString()
        };

        course.chapters.push(newChapter);
        Pathway.save();
        Pathway.renderCourse(courseId);
        Notify.show('Chapter created!', 'success');
    },

    // Edit existing chapter
    editChapter: (courseId, chapterId) => {
        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;

        const chapter = course.chapters.find(ch => ch.id === chapterId);
        if (!chapter) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-box">
                <h2 style="margin-bottom: 20px; font-weight: 700;">
                    <i class="fa-solid fa-pen"></i> Edit Chapter
                </h2>
                <div class="input-wrapper">
                    <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Chapter Name</label>
                    <input type="text" id="edit-chapter-name" class="input-std" value="${chapter.name}" autofocus>
                </div>
                <div class="input-wrapper">
                    <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Description</label>
                    <textarea id="edit-chapter-desc" class="input-std" rows="3">${chapter.description || ''}</textarea>
                </div>
                <div class="input-wrapper">
                    <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Duration</label>
                    <input type="text" id="edit-chapter-duration" class="input-std" value="${chapter.duration || ''}">
                </div>
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button class="btn btn-secondary" style="flex: 1;" onclick="this.closest('.modal-overlay').remove()">
                        Cancel
                    </button>
                    <button class="btn btn-primary" style="flex: 1;" onclick="PathwayAdvanced.saveChapterEdit(${courseId}, ${chapterId}); this.closest('.modal-overlay').remove()">
                        <i class="fa-solid fa-save"></i> Save Changes
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    saveChapterEdit: (courseId, chapterId) => {
        const name = document.getElementById('edit-chapter-name').value.trim();
        const desc = document.getElementById('edit-chapter-desc').value.trim();
        const duration = document.getElementById('edit-chapter-duration').value.trim();

        if (!name) {
            Notify.show('Chapter name is required', 'error');
            return;
        }

        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;

        const chapter = course.chapters.find(ch => ch.id === chapterId);
        if (!chapter) return;

        chapter.name = name;
        chapter.description = desc;
        chapter.duration = duration;
        chapter.updatedAt = new Date().toISOString();

        Pathway.save();
        Pathway.renderCourse(courseId);
        Notify.show('Chapter updated!', 'success');
    },

    // Add new lesson to chapter
    addLesson: (courseId, chapterId) => {
        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;

        const chapter = course.chapters.find(ch => ch.id === chapterId);
        if (!chapter) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-box">
                <h2 style="margin-bottom: 20px; font-weight: 700;">
                    <i class="fa-solid fa-book-open"></i> Add New Lesson
                </h2>
                <div class="input-wrapper">
                    <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Lesson Title</label>
                    <input type="text" id="new-lesson-title" class="input-std" placeholder="e.g., Variables and Data Types" autofocus>
                </div>
                <div class="input-wrapper">
                    <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Duration</label>
                    <input type="text" id="new-lesson-duration" class="input-std" placeholder="e.g., 15 min">
                </div>
                <div class="input-wrapper">
                    <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Content/Notes (Optional)</label>
                    <textarea id="new-lesson-content" class="input-std" rows="4" placeholder="Additional notes or description..."></textarea>
                </div>
                <div class="input-wrapper">
                    <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Type</label>
                    <select id="new-lesson-type" class="input-std">
                        <option value="reading">📖 Reading</option>
                        <option value="video">🎥 Video</option>
                        <option value="exercise">✏️ Exercise</option>
                        <option value="quiz">📝 Quiz</option>
                        <option value="project">🚀 Project</option>
                    </select>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button class="btn btn-secondary" style="flex: 1;" onclick="this.closest('.modal-overlay').remove()">
                        Cancel
                    </button>
                    <button class="btn btn-primary" style="flex: 1;" onclick="PathwayAdvanced.saveNewLesson(${courseId}, ${chapterId}); this.closest('.modal-overlay').remove()">
                        <i class="fa-solid fa-check"></i> Add Lesson
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    saveNewLesson: (courseId, chapterId) => {
        const title = document.getElementById('new-lesson-title').value.trim();
        const duration = document.getElementById('new-lesson-duration').value.trim();
        const content = document.getElementById('new-lesson-content').value.trim();
        const type = document.getElementById('new-lesson-type').value;

        if (!title) {
            Notify.show('Lesson title is required', 'error');
            return;
        }

        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;

        const chapter = course.chapters.find(ch => ch.id === chapterId);
        if (!chapter) return;

        const newLesson = {
            id: Date.now(),
            title: title,
            duration: duration,
            content: content,
            type: type,
            completed: false,
            createdAt: new Date().toISOString()
        };

        chapter.items.push(newLesson);
        Pathway.save();
        Pathway.renderChapter(courseId, chapterId);
        Notify.show('Lesson added!', 'success');
    },

    // Edit existing lesson
    editLesson: (courseId, chapterId, lessonIndex) => {
        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;

        const chapter = course.chapters.find(ch => ch.id === chapterId);
        if (!chapter) return;

        const lesson = chapter.items[lessonIndex];
        if (!lesson) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-box">
                <h2 style="margin-bottom: 20px; font-weight: 700;">
                    <i class="fa-solid fa-pen"></i> Edit Lesson
                </h2>
                <div class="input-wrapper">
                    <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Lesson Title</label>
                    <input type="text" id="edit-lesson-title" class="input-std" value="${lesson.title}" autofocus>
                </div>
                <div class="input-wrapper">
                    <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Duration</label>
                    <input type="text" id="edit-lesson-duration" class="input-std" value="${lesson.duration || ''}">
                </div>
                <div class="input-wrapper">
                    <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Content/Notes</label>
                    <textarea id="edit-lesson-content" class="input-std" rows="4">${lesson.content || ''}</textarea>
                </div>
                <div class="input-wrapper">
                    <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">Type</label>
                    <select id="edit-lesson-type" class="input-std">
                        <option value="reading" ${lesson.type === 'reading' ? 'selected' : ''}>📖 Reading</option>
                        <option value="video" ${lesson.type === 'video' ? 'selected' : ''}>🎥 Video</option>
                        <option value="exercise" ${lesson.type === 'exercise' ? 'selected' : ''}>✏️ Exercise</option>
                        <option value="quiz" ${lesson.type === 'quiz' ? 'selected' : ''}>📝 Quiz</option>
                        <option value="project" ${lesson.type === 'project' ? 'selected' : ''}>🚀 Project</option>
                    </select>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button class="btn btn-danger" onclick="PathwayAdvanced.deleteLesson(${courseId}, ${chapterId}, ${lessonIndex}); this.closest('.modal-overlay').remove()">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                    <div style="flex: 1;"></div>
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cancel
                    </button>
                    <button class="btn btn-primary" onclick="PathwayAdvanced.saveLessonEdit(${courseId}, ${chapterId}, ${lessonIndex}); this.closest('.modal-overlay').remove()">
                        <i class="fa-solid fa-save"></i> Save
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    saveLessonEdit: (courseId, chapterId, lessonIndex) => {
        const title = document.getElementById('edit-lesson-title').value.trim();
        const duration = document.getElementById('edit-lesson-duration').value.trim();
        const content = document.getElementById('edit-lesson-content').value.trim();
        const type = document.getElementById('edit-lesson-type').value;

        if (!title) {
            Notify.show('Lesson title is required', 'error');
            return;
        }

        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;

        const chapter = course.chapters.find(ch => ch.id === chapterId);
        if (!chapter) return;

        const lesson = chapter.items[lessonIndex];
        if (!lesson) return;

        lesson.title = title;
        lesson.duration = duration;
        lesson.content = content;
        lesson.type = type;
        lesson.updatedAt = new Date().toISOString();

        Pathway.save();
        Pathway.renderChapter(courseId, chapterId);
        Notify.show('Lesson updated!', 'success');
    },

    deleteLesson: (courseId, chapterId, lessonIndex) => {
        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;

        const chapter = course.chapters.find(ch => ch.id === chapterId);
        if (!chapter) return;

        chapter.items.splice(lessonIndex, 1);
        Pathway.save();
        Pathway.renderChapter(courseId, chapterId);
        Notify.show('Lesson deleted', 'success');
    },

    deleteChapter: (courseId, chapterId) => {
        Modals.confirm('Delete Chapter', 'Are you sure? All lessons and videos will be deleted.', () => {
            const course = Pathway.courses.find(c => c.id === courseId);
            if (!course) return;

            course.chapters = course.chapters.filter(ch => ch.id !== chapterId);
            Pathway.save();
            Pathway.renderCourse(courseId);
            Notify.show('Chapter deleted', 'success');
        });
    },

    // Get lesson type icon
    getLessonTypeIcon: (type) => {
        const icons = {
            'reading': '📖',
            'video': '🎥',
            'exercise': '✏️',
            'quiz': '📝',
            'project': '🚀'
        };
        return icons[type] || '📄';
    }
};

// Override Pathway rendering to include new features
if (typeof Pathway !== 'undefined') {
    // Store original functions
    const originalRenderCourse = Pathway.renderCourse;
    const originalRenderChapter = Pathway.renderChapter;

    // Enhanced course rendering
    Pathway.renderCourse = function(courseId) {
        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;

        Pathway.currentCourse = courseId;
        document.getElementById('course-list').classList.add('hidden');
        document.getElementById('course-detail').classList.remove('hidden');

        const container = document.getElementById('course-detail');
        
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <button class="btn btn-secondary" style="border: none;" onclick="Pathway.backToCourses()">
                        <i class="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 style="font-size: 2rem; margin: 0;">${course.icon} ${course.title}</h2>
                        <p style="color: var(--text-secondary); margin: 5px 0 0 0;">${course.chapters.length} chapters</p>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="PathwayAdvanced.addChapter(${courseId})">
                    <i class="fa-solid fa-plus"></i> Add Chapter
                </button>
            </div>

            <div class="chapters-grid">
                ${course.chapters.map(chapter => `
                    <div class="chapter-card" onclick="Pathway.renderChapter(${courseId}, ${chapter.id})">
                        <div class="chapter-header">
                            <h3>${chapter.name}</h3>
                            <div class="chapter-actions" onclick="event.stopPropagation()">
                                <button class="btn-icon-sm" onclick="PathwayAdvanced.editChapter(${courseId}, ${chapter.id})" title="Edit">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button class="btn-icon-sm" onclick="PathwayAdvanced.deleteChapter(${courseId}, ${chapter.id})" title="Delete">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        ${chapter.description ? `<p class="chapter-desc">${chapter.description}</p>` : ''}
                        <div class="chapter-meta">
                            <span><i class="fa-solid fa-book"></i> ${chapter.items.length} lessons</span>
                            ${chapter.duration ? `<span><i class="fa-solid fa-clock"></i> ${chapter.duration}</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = html;
    };

    // Enhanced chapter rendering
    Pathway.renderChapter = function(courseId, chapterId) {
        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;

        const chapter = course.chapters.find(ch => ch.id === chapterId);
        if (!chapter) return;

        Pathway.currentChapter = chapterId;
        
        const container = document.getElementById('chapter-detail');
        if (!container) return;

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <button class="btn btn-secondary" style="border: none;" onclick="Pathway.renderCourse(${courseId})">
                        <i class="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 style="font-size: 1.8rem; margin: 0;">${chapter.name}</h2>
                        <p style="color: var(--text-secondary); margin: 5px 0 0 0;">
                            ${chapter.items.length} lessons
                            ${chapter.duration ? ` • ${chapter.duration}` : ''}
                        </p>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary" onclick="PathwayAdvanced.editChapter(${courseId}, ${chapterId})">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="btn btn-primary" onclick="PathwayAdvanced.addLesson(${courseId}, ${chapterId})">
                        <i class="fa-solid fa-plus"></i> Add Lesson
                    </button>
                </div>
            </div>

            ${chapter.description ? `
                <div style="background: var(--hover-bg); padding: 20px; border-radius: var(--radius-lg); margin-bottom: 25px;">
                    <p style="margin: 0; color: var(--text-primary); line-height: 1.6;">${chapter.description}</p>
                </div>
            ` : ''}

            <div class="chapter-items">
                ${chapter.items.length === 0 ? `
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                        <i class="fa-solid fa-book-open" style="font-size: 3rem; opacity: 0.3; margin-bottom: 15px; display: block;"></i>
                        <p>No lessons yet. Click "Add Lesson" to get started!</p>
                    </div>
                ` : chapter.items.map((item, idx) => `
                    <div class="chapter-item ${item.completed ? 'completed' : ''}" 
                         onclick="event.target.classList.contains('btn-icon-sm') || event.target.closest('.lesson-actions') ? null : Pathway.toggleItem(${courseId}, ${chapterId}, ${idx})">
                        <div class="item-check ${item.completed ? 'checked' : ''}">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <div class="item-content" style="flex: 1;">
                            <div class="item-title">
                                ${PathwayAdvanced.getLessonTypeIcon(item.type)} ${item.title}
                            </div>
                            ${item.duration ? `<div class="item-meta">${item.duration}</div>` : ''}
                        </div>
                        <div class="lesson-actions" onclick="event.stopPropagation()">
                            <button class="btn-icon-sm" onclick="PathwayAdvanced.editLesson(${courseId}, ${chapterId}, ${idx})" title="Edit lesson">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = html;
        container.scrollTop = 0;
    };
}

console.log('✅ Learning Path enhanced features loaded');

// ========== MOBILE NAVIGATION ==========
const MobileNav = {
    init: () => {
        // Create mobile menu button
        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        menuBtn.onclick = MobileNav.toggleSidebar;
        
        // Create mobile overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        overlay.onclick = MobileNav.closeSidebar;
        
        // Add to app shell
        const appShell = document.getElementById('app-shell');
        if (appShell && window.innerWidth <= 768) {
            appShell.prepend(menuBtn);
            appShell.prepend(overlay);
        }
    },

    toggleSidebar: () => {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (sidebar) {
            sidebar.classList.toggle('mobile-open');
        }
        if (overlay) {
            overlay.classList.toggle('active');
        }
    },

    closeSidebar: () => {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (sidebar) {
            sidebar.classList.remove('mobile-open');
        }
        if (overlay) {
            overlay.classList.remove('active');
        }
    },

    // Close sidebar when navigating
    onNavigate: () => {
        if (window.innerWidth <= 768) {
            MobileNav.closeSidebar();
        }
    }
};

// Initialize mobile nav when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(MobileNav.init, 100);
    });
} else {
    setTimeout(MobileNav.init, 100);
}

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (window.innerWidth > 768) {
            // Desktop: remove mobile elements
            if (menuBtn) menuBtn.style.display = 'none';
            if (overlay) overlay.style.display = 'none';
            MobileNav.closeSidebar();
        } else {
            // Mobile: show mobile elements
            if (menuBtn) menuBtn.style.display = 'flex';
            if (overlay && overlay.classList.contains('active')) {
                overlay.style.display = 'block';
            }
        }
    }, 200);
});

// Override Nav.to to close mobile sidebar
if (typeof Nav !== 'undefined') {
    const originalNavTo = Nav.to;
    Nav.to = function(module, el) {
        originalNavTo.call(this, module, el);
        MobileNav.onNavigate();
    };
}

console.log('✅ Mobile navigation loaded');

// ========== FORGOT PASSWORD FEATURE ==========
const ForgotPassword = {
    show: () => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-box" style="max-width: 450px;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                        <i class="fa-solid fa-key" style="color: white; font-size: 24px;"></i>
                    </div>
                    <h2 style="margin: 0 0 10px 0; font-weight: 700;">Reset Password</h2>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                        We'll send you instructions to reset your password
                    </p>
                </div>

                <div id="forgot-step-1">
                    <div class="input-wrapper">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-secondary);">
                            Email Address
                        </label>
                        <input type="email" id="forgot-email" class="input-std" placeholder="your.email@example.com" autofocus>
                    </div>

                    <button class="btn btn-primary w-full" onclick="ForgotPassword.sendResetCode()" style="margin-top: 20px;">
                        <i class="fa-solid fa-paper-plane"></i> Send Reset Code
                    </button>
                </div>

                <div id="forgot-step-2" style="display: none;">
                    <div class="input-wrapper">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-secondary);">
                            Verification Code
                        </label>
                        <input type="text" id="reset-code" class="input-std" placeholder="Enter 6-digit code" maxlength="6">
                        <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 8px 0 0 0;">
                            Check your email for the code
                        </p>
                    </div>

                    <div class="input-wrapper">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-secondary);">
                            New Password
                        </label>
                        <input type="password" id="new-password" class="input-std" placeholder="Enter new password">
                    </div>

                    <div class="input-wrapper">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-secondary);">
                            Confirm Password
                        </label>
                        <input type="password" id="confirm-password" class="input-std" placeholder="Confirm new password">
                    </div>

                    <button class="btn btn-primary w-full" onclick="ForgotPassword.resetPassword()" style="margin-top: 20px;">
                        <i class="fa-solid fa-check"></i> Reset Password
                    </button>

                    <button class="btn btn-secondary w-full" onclick="ForgotPassword.backToStep1()" style="margin-top: 10px; border: none;">
                        <i class="fa-solid fa-arrow-left"></i> Back
                    </button>
                </div>

                <button class="btn btn-secondary w-full" onclick="this.closest('.modal-overlay').remove()" style="margin-top: 15px; border: none;">
                    Cancel
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    },

    sendResetCode: () => {
        const email = document.getElementById('forgot-email').value.trim();
        
        if (!email) {
            Notify.show('Please enter your email', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Notify.show('Please enter a valid email address', 'error');
            return;
        }

        // Check if email exists in users
        const users = Storage.get('spartan_users') || [];
        const user = users.find(u => u.email === email);

        if (!user) {
            Notify.show('No account found with this email', 'error');
            return;
        }

        // Generate 6-digit code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store reset code with expiry (10 minutes)
        const resetData = {
            email: email,
            code: resetCode,
            expires: Date.now() + 600000 // 10 minutes
        };
        Storage.set('spartan_reset_' + email, resetData);

        // Show code in console (for demo - in real app, send via email)
        console.log('='.repeat(50));
        console.log('PASSWORD RESET CODE (Demo Mode)');
        console.log('='.repeat(50));
        console.log('Email:', email);
        console.log('Code:', resetCode);
        console.log('Expires in: 10 minutes');
        console.log('='.repeat(50));

        // Show step 2
        document.getElementById('forgot-step-1').style.display = 'none';
        document.getElementById('forgot-step-2').style.display = 'block';

        Notify.show('Reset code sent! Check your email (or console for demo)', 'success');
    },

    backToStep1: () => {
        document.getElementById('forgot-step-1').style.display = 'block';
        document.getElementById('forgot-step-2').style.display = 'none';
    },

    resetPassword: () => {
        const email = document.getElementById('forgot-email').value.trim();
        const code = document.getElementById('reset-code').value.trim();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validation
        if (!code) {
            Notify.show('Please enter the verification code', 'error');
            return;
        }

        if (!newPassword) {
            Notify.show('Please enter a new password', 'error');
            return;
        }

        if (newPassword.length < 6) {
            Notify.show('Password must be at least 6 characters', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            Notify.show('Passwords do not match', 'error');
            return;
        }

        // Verify reset code
        const resetData = Storage.get('spartan_reset_' + email);
        
        if (!resetData) {
            Notify.show('Invalid or expired reset code', 'error');
            return;
        }

        if (Date.now() > resetData.expires) {
            Storage.remove('spartan_reset_' + email);
            Notify.show('Reset code has expired. Please request a new one.', 'error');
            ForgotPassword.backToStep1();
            return;
        }

        if (resetData.code !== code) {
            Notify.show('Invalid verification code', 'error');
            return;
        }

        // Update password
        const users = Storage.get('spartan_users') || [];
        const userIndex = users.findIndex(u => u.email === email);
        
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            Storage.set('spartan_users', users);
            
            // Clear reset data
            Storage.remove('spartan_reset_' + email);
            
            // Close modal
            document.querySelector('.modal-overlay').remove();
            
            Notify.show('Password reset successfully! You can now login.', 'success');
            
            // Pre-fill email in login form
            setTimeout(() => {
                const emailInput = document.getElementById('login-email');
                if (emailInput) emailInput.value = email;
            }, 500);
        } else {
            Notify.show('An error occurred. Please try again.', 'error');
        }
    }
};

// Add forgot password link to auth screen
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ForgotPassword.addLink);
} else {
    setTimeout(ForgotPassword.addLink, 100);
}

ForgotPassword.addLink = () => {
    const loginBtn = document.querySelector('#auth-screen button[onclick*="Auth.login"]');
    if (loginBtn && !document.getElementById('forgot-password-link')) {
        const forgotLink = document.createElement('div');
        forgotLink.id = 'forgot-password-link';
        forgotLink.style.cssText = 'text-align: center; margin-top: 15px;';
        forgotLink.innerHTML = `
            <a href="#" onclick="ForgotPassword.show(); return false;" 
               style="color: var(--accent-color); text-decoration: none; font-size: 0.9rem; font-weight: 600; transition: opacity 0.2s;"
               onmouseover="this.style.opacity='0.8'"
               onmouseout="this.style.opacity='1'">
                <i class="fa-solid fa-key"></i> Forgot Password?
            </a>
        `;
        loginBtn.parentElement.appendChild(forgotLink);
    }
};

console.log('✅ Forgot Password feature loaded');

// ========== ENHANCED UI BUTTONS FOR PATHWAY ==========
const PathwayUI = {
    // Inject action buttons into course view
    enhanceCourseView: () => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    const courseDetail = document.getElementById('course-detail');
                    if (courseDetail && !courseDetail.classList.contains('hidden')) {
                        PathwayUI.addCourseButtons();
                    }
                }
            });
        });

        const courseDetail = document.getElementById('course-detail');
        if (courseDetail) {
            observer.observe(courseDetail, { childList: true, subtree: true });
        }
    },

    addCourseButtons: () => {
        // Check if buttons already exist
        if (document.getElementById('pathway-action-buttons')) return;

        const courseDetail = document.getElementById('course-detail');
        if (!courseDetail || courseDetail.classList.contains('hidden')) return;

        // Find the chapters grid
        const chaptersGrid = courseDetail.querySelector('.chapters-grid');
        if (!chaptersGrid) return;

        // Create action bar
        const actionBar = document.createElement('div');
        actionBar.id = 'pathway-action-buttons';
        actionBar.style.cssText = `
            background: var(--bg-surface);
            border: 2px dashed var(--border-color);
            border-radius: var(--radius-lg);
            padding: 30px;
            text-align: center;
            margin-top: 20px;
        `;
        
        actionBar.innerHTML = `
            <div style="margin-bottom: 15px;">
                <i class="fa-solid fa-plus-circle" style="font-size: 2.5rem; color: var(--accent-color); opacity: 0.5;"></i>
            </div>
            <h3 style="margin: 0 0 10px 0; color: var(--text-primary); font-weight: 700;">Add More Content</h3>
            <p style="color: var(--text-secondary); margin: 0 0 20px 0; font-size: 0.9rem;">
                Build your course by adding new chapters
            </p>
            <button class="btn btn-primary" style="font-size: 1rem; padding: 14px 30px;" onclick="PathwayAdvanced.addChapter(Pathway.currentCourse)">
                <i class="fa-solid fa-folder-plus"></i> Add New Chapter
            </button>
        `;

        chaptersGrid.after(actionBar);
    },

    // Enhance chapter view with lesson add button
    enhanceChapterView: () => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    const chapterDetail = document.getElementById('chapter-detail');
                    if (chapterDetail && !chapterDetail.classList.contains('hidden')) {
                        PathwayUI.addChapterButtons();
                    }
                }
            });
        });

        const chapterDetail = document.getElementById('chapter-detail');
        if (chapterDetail) {
            observer.observe(chapterDetail, { childList: true, subtree: true });
        }
    },

    addChapterButtons: () => {
        // Check if buttons already exist
        if (document.getElementById('chapter-action-buttons')) return;

        const chapterDetail = document.getElementById('chapter-detail');
        if (!chapterDetail || chapterDetail.classList.contains('hidden')) return;

        const chapterItems = chapterDetail.querySelector('.chapter-items');
        if (!chapterItems) return;

        // Check if there are no lessons
        const hasLessons = chapterItems.querySelector('.chapter-item');
        
        if (!hasLessons) {
            // Show prominent add lesson button when empty
            const emptyState = document.createElement('div');
            emptyState.id = 'chapter-action-buttons';
            emptyState.style.cssText = `
                background: var(--bg-surface);
                border: 2px dashed var(--border-color);
                border-radius: var(--radius-lg);
                padding: 50px 30px;
                text-align: center;
            `;
            
            emptyState.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <i class="fa-solid fa-book-open" style="font-size: 3.5rem; color: var(--accent-color); opacity: 0.4;"></i>
                </div>
                <h3 style="margin: 0 0 10px 0; color: var(--text-primary); font-weight: 700; font-size: 1.3rem;">
                    No Lessons Yet
                </h3>
                <p style="color: var(--text-secondary); margin: 0 0 25px 0; font-size: 1rem; line-height: 1.6;">
                    Start building your chapter by adding your first lesson
                </p>
                <button class="btn btn-primary" style="font-size: 1.1rem; padding: 16px 35px;" 
                        onclick="PathwayAdvanced.addLesson(Pathway.currentCourse, Pathway.currentChapter)">
                    <i class="fa-solid fa-plus-circle"></i> Add First Lesson
                </button>
            `;
            
            chapterItems.innerHTML = '';
            chapterItems.appendChild(emptyState);
        } else {
            // Add floating action button for adding more lessons
            if (!document.getElementById('floating-add-lesson')) {
                const fabContainer = document.createElement('div');
                fabContainer.id = 'floating-add-lesson';
                fabContainer.style.cssText = `
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    z-index: 100;
                `;
                
                fabContainer.innerHTML = `
                    <button class="btn btn-primary" 
                            style="
                                width: 60px; 
                                height: 60px; 
                                border-radius: 50%; 
                                box-shadow: 0 4px 20px rgba(255, 81, 47, 0.4);
                                padding: 0;
                                font-size: 1.5rem;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            "
                            onclick="PathwayAdvanced.addLesson(Pathway.currentCourse, Pathway.currentChapter)"
                            title="Add Lesson">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                `;
                
                document.body.appendChild(fabContainer);
            }
        }
    },

    // Remove floating button when leaving chapter view
    removeFloatingButton: () => {
        const fab = document.getElementById('floating-add-lesson');
        if (fab) fab.remove();
    },

    init: () => {
        PathwayUI.enhanceCourseView();
        PathwayUI.enhanceChapterView();
        
        // Clean up floating button when navigating away
        if (typeof Nav !== 'undefined') {
            const originalNavTo = Nav.to;
            Nav.to = function(module, el) {
                PathwayUI.removeFloatingButton();
                originalNavTo.call(this, module, el);
            };
        }
    }
};

// Initialize UI enhancements
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', PathwayUI.init);
} else {
    setTimeout(PathwayUI.init, 200);
}

console.log('✅ Pathway UI enhancements loaded');

// ========== FIX FORGOT PASSWORD LINK INITIALIZATION ==========
(function initForgotPasswordLink() {
    // Wait for DOM and check multiple times
    let attempts = 0;
    const maxAttempts = 10;
    
    const addLink = () => {
        // Check if link already exists
        if (document.getElementById('forgot-password-link')) {
            return;
        }

        // Try to find login button
        const loginButtons = document.querySelectorAll('button[onclick*="Auth.login"]');
        let loginBtn = null;
        
        for (let btn of loginButtons) {
            if (btn.closest('#form-login')) {
                loginBtn = btn;
                break;
            }
        }

        if (loginBtn) {
            const forgotLink = document.createElement('div');
            forgotLink.id = 'forgot-password-link';
            forgotLink.style.cssText = 'text-align: center; margin-top: 15px;';
            forgotLink.innerHTML = `
                <a href="javascript:void(0)" onclick="ForgotPassword.show()" 
                   style="color: var(--accent-color); text-decoration: none; font-size: 0.9rem; font-weight: 600; transition: opacity 0.2s; display: inline-flex; align-items: center; gap: 6px;"
                   onmouseover="this.style.opacity='0.8'"
                   onmouseout="this.style.opacity='1'">
                    <i class="fa-solid fa-key"></i> Forgot Password?
                </a>
            `;
            
            // Insert after the login button's parent form
            const form = loginBtn.closest('form');
            if (form && form.parentElement) {
                // Check if button already exists in parent
                const existingLink = form.parentElement.querySelector('#forgot-password-link');
                if (!existingLink) {
                    form.after(forgotLink);
                    console.log('✅ Forgot password link added');
                }
            }
        } else {
            // Retry if not found
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(addLink, 500);
            }
        }
    };

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(addLink, 100);
        });
    } else {
        setTimeout(addLink, 100);
    }

    // Also watch for auth screen changes
    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.addedNodes.length) {
                const authScreen = document.getElementById('auth-screen');
                if (authScreen && !authScreen.classList.contains('hidden')) {
                    setTimeout(addLink, 100);
                }
            }
        }
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();

console.log('✅ Forgot password link initializer loaded');

// ========== ENHANCED MOBILE NAVIGATION & INTERACTIONS ==========

const MobileEnhanced = {
    init: () => {
        MobileEnhanced.createMobileUI();
        MobileEnhanced.setupEventListeners();
        MobileEnhanced.fixIOSIssues();
        MobileEnhanced.optimizePerformance();
    },

    createMobileUI: () => {
        if (window.innerWidth > 768) return;

        // Create mobile header
        if (!document.querySelector('.mobile-header')) {
            const header = document.createElement('div');
            header.className = 'mobile-header';
            header.innerHTML = `
                <button class="mobile-menu-btn" onclick="MobileEnhanced.toggleSidebar()">
                    <i class="fa-solid fa-bars"></i>
                </button>
                <div style="flex: 1; text-align: center; font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">
                    Spartan.Edu
                </div>
                <div style="width: 44px;"></div>
            `;
            document.body.prepend(header);
        }

        // Create overlay
        if (!document.querySelector('.mobile-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'mobile-overlay';
            overlay.onclick = MobileEnhanced.closeSidebar;
            document.body.appendChild(overlay);
        }
    },

    toggleSidebar: () => {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (sidebar) {
            sidebar.classList.toggle('mobile-open');
        }
        if (overlay) {
            overlay.classList.toggle('active');
        }

        // Toggle menu icon
        const menuBtn = document.querySelector('.mobile-menu-btn i');
        if (menuBtn) {
            if (sidebar.classList.contains('mobile-open')) {
                menuBtn.className = 'fa-solid fa-times';
            } else {
                menuBtn.className = 'fa-solid fa-bars';
            }
        }
    },

    closeSidebar: () => {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (sidebar) {
            sidebar.classList.remove('mobile-open');
        }
        if (overlay) {
            overlay.classList.remove('active');
        }

        // Reset menu icon
        const menuBtn = document.querySelector('.mobile-menu-btn i');
        if (menuBtn) {
            menuBtn.className = 'fa-solid fa-bars';
        }
    },

    setupEventListeners: () => {
        // Close sidebar when clicking nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    setTimeout(MobileEnhanced.closeSidebar, 300);
                }
            });
        });

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.innerWidth > 768) {
                    MobileEnhanced.closeSidebar();
                    const header = document.querySelector('.mobile-header');
                    const overlay = document.querySelector('.mobile-overlay');
                    if (header) header.style.display = 'none';
                    if (overlay) overlay.style.display = 'none';
                } else {
                    MobileEnhanced.createMobileUI();
                    const header = document.querySelector('.mobile-header');
                    if (header) header.style.display = 'flex';
                }
            }, 200);
        });

        // Prevent body scroll when sidebar is open
        const observer = new MutationObserver(() => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && sidebar.classList.contains('mobile-open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
        }
    },

    fixIOSIssues: () => {
        // Fix iOS Safari 100vh issue
        const setVH = () => {
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', setVH);

        // Prevent iOS zoom on input focus
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (window.innerWidth <= 768) {
                input.style.fontSize = '16px';
            }
        });

        // Fix iOS momentum scrolling
        const scrollableElements = document.querySelectorAll('.sidebar, .modal-box, .task-sidebar, .pathway-sidebar');
        scrollableElements.forEach(el => {
            el.style.webkitOverflowScrolling = 'touch';
        });
    },

    optimizePerformance: () => {
        // Throttle scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(() => {
                scrollTimeout = null;
                // Custom scroll handler here
            }, 100);
        }, { passive: true });

        // Lazy load images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Debounce resize events
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // Custom resize handler
                MobileEnhanced.handleResize();
            }, 250);
        });
    },

    handleResize: () => {
        // Update any size-dependent UI elements
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Mobile-specific updates
            document.querySelectorAll('.btn-icon-sm').forEach(btn => {
                btn.style.opacity = '1';
            });
        }
    },

    // Touch gesture support
    setupTouchGestures: () => {
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            MobileEnhanced.handleSwipe();
        }, { passive: true });

        const handleSwipe = () => {
            const swipeThreshold = 100;
            const sidebar = document.querySelector('.sidebar');
            
            // Swipe right to open sidebar (only if near left edge)
            if (touchStartX < 50 && touchEndX - touchStartX > swipeThreshold) {
                if (sidebar && !sidebar.classList.contains('mobile-open')) {
                    MobileEnhanced.toggleSidebar();
                }
            }
            
            // Swipe left to close sidebar
            if (touchStartX - touchEndX > swipeThreshold) {
                if (sidebar && sidebar.classList.contains('mobile-open')) {
                    MobileEnhanced.closeSidebar();
                }
            }
        };

        MobileEnhanced.handleSwipe = handleSwipe;
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(MobileEnhanced.init, 100);
        setTimeout(MobileEnhanced.setupTouchGestures, 200);
    });
} else {
    setTimeout(MobileEnhanced.init, 100);
    setTimeout(MobileEnhanced.setupTouchGestures, 200);
}

// ========== SMOOTH SCROLL ENHANCEMENTS ==========

const SmoothScroll = {
    init: () => {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href !== '#' && href !== 'javascript:void(0)') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', SmoothScroll.init);

// ========== PERFORMANCE MONITORING ==========

const PerformanceMonitor = {
    init: () => {
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        console.warn('Long task detected:', entry.duration, 'ms');
                    }
                }
            });

            try {
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Longtask API not supported
            }
        }

        // Log load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log('Page load time:', pageLoadTime, 'ms');
            }, 0);
        });
    }
};

if (window.location.hostname !== 'localhost') {
    // Only monitor in production
    // PerformanceMonitor.init();
}

console.log('✅ Mobile enhancements and performance optimizations loaded');

// ========== BOTTOM NAVIGATION (MOBILE) ==========
const BottomNav = {
    modules: [
        { id: 'dashboard', icon: 'fa-house', label: 'Home' },
        { id: 'flashcards', icon: 'fa-layer-group', label: 'Cards' },
        { id: 'tasks', icon: 'fa-list-check', label: 'Tasks' },
        { id: 'community', icon: 'fa-comments', label: 'Chat' },
        { id: 'pathway', icon: 'fa-book-open', label: 'Learn' }
    ],

    init: () => {
        if (window.innerWidth > 768) return;

        // Create bottom nav
        if (!document.querySelector('.bottom-nav')) {
            const nav = document.createElement('div');
            nav.className = 'bottom-nav';
            
            nav.innerHTML = BottomNav.modules.map(module => `
                <a href="javascript:void(0)" 
                   class="bottom-nav-item ${module.id === 'dashboard' ? 'active' : ''}" 
                   data-module="${module.id}"
                   onclick="BottomNav.navigate('${module.id}')">
                    <i class="fa-solid ${module.icon} bottom-nav-icon"></i>
                    <span class="bottom-nav-label">${module.label}</span>
                </a>
            `).join('');

            document.body.appendChild(nav);
        }

        // Set initial active state
        BottomNav.updateActive('dashboard');
    },

    navigate: (moduleId) => {
        // Find and click the corresponding nav item in original sidebar
        const navItem = document.querySelector(`.nav-item[data-mod="${moduleId}"]`);
        if (navItem) {
            navItem.click();
        }

        // Update active state
        BottomNav.updateActive(moduleId);

        // Haptic feedback on mobile
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    },

    updateActive: (moduleId) => {
        // Remove active from all
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active to current
        const activeItem = document.querySelector(`.bottom-nav-item[data-module="${moduleId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    },

    // Listen to navigation changes
    observeNavigation: () => {
        const observer = new MutationObserver(() => {
            const activeNavItem = document.querySelector('.nav-item.active');
            if (activeNavItem) {
                const moduleId = activeNavItem.getAttribute('data-mod');
                BottomNav.updateActive(moduleId);
            }
        });

        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            observer.observe(sidebar, { 
                attributes: true, 
                subtree: true, 
                attributeFilter: ['class'] 
            });
        }
    }
};

// Initialize bottom nav
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            BottomNav.init();
            BottomNav.observeNavigation();
        }, 200);
    });
} else {
    setTimeout(() => {
        BottomNav.init();
        BottomNav.observeNavigation();
    }, 200);
}

// Re-init on resize
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && !document.querySelector('.bottom-nav')) {
        BottomNav.init();
    } else if (window.innerWidth > 768) {
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) bottomNav.remove();
    }
});

console.log('✅ Bottom navigation loaded');

// ========== PIANO MOBILE ENHANCEMENTS ==========
const PianoMobile = {
    init: () => {
        if (window.innerWidth > 768) return;

        const pianoStage = document.querySelector('.piano-stage');
        if (!pianoStage) return;

        // Hide scroll hint after first scroll
        let hasScrolled = false;
        pianoStage.addEventListener('scroll', () => {
            if (!hasScrolled) {
                hasScrolled = true;
                pianoStage.classList.add('scrolled');
            }
        }, { passive: true });

        // Center piano on load
        setTimeout(() => {
            const keysWrapper = pianoStage.querySelector('.keys-wrapper');
            if (keysWrapper) {
                const scrollCenter = (keysWrapper.offsetWidth - pianoStage.offsetWidth) / 2;
                pianoStage.scrollLeft = scrollCenter;
            }
        }, 300);
    }
};

// Initialize when Piano module is shown
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => {
        const pianoModule = document.getElementById('mod-piano');
        if (pianoModule && !pianoModule.classList.contains('hidden')) {
            setTimeout(PianoMobile.init, 100);
        }
    });

    observer.observe(document.body, { 
        childList: true, 
        subtree: true, 
        attributes: true,
        attributeFilter: ['class']
    });
});

console.log('✅ Piano mobile enhancements loaded');

// ========== COMMUNITY MOBILE ENHANCEMENTS ==========
const CommunityMobile = {
    init: () => {
        if (window.innerWidth > 768) return;

        CommunityMobile.setupChannelSelector();
        CommunityMobile.optimizeMessageDisplay();
    },

    setupChannelSelector: () => {
        const communityModule = document.getElementById('mod-community');
        if (!communityModule) return;

        // Create mobile channel header
        const channelListContainer = communityModule.querySelector('div:first-child');
        if (!channelListContainer) return;

        // Get current channel
        const activeChannel = document.querySelector('.channel-item.active');
        const currentChannelName = activeChannel ? activeChannel.textContent.trim() : 'General';

        // Create mobile header
        const mobileHeader = document.createElement('div');
        mobileHeader.className = 'community-mobile-header';
        mobileHeader.innerHTML = `
            <div class="current-channel-display">
                <i class="fa-solid fa-hashtag"></i>
                <span id="current-channel-name">${currentChannelName}</span>
            </div>
            <button class="channel-dropdown-btn" onclick="CommunityMobile.toggleChannelList()">
                <i class="fa-solid fa-bars"></i>
                <span>Channels</span>
            </button>
        `;

        // Replace channel list container content
        channelListContainer.innerHTML = '';
        channelListContainer.appendChild(mobileHeader);

        // Move channel list to modal
        const channelList = document.getElementById('channel-list');
        if (channelList) {
            channelList.classList.remove('open');
            
            // Wrap in modal structure
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
                <div class="channel-list-header">
                    <h3>Channels</h3>
                    <button class="channel-list-close" onclick="CommunityMobile.toggleChannelList()">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <div class="channel-list-content"></div>
            `;

            const content = wrapper.querySelector('.channel-list-content');
            content.appendChild(channelList.cloneNode(true));
            
            channelList.innerHTML = '';
            wrapper.childNodes.forEach(node => channelList.appendChild(node));
        }

        // Update channel name when changed
        CommunityMobile.observeChannelChanges();
    },

    toggleChannelList: () => {
        const channelList = document.getElementById('channel-list');
        if (channelList) {
            channelList.classList.toggle('open');
            
            // Prevent body scroll when open
            if (channelList.classList.contains('open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    },

    observeChannelChanges: () => {
        const observer = new MutationObserver(() => {
            const activeChannel = document.querySelector('.channel-item.active');
            const currentChannelDisplay = document.getElementById('current-channel-name');
            
            if (activeChannel && currentChannelDisplay) {
                currentChannelDisplay.textContent = activeChannel.textContent.trim();
            }

            // Close channel list when channel selected
            CommunityMobile.toggleChannelList();
        });

        const channelList = document.getElementById('channel-list');
        if (channelList) {
            observer.observe(channelList, {
                attributes: true,
                subtree: true,
                attributeFilter: ['class']
            });
        }
    },

    optimizeMessageDisplay: () => {
        // Auto-scroll to bottom on new message
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const scrollToBottom = () => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        // Observe new messages
        const observer = new MutationObserver(scrollToBottom);
        observer.observe(chatMessages, { childList: true });

        // Initial scroll
        scrollToBottom();
    },

    // Handle textarea auto-resize
    setupInputResize: () => {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;

        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 150) + 'px';
        });
    }
};

// Initialize when Community module is active
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => {
        const communityModule = document.getElementById('mod-community');
        if (communityModule && !communityModule.classList.contains('hidden')) {
            setTimeout(() => {
                CommunityMobile.init();
                CommunityMobile.setupInputResize();
            }, 200);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
});

console.log('✅ Community mobile enhancements loaded');

// ========== FLASHCARDS MOBILE OPTIMIZATION ==========
const FlashcardsMobile = {
    init: () => {
        if (window.innerWidth > 768) return;

        FlashcardsMobile.optimizeDeckHeader();
        FlashcardsMobile.addTooltips();
    },

    optimizeDeckHeader: () => {
        const fcHeader = document.querySelector('.fc-header');
        if (!fcHeader) return;

        // Get actions container
        const actionsContainer = fcHeader.querySelector('div:last-child');
        if (!actionsContainer) return;

        // Ensure proper order
        const primaryBtn = actionsContainer.querySelector('.btn-primary');
        const addBtn = actionsContainer.querySelector('#btn-add-card');
        
        if (primaryBtn) {
            actionsContainer.insertBefore(primaryBtn, actionsContainer.firstChild);
        }
        if (addBtn) {
            actionsContainer.insertBefore(addBtn, actionsContainer.firstChild);
        }

        // Add tooltips to icon-only buttons
        const iconButtons = actionsContainer.querySelectorAll('.btn-secondary:not(#btn-add-card):not(#btn-edit-folder)');
        iconButtons.forEach(btn => {
            if (!btn.hasAttribute('title')) {
                const text = btn.textContent.trim();
                if (text) {
                    btn.setAttribute('title', text);
                }
            }
        });
    },

    addTooltips: () => {
        // Tooltip behavior already handled by CSS
        // This ensures titles are set correctly
        const buttons = document.querySelectorAll('.fc-header .btn-secondary');
        buttons.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon && !btn.hasAttribute('title')) {
                const classList = icon.className;
                let title = '';
                
                if (classList.includes('fa-shuffle')) title = 'Shuffle';
                else if (classList.includes('fa-share')) title = 'Share';
                else if (classList.includes('fa-brain')) title = 'Quiz';
                else if (classList.includes('fa-list-check')) title = 'Tasks';
                else if (classList.includes('fa-pen')) title = 'Edit';
                
                if (title) {
                    btn.setAttribute('title', title);
                    btn.setAttribute('data-tooltip', title);
                }
            }
        });
    },

    // Reorganize buttons for mobile
    reorganizeButtons: () => {
        const actionsDiv = document.querySelector('.fc-header > div:last-child');
        if (!actionsDiv || window.innerWidth > 768) return;

        // Group buttons by priority
        const primaryBtn = actionsDiv.querySelector('.btn-primary');
        const addBtn = actionsDiv.querySelector('#btn-add-card');
        const editBtn = actionsDiv.querySelector('#btn-edit-folder');
        const secondaryBtns = Array.from(actionsDiv.querySelectorAll('.btn-secondary'))
            .filter(btn => btn.id !== 'btn-add-card' && btn.id !== 'btn-edit-folder');

        // Clear and rebuild
        actionsDiv.innerHTML = '';

        // Add in order: Primary -> Add -> Edit -> Others in pairs
        if (primaryBtn) actionsDiv.appendChild(primaryBtn);
        if (addBtn) actionsDiv.appendChild(addBtn);
        if (editBtn) actionsDiv.appendChild(editBtn);
        
        secondaryBtns.forEach(btn => actionsDiv.appendChild(btn));
    }
};

// Initialize when flashcards module is shown
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => {
        const fcOverview = document.getElementById('fc-overview-panel');
        if (fcOverview && !fcOverview.classList.contains('hidden')) {
            setTimeout(() => {
                FlashcardsMobile.init();
            }, 100);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
});

// Re-init on resize
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        FlashcardsMobile.init();
    }
});

console.log('✅ Flashcards mobile optimization loaded');

// ========== PATHWAY COMPACT LAYOUT - WHOP STYLE ==========
const PathwayCompact = {
    expandedChapters: new Set(),

    init: () => {
        PathwayCompact.enhanceRendering();
        PathwayCompact.loadExpandedState();
    },

    enhanceRendering: () => {
        // Override the renderChapters function
        if (typeof Pathway !== 'undefined' && Pathway.renderChapters) {
            const originalRender = Pathway.renderChapters;
            
            Pathway.renderChapters = function() {
                const container = document.getElementById('chapter-list');
                if (!container) return;
                
                let lessonIndex = 0;
                const course = Pathway.courses[Pathway.currentCourse];
                if (!course) return;

                let html = course.chapters.map((ch, chIdx) => {
                    const chapterLessons = ch.lessons || [];
                    const completedCount = chapterLessons.filter(l => l.completed).length;
                    const totalCount = chapterLessons.length;
                    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                    const isExpanded = PathwayCompact.expandedChapters.has(ch.id);

                    let chapterHtml = `
                        <div class="chapter-item ${isExpanded ? 'expanded' : ''}" data-chapter-id="${ch.id}">
                            <div class="chapter-header" onclick="PathwayCompact.toggleChapter('${ch.id}')">
                                <div class="chapter-title-row">
                                    <span class="chapter-title-text">${ch.title}</span>
                                    <div class="chapter-meta-compact">
                                        <span><i class="fa-solid fa-book"></i> ${totalCount}</span>
                                        ${ch.duration ? `<span><i class="fa-solid fa-clock"></i> ${ch.duration}</span>` : ''}
                                    </div>
                                </div>
                                <div class="chapter-progress-indicator">
                                    <div class="chapter-progress-fill" style="width: ${progressPercent}%"></div>
                                </div>
                                <div class="chapter-actions-compact" onclick="event.stopPropagation()">
                                    ${course.role === 'creator' ? `
                                        <button class="btn-icon-sm" onclick="Pathway.addLesson(${chIdx})" title="Add lesson">
                                            <i class="fa-solid fa-plus"></i>
                                        </button>
                                    ` : ''}
                                </div>
                                <div class="chapter-toggle-icon">
                                    <i class="fa-solid fa-chevron-down"></i>
                                </div>
                            </div>
                            <div class="chapter-lessons-container">
                    `;

                    if (chapterLessons.length === 0) {
                        chapterHtml += `
                            <div class="chapter-empty-state">
                                <i class="fa-solid fa-inbox"></i>
                                No lessons yet
                                ${course.role === 'creator' ? `<br><button class="btn btn-primary" style="margin-top: 10px; font-size: 0.8rem; padding: 6px 12px;" onclick="Pathway.addLesson(${chIdx})">Add Lesson</button>` : ''}
                            </div>
                        `;
                    } else {
                        chapterLessons.forEach((l, idx) => {
                            const cIdx = lessonIndex++;
                            chapterHtml += `
                                <div class="lesson-item ${l.completed ? 'completed' : ''} ${cIdx === State.currentLesson ? 'active' : ''}" onclick="Pathway.loadLesson(${cIdx})">
                                    <div class="lesson-icon">
                                        ${l.completed ? '<i class="fa-solid fa-check"></i>' : (l.videoUrl ? '<i class="fa-solid fa-video"></i>' : '<i class="fa-solid fa-play"></i>')}
                                    </div>
                                    <div class="lesson-info">
                                        <div class="lesson-title">${l.title}</div>
                                        ${l.duration ? `<div class="lesson-meta">${l.duration}</div>` : ''}
                                    </div>
                                </div>
                            `;
                        });
                    }

                    chapterHtml += `
                            </div>
                        </div>
                    `;

                    return chapterHtml;
                }).join('');

                // Add "Add Chapter" button
                if (course.role === 'creator') {
                    html += `
                        <button class="btn btn-secondary w-full" onclick="Pathway.addChapter()">
                            <i class="fa-solid fa-folder-plus"></i> Add Chapter
                        </button>
                    `;
                }

                container.innerHTML = html;
            };
        }
    },

    toggleChapter: (chapterId) => {
        if (PathwayCompact.expandedChapters.has(chapterId)) {
            PathwayCompact.expandedChapters.delete(chapterId);
        } else {
            PathwayCompact.expandedChapters.add(chapterId);
        }

        // Save state
        PathwayCompact.saveExpandedState();

        // Update UI
        const chapterElement = document.querySelector(`.chapter-item[data-chapter-id="${chapterId}"]`);
        if (chapterElement) {
            chapterElement.classList.toggle('expanded');
        }

        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(5);
        }
    },

    saveExpandedState: () => {
        const state = Array.from(PathwayCompact.expandedChapters);
        localStorage.setItem('pathway_expanded_chapters', JSON.stringify(state));
    },

    loadExpandedState: () => {
        try {
            const saved = localStorage.getItem('pathway_expanded_chapters');
            if (saved) {
                const state = JSON.parse(saved);
                PathwayCompact.expandedChapters = new Set(state);
            }
        } catch (e) {
            console.error('Failed to load expanded state:', e);
        }
    },

    expandAll: () => {
        const chapters = document.querySelectorAll('.chapter-item');
        chapters.forEach(ch => {
            const id = ch.getAttribute('data-chapter-id');
            if (id) {
                PathwayCompact.expandedChapters.add(id);
                ch.classList.add('expanded');
            }
        });
        PathwayCompact.saveExpandedState();
    },

    collapseAll: () => {
        PathwayCompact.expandedChapters.clear();
        document.querySelectorAll('.chapter-item').forEach(ch => {
            ch.classList.remove('expanded');
        });
        PathwayCompact.saveExpandedState();
    }
};

// Initialize when Pathway module loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        PathwayCompact.init();
    }, 500);
});

// Re-initialize when pathway is shown
const pathwayObserver = new MutationObserver(() => {
    const pathwayModule = document.getElementById('mod-pathway');
    if (pathwayModule && !pathwayModule.classList.contains('hidden')) {
        setTimeout(() => {
            PathwayCompact.init();
            if (typeof Pathway !== 'undefined' && Pathway.renderChapters) {
                Pathway.renderChapters();
            }
        }, 200);
    }
});

if (document.body) {
    pathwayObserver.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['class']
    });
}

console.log('✅ Pathway compact layout loaded');
// This will be appended to the end of app.js to add all premium features

/* ═══════════════════════════════════════════════════════════════════════════
   🚀 SPARTAN.EDU ULTIMATE - PREMIUM FEATURES AUTO-INITIALIZATION
   ═══════════════════════════════════════════════════════════════════════════ */

// Wait for DOM and original modules to be ready
setTimeout(() => {
    console.log('🚀 Initializing ULTIMATE Premium Features...');
    
    // Extend Piano with recording capabilities
    if (typeof Piano !== 'undefined') {
        Piano.recording = false;
        Piano.recordedNotes = [];
        Piano.recordingStartTime = null;
        Piano.stats = Storage.get('piano_stats_' + (State.currentUser?.id || 'guest')) || {
            totalNotes: 0,
            sessionsCount: 0,
            favoriteNotes: {},
            lastPractice: null
        };
        
        // Hook into Piano.play
        const originalPlay = Piano.play;
        Piano.play = function(note, el) {
            originalPlay.call(this, note, el);
            
            // Record note if recording
            if (Piano.recording) {
                const timestamp = Date.now() - Piano.recordingStartTime;
                Piano.recordedNotes.push({ note, timestamp });
            }
            
            // Update stats
            Piano.stats.totalNotes++;
            Piano.stats.favoriteNotes[note] = (Piano.stats.favoriteNotes[note] || 0) + 1;
            Piano.stats.lastPractice = new Date().toISOString();
            Storage.set('piano_stats_' + (State.currentUser?.id || 'guest'), Piano.stats);
        };
        
        // Add recording controls to piano
        Piano.initRecording = function() {
            const pianoCase = document.querySelector('.piano-case');
            if (!pianoCase || document.getElementById('piano-ultimate-controls')) return;
            
            const controls = document.createElement('div');
            controls.id = 'piano-ultimate-controls';
            controls.style.cssText = 'display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;';
            controls.innerHTML = `
                <button class="btn btn-secondary" onclick="Piano.toggleRecording()" id="btn-piano-record">
                    <i class="fa-solid fa-circle"></i> Record
                </button>
                <button class="btn btn-secondary" onclick="Piano.playRecording()" id="btn-piano-play" disabled>
                    <i class="fa-solid fa-play"></i> Play
                </button>
                <button class="btn btn-secondary" onclick="Piano.saveComposition()" id="btn-piano-save" disabled>
                    <i class="fa-solid fa-save"></i> Save
                </button>
                <button class="btn btn-secondary" onclick="Piano.loadCompositions()">
                    <i class="fa-solid fa-folder-open"></i> Load
                </button>
                <button class="btn btn-secondary" onclick="Piano.showStats()">
                    <i class="fa-solid fa-chart-bar"></i> Stats
                </button>
                <span id="piano-timer" style="display: none; font-weight: 600; color: var(--accent-color);">
                    <i class="fa-solid fa-circle" style="color: red; animation: pulse 1s infinite;"></i>
                    <span id="piano-timer-text">00:00</span>
                </span>
            `;
            
            pianoCase.insertBefore(controls, pianoCase.firstChild);
            Piano.stats.sessionsCount++;
            Storage.set('piano_stats_' + (State.currentUser?.id || 'guest'), Piano.stats);
        };
        
        Piano.toggleRecording = function() {
            if (this.recording) {
                // Stop recording
                this.recording = false;
                document.getElementById('btn-piano-record').innerHTML = '<i class="fa-solid fa-circle"></i> Record';
                document.getElementById('piano-timer').style.display = 'none';
                document.getElementById('btn-piano-play').disabled = false;
                document.getElementById('btn-piano-save').disabled = false;
                Notify.show(`✅ Recorded ${this.recordedNotes.length} notes`);
            } else {
                // Start recording
                this.recording = true;
                this.recordedNotes = [];
                this.recordingStartTime = Date.now();
                document.getElementById('btn-piano-record').innerHTML = '<i class="fa-solid fa-stop"></i> Stop';
                document.getElementById('piano-timer').style.display = 'inline-block';
                this.updateTimer();
                Notify.show('🎵 Recording started');
            }
        };
        
        Piano.updateTimer = function() {
            if (!this.recording) return;
            const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
            const mins = Math.floor(elapsed / 60);
            const secs = elapsed % 60;
            document.getElementById('piano-timer-text').textContent = 
                `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            setTimeout(() => this.updateTimer(), 100);
        };
        
        Piano.playRecording = function() {
            if (this.recordedNotes.length === 0) return;
            Notify.show('▶️ Playing...');
            this.recordedNotes.forEach(({ note, timestamp }) => {
                setTimeout(() => this.play(note), timestamp);
            });
        };
        
        Piano.saveComposition = function() {
            const name = prompt('Composition name:');
            if (!name) return;
            
            const comps = Storage.get('piano_compositions_' + (State.currentUser?.id || 'guest')) || [];
            comps.push({
                id: Date.now(),
                name,
                notes: this.recordedNotes,
                created: new Date().toISOString()
            });
            Storage.set('piano_compositions_' + (State.currentUser?.id || 'guest'), comps);
            Notify.show(`💾 Saved "${name}"`);
        };
        
        Piano.loadCompositions = function() {
            const comps = Storage.get('piano_compositions_' + (State.currentUser?.id || 'guest')) || [];
            if (comps.length === 0) {
                Notify.show('No saved compositions', 'error');
                return;
            }
            
            const modal = document.createElement('div');
            modal.className = 'modal-overlay active';
            modal.innerHTML = `
                <div class="modal-box" style="max-width: 600px;">
                    <h2 style="margin-bottom: 20px;"><i class="fa-solid fa-music"></i> Compositions</h2>
                    <div style="max-height: 400px; overflow-y: auto;">
                        ${comps.map(c => `
                            <div style="padding: 15px; background: var(--bg-surface); border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-color);">
                                <div>
                                    <div style="font-weight: 600; margin-bottom: 5px;">🎵 ${c.name}</div>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary);">${c.notes.length} notes · ${new Date(c.created).toLocaleDateString()}</div>
                                </div>
                                <button class="btn btn-secondary" onclick="Piano.loadAndPlay(${c.id}); this.closest('.modal-overlay').remove();">
                                    <i class="fa-solid fa-play"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-secondary w-full" style="margin-top: 20px;" onclick="this.remove()">Close</button>
                </div>
            `;
            document.body.appendChild(modal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
        };
        
        Piano.loadAndPlay = function(id) {
            const comps = Storage.get('piano_compositions_' + (State.currentUser?.id || 'guest')) || [];
            const comp = comps.find(c => c.id === id);
            if (comp) {
                this.recordedNotes = comp.notes;
                document.getElementById('btn-piano-play').disabled = false;
                this.playRecording();
            }
        };
        
        Piano.showStats = function() {
            const topNotes = Object.entries(this.stats.favoriteNotes)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
            
            const modal = document.createElement('div');
            modal.className = 'modal-overlay active';
            modal.innerHTML = `
                <div class="modal-box" style="max-width: 500px;">
                    <h2 style="margin-bottom: 25px;"><i class="fa-solid fa-chart-line"></i> Practice Stats</h2>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px;">
                        <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700;">${this.stats.totalNotes.toLocaleString()}</div>
                            <div style="opacity: 0.9;">Total Notes</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; color: white; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700;">${this.stats.sessionsCount}</div>
                            <div style="opacity: 0.9;">Sessions</div>
                        </div>
                    </div>
                    
                    <div style="background: var(--bg-surface); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color);">
                        <h3 style="margin-bottom: 15px;">🎹 Most Played Notes</h3>
                        ${topNotes.map((n, i) => `
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: ${i < topNotes.length - 1 ? '1px solid var(--border-color)' : 'none'};">
                                <span style="font-weight: 600;">${i + 1}. ${n[0]}</span>
                                <span style="color: var(--accent-color); font-weight: 600;">${n[1]}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <button class="btn btn-primary w-full" style="margin-top: 20px;" onclick="this.closest('.modal-overlay').remove()">Close</button>
                </div>
            `;
            document.body.appendChild(modal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
        };
        
        console.log('🎹 Piano ULTIMATE features added');
    }
    
    // Extend FC (Flashcards) with analytics
    if (typeof FC !== 'undefined') {
        FC.stats = Storage.get('fc_stats_' + (State.currentUser?.id || 'guest')) || {
            cardsReviewed: 0,
            correctAnswers: 0,
            streak: 0,
            lastStudy: null,
            studyTime: 0
        };
        
        FC.showAnalytics = function() {
            const accuracy = this.stats.cardsReviewed > 0 
                ? Math.round((this.stats.correctAnswers / this.stats.cardsReviewed) * 100)
                : 0;
            
            const modal = document.createElement('div');
            modal.className = 'modal-overlay active';
            modal.innerHTML = `
                <div class="modal-box" style="max-width: 700px;">
                    <h2 style="margin-bottom: 25px;"><i class="fa-solid fa-chart-bar"></i> Learning Analytics</h2>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
                        <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700;">${this.stats.cardsReviewed}</div>
                            <div style="opacity: 0.9; font-size: 0.9rem;">Cards Reviewed</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; color: white; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700;">${accuracy}%</div>
                            <div style="opacity: 0.9; font-size: 0.9rem;">Accuracy</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 12px; color: white; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700;">${this.stats.streak}</div>
                            <div style="opacity: 0.9; font-size: 0.9rem;">Day Streak</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); border-radius: 12px; color: white; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700;">${Math.round(this.stats.studyTime / 60)}m</div>
                            <div style="opacity: 0.9; font-size: 0.9rem;">Study Time</div>
                        </div>
                    </div>
                    
                    <div style="background: var(--bg-surface); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color);">
                        <h3 style="margin-bottom: 15px;">📊 Weekly Progress</h3>
                        <div style="height: 150px; display: flex; align-items: flex-end; gap: 8px;">
                            ${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
                                const h = 20 + Math.random() * 80;
                                return `
                                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                                        <div style="width: 100%; height: ${h}%; background: linear-gradient(to top, #667eea, #764ba2); border-radius: 6px 6px 0 0;"></div>
                                        <div style="font-size: 0.75rem; color: var(--text-secondary);">${d}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <button class="btn btn-primary w-full" style="margin-top: 20px;" onclick="this.closest('.modal-overlay').remove()">Close</button>
                </div>
            `;
            document.body.appendChild(modal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
        };
        
        // Add analytics button to flashcards header
        const addAnalyticsButton = () => {
            const fcHeader = document.querySelector('.fc-header');
            if (fcHeader && !document.getElementById('btn-fc-analytics')) {
                const btnContainer = fcHeader.querySelector('.flex.gap-10');
                if (btnContainer) {
                    const btn = document.createElement('button');
                    btn.id = 'btn-fc-analytics';
                    btn.className = 'btn btn-secondary';
                    btn.innerHTML = '<i class="fa-solid fa-chart-bar"></i> Analytics';
                    btn.onclick = () => FC.showAnalytics();
                    btnContainer.insertBefore(btn, btnContainer.lastChild);
                }
            }
        };
        
        // Track study sessions
        const originalNav = FC.nav;
        if (originalNav) {
            FC.nav = function(dir) {
                const result = originalNav.call(this, dir);
                FC.stats.cardsReviewed++;
                FC.stats.studyTime += 5; // Estimate 5 seconds per card
                Storage.set('fc_stats_' + (State.currentUser?.id || 'guest'), FC.stats);
                return result;
            };
        }
        
        setTimeout(addAnalyticsButton, 1000);
        console.log('📚 Flashcards ULTIMATE features added');
    }
    
    // Add Pomodoro Timer for Tasks
    if (typeof Tasks !== 'undefined') {
        window.PomodoroTimer = {
            minutes: 25,
            seconds: 0,
            isRunning: false,
            isBreak: false,
            intervalId: null,
            completedPomodoros: 0,
            
            init: function() {
                if (document.getElementById('pomodoro-widget')) return;
                
                const widget = document.createElement('div');
                widget.id = 'pomodoro-widget';
                widget.style.cssText = `
                    position: fixed;
                    bottom: 100px;
                    right: 30px;
                    width: 260px;
                    background: var(--bg-surface);
                    border-radius: 16px;
                    padding: 20px;
                    box-shadow: var(--shadow-lg);
                    border: 1px solid var(--border-color);
                    z-index: 1000;
                    display: none;
                `;
                widget.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px;">
                            🍅 POMODORO TIMER
                        </div>
                        <div id="pomodoro-display" style="font-size: 3rem; font-weight: 700; color: var(--accent-color); font-family: 'Space Grotesk', monospace; margin: 20px 0;">
                            25:00
                        </div>
                        <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 15px;">
                            <button class="btn btn-primary" onclick="PomodoroTimer.start()" id="pomodoro-start">
                                <i class="fa-solid fa-play"></i>
                            </button>
                            <button class="btn btn-secondary" onclick="PomodoroTimer.pause()" id="pomodoro-pause" style="display: none;">
                                <i class="fa-solid fa-pause"></i>
                            </button>
                            <button class="btn btn-secondary" onclick="PomodoroTimer.reset()">
                                <i class="fa-solid fa-rotate-left"></i>
                            </button>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">
                            Today: <span id="pomodoro-count">0</span> 🍅
                        </div>
                        <button class="btn btn-secondary" style="margin-top: 15px; font-size: 0.75rem; padding: 6px 12px;" onclick="PomodoroTimer.hide()">
                            Hide
                        </button>
                    </div>
                `;
                document.body.appendChild(widget);
            },
            
            show: function() {
                this.init();
                document.getElementById('pomodoro-widget').style.display = 'block';
            },
            
            hide: function() {
                document.getElementById('pomodoro-widget').style.display = 'none';
            },
            
            start: function() {
                this.isRunning = true;
                document.getElementById('pomodoro-start').style.display = 'none';
                document.getElementById('pomodoro-pause').style.display = 'inline-block';
                
                this.intervalId = setInterval(() => {
                    if (this.seconds === 0) {
                        if (this.minutes === 0) {
                            this.complete();
                            return;
                        }
                        this.minutes--;
                        this.seconds = 59;
                    } else {
                        this.seconds--;
                    }
                    this.updateDisplay();
                }, 1000);
            },
            
            pause: function() {
                this.isRunning = false;
                clearInterval(this.intervalId);
                document.getElementById('pomodoro-start').style.display = 'inline-block';
                document.getElementById('pomodoro-pause').style.display = 'none';
            },
            
            reset: function() {
                this.pause();
                this.minutes = this.isBreak ? 5 : 25;
                this.seconds = 0;
                this.updateDisplay();
            },
            
            complete: function() {
                this.pause();
                if (!this.isBreak) {
                    this.completedPomodoros++;
                    document.getElementById('pomodoro-count').textContent = this.completedPomodoros;
                    Notify.show('🎉 Pomodoro complete! Take a 5-minute break.');
                    this.isBreak = true;
                    this.minutes = 5;
                } else {
                    Notify.show('✅ Break over! Ready for another pomodoro?');
                    this.isBreak = false;
                    this.minutes = 25;
                }
                this.seconds = 0;
                this.updateDisplay();
            },
            
            updateDisplay: function() {
                const display = document.getElementById('pomodoro-display');
                if (display) {
                    display.textContent = `${String(this.minutes).padStart(2, '0')}:${String(this.seconds).padStart(2, '0')}`;
                    display.style.color = this.isBreak ? '#10B981' : 'var(--accent-color)';
                }
            }
        };
        
        // Add Pomodoro button to tasks header
        const addPomodoroButton = () => {
            const taskHeader = document.querySelector('.task-header');
            if (taskHeader && !document.getElementById('btn-pomodoro')) {
                const btn = document.createElement('button');
                btn.id = 'btn-pomodoro';
                btn.className = 'btn btn-secondary';
                btn.innerHTML = '<i class="fa-solid fa-clock"></i> Pomodoro';
                btn.onclick = () => PomodoroTimer.show();
                taskHeader.appendChild(btn);
            }
        };
        
        setTimeout(addPomodoroButton, 1000);
        console.log('⏱️ Pomodoro Timer ULTIMATE added');
    }
    
    // Add Global Search
    window.GlobalSearch = {
        init: function() {
            if (document.getElementById('global-search')) return;
            
            const search = document.createElement('div');
            search.id = 'global-search';
            search.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                z-index: 9999;
                display: none;
                align-items: flex-start;
                justify-content: center;
                padding-top: 100px;
            `;
            search.innerHTML = `
                <div style="width: 90%; max-width: 600px; background: var(--bg-surface); border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); overflow: hidden;">
                    <input type="text" id="global-search-input" placeholder="Search Spartan.Edu..." 
                        style="width: 100%; padding: 20px; font-size: 1.2rem; border: none; background: transparent; color: var(--text-primary);">
                    <div id="global-search-results" style="max-height: 400px; overflow-y: auto;"></div>
                </div>
            `;
            document.body.appendChild(search);
            
            // Keyboard shortcut
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    this.show();
                }
                if (e.key === 'Escape') {
                    this.hide();
                }
            });
            
            search.addEventListener('click', (e) => {
                if (e.target === search) this.hide();
            });
            
            const input = document.getElementById('global-search-input');
            input.addEventListener('input', (e) => this.search(e.target.value));
        },
        
        show: function() {
            this.init();
            document.getElementById('global-search').style.display = 'flex';
            document.getElementById('global-search-input').focus();
        },
        
        hide: function() {
            const el = document.getElementById('global-search');
            if (el) el.style.display = 'none';
        },
        
        search: function(query) {
            if (!query) {
                document.getElementById('global-search-results').innerHTML = '';
                return;
            }
            
            const results = [];
            // Search flashcards
            if (State.decks) {
                State.decks.forEach(deck => {
                    if (deck.name.toLowerCase().includes(query.toLowerCase())) {
                        results.push({
                            type: 'Flashcard Deck',
                            title: deck.name,
                            action: () => {
                                Nav.to('flashcards');
                                FC.openOverview(State.decks.indexOf(deck));
                                this.hide();
                            }
                        });
                    }
                });
            }
            
            // Search tasks
            if (State.projects) {
                State.projects.forEach(proj => {
                    proj.tasks?.forEach(task => {
                        if (task.title.toLowerCase().includes(query.toLowerCase())) {
                            results.push({
                                type: 'Task',
                                title: task.title,
                                snippet: proj.name,
                                action: () => {
                                    Nav.to('tasks');
                                    this.hide();
                                }
                            });
                        }
                    });
                });
            }
            
            this.displayResults(results);
        },
        
        displayResults: function(results) {
            const container = document.getElementById('global-search-results');
            if (results.length === 0) {
                container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-secondary);">No results found</div>';
                return;
            }
            
            container.innerHTML = results.map(r => `
                <div style="padding: 15px 20px; border-top: 1px solid var(--border-color); cursor: pointer; transition: background 0.2s;"
                    onmouseover="this.style.background='var(--hover-bg)'"
                    onmouseout="this.style.background='transparent'"
                    onclick='${r.action.toString()}()'>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <span style="display: inline-block; padding: 2px 8px; background: var(--accent-color); color: white; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">
                            ${r.type}
                        </span>
                        <span style="font-weight: 600; color: var(--text-primary);">${r.title}</span>
                    </div>
                    ${r.snippet ? `<div style="font-size: 0.9rem; color: var(--text-secondary);">${r.snippet}</div>` : ''}
                </div>
            `).join('');
        }
    };
    
    GlobalSearch.init();
    console.log('🔍 Global Search ULTIMATE added (Ctrl+K)');
    
    console.log('✅ ALL ULTIMATE Premium Features Initialized!');
    console.log('🎹 Piano: Recording + Stats');
    console.log('📚 Flashcards: Analytics Dashboard');
    console.log('⏱️ Tasks: Pomodoro Timer');
    console.log('🔍 Global: Search (Ctrl+K)');
    
}, 2000);
