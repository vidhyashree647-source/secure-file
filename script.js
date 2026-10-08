/**
 * SecureShare LAN - Core Application JavaScript
 * Professional LAN File Sharing & Management System Prototype
 */

(function () {
    'use strict';

    // ==========================================
    // 1. DATA SEEDING & LOCAL STORAGE MANAGER
    // ==========================================
    const DEFAULT_SETTINGS = {
        deviceName: 'Host-Node-Alpha',
        port: 8080,
        storageLimitGB: 10,
        defaultProtection: 'public'
    };

    const DEFAULT_FILES = [
        {
            id: 'file_seed_1',
            name: 'Network_Topology_Diagram.pdf',
            size: 2457600, // 2.4 MB
            type: 'application/pdf',
            category: 'document',
            uploadTime: new Date(Date.now() - 3600000 * 2).toISOString(),
            sender: 'Host-Node-Alpha (192.168.1.104)',
            access: 'public',
            password: '',
            downloads: 8,
            contentData: 'data:application/pdf;base64,JVBERi0xLjQKJSDl4uXkc2Ry...' // Simulated sample data
        },
        {
            id: 'file_seed_2',
            name: 'LAN_Security_Audit_Report.docx',
            size: 1548288, // 1.5 MB
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            category: 'document',
            uploadTime: new Date(Date.now() - 3600000 * 5).toISOString(),
            sender: 'Node-Beta (192.168.1.112)',
            access: 'protected',
            password: 'admin',
            downloads: 3,
            contentData: 'data:text/plain;base64,U2VjdXJlU2hhcmUgTEFOIFNlY3VyaXR5IFJlcG9ydA=='
        },
        {
            id: 'file_seed_3',
            name: 'Infrastructure_Overview.png',
            size: 4823449, // 4.6 MB
            type: 'image/png',
            category: 'image',
            uploadTime: new Date(Date.now() - 3600000 * 12).toISOString(),
            sender: 'Host-Node-Alpha (192.168.1.104)',
            access: 'public',
            password: '',
            downloads: 14,
            contentData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        },
        {
            id: 'file_seed_4',
            name: 'Database_Backup_v4.2.sql',
            size: 14680064, // 14 MB
            type: 'text/x-sql',
            category: 'other',
            uploadTime: new Date(Date.now() - 3600000 * 24).toISOString(),
            sender: 'Node-Gamma (192.168.1.108)',
            access: 'protected',
            password: 'pass',
            downloads: 1,
            contentData: 'data:text/plain;base64,Q1JFQVRFIFRBQkxFIHNhbXBsZSAoaWQgaW50KTs='
        }
    ];

    const DEFAULT_LOGS = [
        { id: 'log_1', type: 'security', title: 'System Security Check', detail: 'Subnet scan completed - 0 threats detected', node: 'System Audit', time: new Date(Date.now() - 1800000).toISOString(), status: 'pass' },
        { id: 'log_2', type: 'upload', title: 'File Uploaded', detail: 'Network_Topology_Diagram.pdf shared to LAN', node: '192.168.1.104', time: new Date(Date.now() - 3600000 * 2).toISOString(), status: 'info' },
        { id: 'log_3', type: 'download', title: 'File Downloaded', detail: 'Infrastructure_Overview.png downloaded by Node-Beta', node: '192.168.1.112', time: new Date(Date.now() - 3600000 * 3).toISOString(), status: 'success' },
        { id: 'log_4', type: 'link', title: 'Secure Link Created', detail: 'Passcode link created for LAN_Security_Audit_Report.docx', node: '192.168.1.104', time: new Date(Date.now() - 3600000 * 5).toISOString(), status: 'info' }
    ];

    const StorageManager = {
        getFiles: function () {
            const data = localStorage.getItem('secureshare_files');
            if (!data) {
                this.saveFiles(DEFAULT_FILES);
                return DEFAULT_FILES;
            }
            try { return JSON.parse(data); } catch (e) { return DEFAULT_FILES; }
        },
        saveFiles: function (files) {
            localStorage.setItem('secureshare_files', JSON.stringify(files));
        },
        getLogs: function () {
            const data = localStorage.getItem('secureshare_logs');
            if (!data) {
                this.saveLogs(DEFAULT_LOGS);
                return DEFAULT_LOGS;
            }
            try { return JSON.parse(data); } catch (e) { return DEFAULT_LOGS; }
        },
        saveLogs: function (logs) {
            localStorage.setItem('secureshare_logs', JSON.stringify(logs));
        },
        addLog: function (type, title, detail, node = 'Local Node', status = 'info') {
            const logs = this.getLogs();
            const newLog = {
                id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                type: type,
                title: title,
                detail: detail,
                node: node,
                time: new Date().toISOString(),
                status: status
            };
            logs.unshift(newLog);
            if (logs.length > 50) logs.pop(); // keep last 50
            this.saveLogs(logs);
            return newLog;
        },
        getSettings: function () {
            const data = localStorage.getItem('secureshare_settings');
            if (!data) {
                this.saveSettings(DEFAULT_SETTINGS);
                return DEFAULT_SETTINGS;
            }
            try { return JSON.parse(data); } catch (e) { return DEFAULT_SETTINGS; }
        },
        saveSettings: function (settings) {
            localStorage.setItem('secureshare_settings', JSON.stringify(settings));
        },
        clearAll: function () {
            localStorage.removeItem('secureshare_files');
            localStorage.removeItem('secureshare_logs');
            localStorage.removeItem('secureshare_settings');
        }
    };

    // ==========================================
    // 2. TOAST NOTIFICATION SYSTEM
    // ==========================================
    const ToastNotifier = {
        show: function (type, title, message) {
            const container = document.getElementById('toast-container');
            if (!container) return;

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;

            let iconSymbol = 'ℹ';
            if (type === 'success') iconSymbol = '✓';
            if (type === 'error') iconSymbol = '✕';
            if (type === 'warning') iconSymbol = '⚠';

            toast.innerHTML = `
                <div class="toast-icon">${iconSymbol}</div>
                <div class="toast-content">
                    <div class="toast-title">${escapeHTML(title)}</div>
                    <div class="toast-message">${escapeHTML(message)}</div>
                </div>
                <button class="toast-close">&times;</button>
            `;

            toast.querySelector('.toast-close').addEventListener('click', () => {
                toast.style.animation = 'toastSlideIn 0.2s reverse forwards';
                setTimeout(() => toast.remove(), 200);
            });

            container.appendChild(toast);

            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.animation = 'toastSlideIn 0.2s reverse forwards';
                    setTimeout(() => toast.remove(), 200);
                }
            }, 4500);
        }
    };

    // ==========================================
    // 3. UTILITY FUNCTIONS
    // ==========================================
    function escapeHTML(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function formatDate(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function getFileCategory(mimeOrExt) {
        const str = mimeOrExt.toLowerCase();
        if (str.includes('pdf') || str.includes('doc') || str.includes('text') || str.includes('txt') || str.includes('xls') || str.includes('ppt')) return 'document';
        if (str.includes('image') || str.includes('png') || str.includes('jpg') || str.includes('jpeg') || str.includes('svg') || str.includes('gif')) return 'image';
        if (str.includes('video') || str.includes('mp4') || str.includes('mkv') || str.includes('avi') || str.includes('mov')) return 'video';
        if (str.includes('audio') || str.includes('mp3') || str.includes('wav') || str.includes('ogg')) return 'audio';
        return 'other';
    }

    function getFileIconClass(category) {
        switch (category) {
            case 'document': return 'type-doc';
            case 'image': return 'type-image';
            case 'video': return 'type-video';
            case 'audio': return 'type-audio';
            default: return 'type-other';
        }
    }

    function getFileExtBadge(filename) {
        const parts = filename.split('.');
        if (parts.length > 1) return parts.pop().toUpperCase();
        return 'FILE';
    }

    // ==========================================
    // 4. MAIN APP CONTROLLER
    // ==========================================
    const LANShareApp = {
        files: [],
        logs: [],
        settings: {},
        currentView: 'dashboard',
        pendingDownloadFileId: null,
        activeShareFileId: null,
        uploadQueue: [],
        failedPasswordAttempts: 0,

        init: function () {
            this.loadState();
            this.setupTheme();
            this.bindNavigation();
            this.bindGlobalEvents();
            this.bindUploadEvents();
            this.bindModalEvents();
            this.bindSecurityEvents();
            this.bindSettingsEvents();

            this.renderAll();
            
            // Periodically fluctuate connected LAN peer count slightly to simulate active LAN mesh
            setInterval(() => {
                const peerElem = document.getElementById('stat-connected-peers');
                if (peerElem) {
                    const peers = Math.floor(Math.random() * 3) + 3; // 3 to 5
                    peerElem.textContent = `${peers} Active`;
                }
            }, 12000);
        },

        loadState: function () {
            this.files = StorageManager.getFiles();
            this.logs = StorageManager.getLogs();
            this.settings = StorageManager.getSettings();
        },

        setupTheme: function () {
            const savedTheme = localStorage.getItem('secureshare_theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);

            const themeBtn = document.getElementById('theme-toggle-btn');
            if (themeBtn) {
                themeBtn.addEventListener('click', () => {
                    const current = document.documentElement.getAttribute('data-theme');
                    const next = current === 'dark' ? 'light' : 'dark';
                    document.documentElement.setAttribute('data-theme', next);
                    localStorage.setItem('secureshare_theme', next);
                    ToastNotifier.show('info', 'Theme Switch', `Activated ${next.toUpperCase()} interface mode.`);
                });
            }
        },

        // --- Navigation ---
        bindNavigation: function () {
            const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
            const viewSections = document.querySelectorAll('.content-view');

            const switchView = (targetView) => {
                this.currentView = targetView;

                navItems.forEach(item => {
                    if (item.getAttribute('data-view') === targetView) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });

                viewSections.forEach(section => {
                    if (section.id === `view-${targetView}`) {
                        section.classList.add('active');
                    } else {
                        section.classList.remove('active');
                    }
                });

                // Update Top Header Page Titles
                const pageTitle = document.getElementById('page-title');
                const pageSubtitle = document.getElementById('page-subtitle');
                
                const titles = {
                    'dashboard': { title: 'Dashboard Overview', subtitle: 'Real-time LAN node monitoring and file management' },
                    'shared-files': { title: 'Shared LAN Files', subtitle: 'Browse, search, and manage secure file shares across LAN peers' },
                    'upload': { title: 'File Upload Zone', subtitle: 'Drag & drop or browse files for instantaneous local sharing' },
                    'security': { title: 'Security & Encryption Panel', subtitle: 'Audit network isolation, password hashes, and encryption status' },
                    'activity': { title: 'Audit Trail & Activity Log', subtitle: 'Comprehensive timestamped security and transfer log' },
                    'settings': { title: 'Node Settings & Architecture', subtitle: 'Configure LAN parameters and inspect system backend hooks' }
                };

                if (titles[targetView]) {
                    pageTitle.textContent = titles[targetView].title;
                    pageSubtitle.textContent = titles[targetView].subtitle;
                }

                this.renderAll();
            };

            navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const view = item.getAttribute('data-view');
                    switchView(view);
                });
            });

            // Delegate buttons with class switch-view-btn
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('.switch-view-btn');
                if (btn) {
                    const target = btn.getAttribute('data-target');
                    if (target) switchView(target);
                }
            });

            // Quick Upload header button
            const headerUploadBtn = document.getElementById('header-quick-upload-btn');
            if (headerUploadBtn) {
                headerUploadBtn.addEventListener('click', () => switchView('upload'));
            }
        },

        bindGlobalEvents: function () {
            // Global & Local Search
            const globalSearch = document.getElementById('global-search-input');
            const fileSearch = document.getElementById('file-search-input');

            const handleSearch = (query) => {
                if (this.currentView !== 'shared-files') {
                    const navFiles = document.querySelector('[data-view="shared-files"]');
                    if (navFiles) navFiles.click();
                }
                if (fileSearch) fileSearch.value = query;
                this.renderSharedFiles();
            };

            if (globalSearch) {
                globalSearch.addEventListener('input', (e) => handleSearch(e.target.value));
            }
            if (fileSearch) {
                fileSearch.addEventListener('input', () => this.renderSharedFiles());
            }

            // Category & Access Filters
            const filterCategory = document.getElementById('filter-category');
            const filterAccess = document.getElementById('filter-access');

            if (filterCategory) filterCategory.addEventListener('change', () => this.renderSharedFiles());
            if (filterAccess) filterAccess.addEventListener('change', () => this.renderSharedFiles());

            // View Toggle (Grid vs Table)
            const btnGrid = document.getElementById('btn-view-grid');
            const btnTable = document.getElementById('btn-view-table');

            if (btnGrid && btnTable) {
                btnGrid.addEventListener('click', () => {
                    btnGrid.classList.add('active');
                    btnTable.classList.remove('active');
                    document.getElementById('files-grid-container').classList.remove('hidden');
                    document.getElementById('files-table-container').classList.add('hidden');
                });

                btnTable.addEventListener('click', () => {
                    btnTable.classList.add('active');
                    btnGrid.classList.remove('active');
                    document.getElementById('files-table-container').classList.remove('hidden');
                    document.getElementById('files-grid-container').classList.add('hidden');
                });
            }
        },

        // --- Render Functions ---
        renderAll: function () {
            this.renderHeaderAndSidebar();
            this.renderDashboard();
            this.renderSharedFiles();
            this.renderActivityLog();
            this.renderSecurityPanel();
        },

        renderHeaderAndSidebar: function () {
            const countElem = document.getElementById('nav-file-count');
            if (countElem) countElem.textContent = this.files.length;

            const sidebarIp = document.getElementById('sidebar-ip');
            if (sidebarIp) sidebarIp.textContent = '192.168.1.104';

            const nodeNameElem = document.getElementById('device-node-name');
            if (nodeNameElem) nodeNameElem.textContent = this.settings.deviceName || 'Host-Node-Alpha';
        },

        renderDashboard: function () {
            // Stats calculation
            const totalFiles = this.files.length;
            const totalBytes = this.files.reduce((acc, f) => acc + (f.size || 0), 0);
            const limitBytes = (this.settings.storageLimitGB || 10) * 1073741824;
            const storagePercent = Math.min(100, ((totalBytes / limitBytes) * 100).toFixed(1));

            const totalFilesElem = document.getElementById('stat-total-files');
            if (totalFilesElem) totalFilesElem.textContent = totalFiles;

            const storageUsedElem = document.getElementById('stat-storage-used');
            if (storageUsedElem) storageUsedElem.textContent = formatBytes(totalBytes);

            const storageBarElem = document.getElementById('stat-storage-bar');
            if (storageBarElem) storageBarElem.style.width = `${storagePercent}%`;

            const storageTextElem = document.getElementById('stat-storage-text');
            if (storageTextElem) storageTextElem.textContent = `${formatBytes(totalBytes)} / ${this.settings.storageLimitGB || 10} GB (${storagePercent}%)`;

            // Network Card Details
            const netIp = document.getElementById('net-ip');
            if (netIp) netIp.textContent = '192.168.1.104';
            const netPort = document.getElementById('net-port');
            if (netPort) netPort.textContent = `${this.settings.port || 8080} (HTTPS/WSS)`;

            // Render Recent 4 Files Table
            const recentBody = document.getElementById('recent-files-body');
            if (recentBody) {
                recentBody.innerHTML = '';
                const sorted = [...this.files].sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime)).slice(0, 4);

                if (sorted.length === 0) {
                    recentBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">No shared files available.</td></tr>`;
                } else {
                    sorted.forEach(file => {
                        const tr = document.createElement('tr');
                        const iconClass = getFileIconClass(file.category);
                        const extBadge = getFileExtBadge(file.name);
                        const isProtected = file.access === 'protected';

                        tr.innerHTML = `
                            <td>
                                <div class="file-name-cell">
                                    <div class="file-icon-badge ${iconClass}">${extBadge}</div>
                                    <span>${escapeHTML(file.name)}</span>
                                </div>
                            </td>
                            <td><span class="badge badge-info">${file.category}</span></td>
                            <td>${formatBytes(file.size)}</td>
                            <td><span class="badge ${isProtected ? 'badge-protected' : 'badge-public'}">${isProtected ? '🔒 Protected' : '🌐 Public'}</span></td>
                            <td>
                                <button class="btn btn-sm btn-ghost download-file-btn" data-id="${file.id}">Download</button>
                            </td>
                        `;
                        recentBody.appendChild(tr);
                    });
                }
            }

            // Render Recent Mini Activity Feed
            const miniActivityFeed = document.getElementById('dashboard-activity-feed');
            if (miniActivityFeed) {
                miniActivityFeed.innerHTML = '';
                const recentLogs = this.logs.slice(0, 5);

                if (recentLogs.length === 0) {
                    miniActivityFeed.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted);">No activity recorded yet.</p>`;
                } else {
                    recentLogs.forEach(log => {
                        const item = document.createElement('div');
                        item.className = 'act-item-mini';
                        item.innerHTML = `
                            <div class="act-dot ${log.type}"></div>
                            <div class="act-details">
                                <span class="act-text">${escapeHTML(log.title)}: ${escapeHTML(log.detail)}</span>
                                <span class="act-time">${formatDate(log.time)} • ${escapeHTML(log.node)}</span>
                            </div>
                        `;
                        miniActivityFeed.appendChild(item);
                    });
                }
            }

            // Attach dynamic event listeners for download buttons in dashboard
            document.querySelectorAll('.download-file-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    this.initiateDownload(id);
                });
            });
        },

        renderSharedFiles: function () {
            const gridContainer = document.getElementById('files-grid-container');
            const tableBody = document.getElementById('files-table-body');
            const placeholder = document.getElementById('no-files-placeholder');
            const tableCard = document.getElementById('files-table-container');

            const searchQuery = (document.getElementById('file-search-input')?.value || '').toLowerCase().trim();
            const categoryFilter = document.getElementById('filter-category')?.value || 'all';
            const accessFilter = document.getElementById('filter-access')?.value || 'all';

            // Filter logic
            const filtered = this.files.filter(file => {
                const matchesName = file.name.toLowerCase().includes(searchQuery);
                const matchesCategory = categoryFilter === 'all' || file.category === categoryFilter;
                const matchesAccess = accessFilter === 'all' || file.access === accessFilter;
                return matchesName && matchesCategory && matchesAccess;
            });

            if (filtered.length === 0) {
                if (gridContainer) gridContainer.classList.add('hidden');
                if (tableCard) tableCard.classList.add('hidden');
                if (placeholder) placeholder.classList.remove('hidden');
                return;
            }

            if (placeholder) placeholder.classList.add('hidden');
            const isGridActive = document.getElementById('btn-view-grid')?.classList.contains('active');

            if (isGridActive) {
                if (gridContainer) gridContainer.classList.remove('hidden');
                if (tableCard) tableCard.classList.add('hidden');
            } else {
                if (tableCard) tableCard.classList.remove('hidden');
                if (gridContainer) gridContainer.classList.add('hidden');
            }

            // 1. Render Grid Cards
            if (gridContainer) {
                gridContainer.innerHTML = '';
                filtered.forEach(file => {
                    const card = document.createElement('div');
                    card.className = 'file-card glass-card';
                    const iconClass = getFileIconClass(file.category);
                    const extBadge = getFileExtBadge(file.name);
                    const isProtected = file.access === 'protected';

                    card.innerHTML = `
                        <div class="file-card-top">
                            <div class="file-icon-badge ${iconClass}">${extBadge}</div>
                            <span class="badge ${isProtected ? 'badge-protected' : 'badge-public'}">
                                ${isProtected ? '🔒 Passcode' : '🌐 Public'}
                            </span>
                        </div>
                        <h4 class="file-card-title" title="${escapeHTML(file.name)}">${escapeHTML(file.name)}</h4>
                        <div class="file-card-meta">
                            <span>${formatBytes(file.size)}</span> • 
                            <span>${formatDate(file.uploadTime)}</span>
                        </div>
                        <div class="file-card-details">
                            <div><strong>Sender:</strong> ${escapeHTML(file.sender)}</div>
                            <div><strong>Downloads:</strong> ${file.downloads || 0} times</div>
                        </div>
                        <div class="file-card-actions">
                            <button class="btn btn-primary btn-sm action-dl-btn" data-id="${file.id}">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="8 17 12 21 16 17"/>
                                    <line x1="12" y1="12" x2="12" y2="21"/>
                                    <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/>
                                </svg>
                                <span>Download</span>
                            </button>
                            <button class="icon-action-btn action-share-btn" data-id="${file.id}" title="Generate Secure Link">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                                </svg>
                            </button>
                            <button class="icon-action-btn delete-btn action-delete-btn" data-id="${file.id}" title="Delete File">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </button>
                        </div>
                    `;
                    gridContainer.appendChild(card);
                });
            }

            // 2. Render Table View
            if (tableBody) {
                tableBody.innerHTML = '';
                filtered.forEach(file => {
                    const tr = document.createElement('tr');
                    const iconClass = getFileIconClass(file.category);
                    const extBadge = getFileExtBadge(file.name);
                    const isProtected = file.access === 'protected';

                    tr.innerHTML = `
                        <td>
                            <div class="file-name-cell">
                                <div class="file-icon-badge ${iconClass}">${extBadge}</div>
                                <span>${escapeHTML(file.name)}</span>
                            </div>
                        </td>
                        <td><span class="badge badge-info">${file.category}</span></td>
                        <td>${formatBytes(file.size)}</td>
                        <td>${formatDate(file.uploadTime)}</td>
                        <td>${escapeHTML(file.sender)}</td>
                        <td><span class="badge ${isProtected ? 'badge-protected' : 'badge-public'}">${isProtected ? '🔒 Protected' : '🌐 Public'}</span></td>
                        <td class="text-right">
                            <div style="display:inline-flex; gap:6px;">
                                <button class="btn btn-sm btn-primary action-dl-btn" data-id="${file.id}">Download</button>
                                <button class="icon-action-btn action-share-btn" data-id="${file.id}" title="Secure Link">🔗</button>
                                <button class="icon-action-btn delete-btn action-delete-btn" data-id="${file.id}" title="Delete">🗑</button>
                            </div>
                        </td>
                    `;
                    tableBody.appendChild(tr);
                });
            }

            // Re-bind Action Listeners for Grid/Table elements
            document.querySelectorAll('.action-dl-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.initiateDownload(e.currentTarget.getAttribute('data-id')));
            });

            document.querySelectorAll('.action-share-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.openShareModal(e.currentTarget.getAttribute('data-id')));
            });

            document.querySelectorAll('.action-delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.deleteFile(e.currentTarget.getAttribute('data-id')));
            });
        },

        renderActivityLog: function () {
            const body = document.getElementById('activity-log-body');
            if (!body) return;
            body.innerHTML = '';

            const activeFilter = document.querySelector('.activity-filters .chip.active')?.getAttribute('data-log-filter') || 'all';

            const filteredLogs = this.logs.filter(log => {
                if (activeFilter === 'all') return true;
                return log.type === activeFilter;
            });

            if (filteredLogs.length === 0) {
                body.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">No activity logs match the selected filter.</td></tr>`;
                return;
            }

            filteredLogs.forEach(log => {
                const tr = document.createElement('tr');
                let badgeClass = 'badge-info';
                if (log.status === 'pass' || log.status === 'success') badgeClass = 'badge-success';
                if (log.status === 'warning') badgeClass = 'badge-warning';
                if (log.status === 'error') badgeClass = 'badge-protected';

                tr.innerHTML = `
                    <td><span class="badge ${badgeClass}">${escapeHTML(log.type.toUpperCase())}</span></td>
                    <td><strong>${escapeHTML(log.title)}:</strong> ${escapeHTML(log.detail)}</td>
                    <td><code>${escapeHTML(log.node)}</code></td>
                    <td>${formatDate(log.time)}</td>
                    <td><span class="badge ${badgeClass}">${escapeHTML((log.status || 'OK').toUpperCase())}</span></td>
                `;
                body.appendChild(tr);
            });
        },

        renderSecurityPanel: function () {
            const failedElem = document.getElementById('sec-failed-attempts');
            if (failedElem) failedElem.textContent = this.failedPasswordAttempts;
        },

        // --- File Download Logic ---
        initiateDownload: function (fileId) {
            const file = this.files.find(f => f.id === fileId);
            if (!file) {
                ToastNotifier.show('error', 'Download Failed', 'Target file was not found on this LAN node.');
                return;
            }

            if (file.access === 'protected') {
                this.pendingDownloadFileId = fileId;
                const promptModal = document.getElementById('modal-password-prompt');
                const passInput = document.getElementById('prompt-passcode-input');
                const errMsg = document.getElementById('prompt-error-msg');
                if (passInput) passInput.value = '';
                if (errMsg) errMsg.classList.add('hidden');
                if (promptModal) promptModal.classList.remove('hidden');
            } else {
                this.executeDownload(file);
            }
        },

        executeDownload: function (file) {
            // Increment download count
            file.downloads = (file.downloads || 0) + 1;
            StorageManager.saveFiles(this.files);

            // Create download anchor
            const content = file.contentData || 'data:text/plain;charset=utf-8,' + encodeURIComponent('Simulated LAN Content for ' + file.name);
            const a = document.createElement('a');
            a.href = content;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Log activity & Toast
            StorageManager.addLog('download', 'File Downloaded', `${file.name} downloaded successfully`, '192.168.1.104', 'success');
            ToastNotifier.show('success', 'Download Started', `Downloading ${file.name} over LAN...`);

            this.loadState();
            this.renderAll();
        },

        // --- File Upload Logic ---
        bindUploadEvents: function () {
            const dropZone = document.getElementById('drop-zone');
            const fileInput = document.getElementById('file-input');
            const browseBtn = document.getElementById('browse-files-btn');
            const protectionToggle = document.getElementById('upload-protection-toggle');
            const passwordGroup = document.getElementById('upload-password-group');
            const startUploadBtn = document.getElementById('start-upload-all-btn');

            if (browseBtn && fileInput) {
                browseBtn.addEventListener('click', () => fileInput.click());
            }

            if (protectionToggle && passwordGroup) {
                protectionToggle.addEventListener('change', (e) => {
                    if (e.target.value === 'protected') {
                        passwordGroup.classList.remove('hidden');
                    } else {
                        passwordGroup.classList.add('hidden');
                    }
                });
            }

            if (dropZone) {
                ['dragenter', 'dragover'].forEach(eventName => {
                    dropZone.addEventListener(eventName, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        dropZone.classList.add('dragover');
                    }, false);
                });

                ['dragleave', 'drop'].forEach(eventName => {
                    dropZone.addEventListener(eventName, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        dropZone.classList.remove('dragover');
                    }, false);
                });

                dropZone.addEventListener('drop', (e) => {
                    const dt = e.dataTransfer;
                    const files = dt.files;
                    if (files && files.length > 0) {
                        this.handleFileSelection(files);
                    }
                });
            }

            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        this.handleFileSelection(e.target.files);
                    }
                });
            }

            if (startUploadBtn) {
                startUploadBtn.addEventListener('click', () => this.processUploadQueue());
            }
        },

        handleFileSelection: function (fileList) {
            const queueContainer = document.getElementById('upload-queue-container');
            const queueList = document.getElementById('queue-list');
            const queueCount = document.getElementById('queue-count');

            Array.from(fileList).forEach(file => {
                this.uploadQueue.push({
                    id: 'queue_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                    rawFile: file,
                    name: file.name,
                    size: file.size,
                    type: file.type || 'application/octet-stream',
                    category: getFileCategory(file.type || file.name),
                    progress: 0,
                    status: 'pending'
                });
            });

            if (queueContainer) queueContainer.classList.remove('hidden');
            if (queueCount) queueCount.textContent = this.uploadQueue.length;

            this.renderUploadQueue();
        },

        renderUploadQueue: function () {
            const queueList = document.getElementById('queue-list');
            if (!queueList) return;
            queueList.innerHTML = '';

            this.uploadQueue.forEach(item => {
                const elem = document.createElement('div');
                elem.className = 'queue-item';
                elem.innerHTML = `
                    <div class="queue-item-info">
                        <span class="queue-item-name">${escapeHTML(item.name)}</span>
                        <span class="queue-item-size">${formatBytes(item.size)}</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" id="fill_${item.id}" style="width: ${item.progress}%"></div>
                    </div>
                    <div class="queue-item-status">
                        <span id="status_${item.id}">${item.status === 'pending' ? 'Ready to upload' : item.status}</span>
                        <span id="percent_${item.id}">${item.progress}%</span>
                    </div>
                `;
                queueList.appendChild(elem);
            });
        },

        processUploadQueue: function () {
            if (this.uploadQueue.length === 0) return;

            const protectionType = document.getElementById('upload-protection-toggle')?.value || 'public';
            const passwordVal = document.getElementById('upload-password-input')?.value || '';

            if (protectionType === 'protected' && !passwordVal) {
                ToastNotifier.show('warning', 'Passcode Required', 'Please specify a download passcode for protected file sharing.');
                return;
            }

            const itemsToUpload = [...this.uploadQueue];

            itemsToUpload.forEach(item => {
                if (item.status === 'completed') return;

                item.status = 'Uploading over LAN...';
                let progress = 0;

                const interval = setInterval(() => {
                    progress += Math.floor(Math.random() * 25) + 15;
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                        item.progress = 100;
                        item.status = 'Upload Complete';

                        // Read file data into LocalStorage
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const newFile = {
                                id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                                name: item.name,
                                size: item.size,
                                type: item.type,
                                category: item.category,
                                uploadTime: new Date().toISOString(),
                                sender: `${this.settings.deviceName || 'Host-Node-Alpha'} (192.168.1.104)`,
                                access: protectionType,
                                password: passwordVal,
                                downloads: 0,
                                contentData: e.target.result
                            };

                            this.files.unshift(newFile);
                            StorageManager.saveFiles(this.files);

                            StorageManager.addLog('upload', 'File Uploaded', `${newFile.name} (${formatBytes(newFile.size)}) shared`, '192.168.1.104', 'info');
                            ToastNotifier.show('success', 'Upload Successful', `${newFile.name} is now available on LAN.`);

                            // Remove item from queue
                            this.uploadQueue = this.uploadQueue.filter(q => q.id !== item.id);
                            const queueCount = document.getElementById('queue-count');
                            if (queueCount) queueCount.textContent = this.uploadQueue.length;

                            if (this.uploadQueue.length === 0) {
                                document.getElementById('upload-queue-container')?.classList.add('hidden');
                            }

                            this.renderAll();
                        };

                        reader.readAsDataURL(item.rawFile);
                    }

                    item.progress = progress;
                    const fillElem = document.getElementById(`fill_${item.id}`);
                    const statusElem = document.getElementById(`status_${item.id}`);
                    const percentElem = document.getElementById(`percent_${item.id}`);

                    if (fillElem) fillElem.style.width = `${progress}%`;
                    if (statusElem) statusElem.textContent = item.status;
                    if (percentElem) percentElem.textContent = `${progress}%`;

                }, 200);
            });
        },

        deleteFile: function (fileId) {
            const file = this.files.find(f => f.id === fileId);
            if (!file) return;

            if (confirm(`Are you sure you want to delete "${file.name}" from your LAN shares?`)) {
                this.files = this.files.filter(f => f.id !== fileId);
                StorageManager.saveFiles(this.files);

                StorageManager.addLog('delete', 'File Deleted', `${file.name} was removed from LAN shares`, '192.168.1.104', 'warning');
                ToastNotifier.show('warning', 'File Removed', `${file.name} has been deleted.`);

                this.renderAll();
            }
        },

        // --- Modals Logic ---
        bindModalEvents: function () {
            // Close buttons
            document.querySelectorAll('[data-close-modal]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const modalId = e.currentTarget.getAttribute('data-close-modal');
                    const modal = document.getElementById(modalId);
                    if (modal) modal.classList.add('hidden');
                });
            });

            // Password Prompt Submission
            const promptBtn = document.getElementById('prompt-submit-btn');
            if (promptBtn) {
                promptBtn.addEventListener('click', () => {
                    const passInput = document.getElementById('prompt-passcode-input');
                    const errMsg = document.getElementById('prompt-error-msg');
                    const entered = passInput ? passInput.value : '';

                    const file = this.files.find(f => f.id === this.pendingDownloadFileId);
                    if (file) {
                        if (entered === file.password) {
                            document.getElementById('modal-password-prompt')?.classList.add('hidden');
                            this.executeDownload(file);
                        } else {
                            if (errMsg) errMsg.classList.remove('hidden');
                            this.failedPasswordAttempts++;
                            this.renderSecurityPanel();
                            StorageManager.addLog('security', 'Unauthorized Access Attempt', `Incorrect passcode entered for ${file.name}`, 'Unknown Peer', 'error');
                            ToastNotifier.show('error', 'Access Denied', 'Incorrect file passcode entered.');
                        }
                    }
                });
            }

            // Copy Link Button in Share Modal
            const copyBtn = document.getElementById('modal-copy-link-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    const urlInput = document.getElementById('modal-share-url-input');
                    if (urlInput) {
                        urlInput.select();
                        navigator.clipboard.writeText(urlInput.value).then(() => {
                            ToastNotifier.show('info', 'Link Copied', 'Secure LAN URL copied to clipboard.');
                            StorageManager.addLog('link', 'Secure Link Copied', `Generated LAN link copied for target file`, '192.168.1.104', 'info');
                        }).catch(() => {
                            ToastNotifier.show('info', 'Link Selected', 'Press Ctrl+C to copy URL.');
                        });
                    }
                });
            }

            // Share Modal Password Toggle
            const modalPassToggle = document.getElementById('modal-password-toggle');
            const modalPassGroup = document.getElementById('modal-password-input-group');
            const modalSavePassBtn = document.getElementById('modal-save-password-btn');

            if (modalPassToggle && modalPassGroup) {
                modalPassToggle.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        modalPassGroup.classList.remove('hidden');
                    } else {
                        modalPassGroup.classList.add('hidden');
                        // Set access to public
                        const file = this.files.find(f => f.id === this.activeShareFileId);
                        if (file) {
                            file.access = 'public';
                            file.password = '';
                            StorageManager.saveFiles(this.files);
                            document.getElementById('modal-share-status').textContent = 'Public';
                            document.getElementById('modal-share-status').className = 'badge badge-public';
                            this.renderAll();
                            ToastNotifier.show('info', 'Security Updated', 'File is now publicly accessible to LAN peers.');
                        }
                    }
                });
            }

            if (modalSavePassBtn) {
                modalSavePassBtn.addEventListener('click', () => {
                    const newPass = document.getElementById('modal-file-password')?.value || '';
                    if (!newPass) {
                        ToastNotifier.show('warning', 'Password Empty', 'Please enter a valid passcode.');
                        return;
                    }

                    const file = this.files.find(f => f.id === this.activeShareFileId);
                    if (file) {
                        file.access = 'protected';
                        file.password = newPass;
                        StorageManager.saveFiles(this.files);

                        document.getElementById('modal-share-status').textContent = 'Protected';
                        document.getElementById('modal-share-status').className = 'badge badge-protected';

                        this.renderAll();
                        ToastNotifier.show('success', 'Passcode Saved', 'Passcode protection enabled for file share.');
                    }
                });
            }
        },

        openShareModal: function (fileId) {
            const file = this.files.find(f => f.id === fileId);
            if (!file) return;

            this.activeShareFileId = fileId;

            const modal = document.getElementById('modal-share-link');
            const filenameElem = document.getElementById('modal-share-filename');
            const statusElem = document.getElementById('modal-share-status');
            const urlInput = document.getElementById('modal-share-url-input');
            const passToggle = document.getElementById('modal-password-toggle');
            const passGroup = document.getElementById('modal-password-input-group');
            const passInput = document.getElementById('modal-file-password');

            if (filenameElem) filenameElem.textContent = file.name;
            
            const isProtected = file.access === 'protected';
            if (statusElem) {
                statusElem.textContent = isProtected ? 'Protected' : 'Public';
                statusElem.className = `badge ${isProtected ? 'badge-protected' : 'badge-public'}`;
            }

            const simulatedUrl = `http://192.168.1.104:${this.settings.port || 8080}/share/${file.id}`;
            if (urlInput) urlInput.value = simulatedUrl;

            if (passToggle) passToggle.checked = isProtected;
            if (passGroup) {
                if (isProtected) passGroup.classList.remove('hidden');
                else passGroup.classList.add('hidden');
            }
            if (passInput) passInput.value = file.password || '';

            if (modal) modal.classList.remove('hidden');
        },

        // --- Security Audit Simulation ---
        bindSecurityEvents: function () {
            const scanBtn = document.getElementById('run-security-scan-btn');
            const progressBox = document.getElementById('scan-progress-box');
            const fillElem = document.getElementById('scan-progress-fill');
            const textElem = document.getElementById('scan-status-text');
            const lastCheckTime = document.getElementById('last-security-check-time');

            if (scanBtn) {
                scanBtn.addEventListener('click', () => {
                    scanBtn.disabled = true;
                    if (progressBox) progressBox.classList.remove('hidden');

                    const steps = [
                        'Scanning LAN subnet nodes (192.168.1.0/24)...',
                        'Verifying AES-256 virtual cipher integrity...',
                        'Checking password hash signatures...',
                        'Validating WebSockets transport layer...',
                        'Audit complete - 0 vulnerabilities found.'
                    ];

                    let stepIndex = 0;
                    let progress = 0;

                    const interval = setInterval(() => {
                        progress += 20;
                        if (fillElem) fillElem.style.width = `${progress}%`;
                        if (textElem && steps[stepIndex]) textElem.textContent = steps[stepIndex];

                        stepIndex++;

                        if (progress >= 100) {
                            clearInterval(interval);
                            setTimeout(() => {
                                scanBtn.disabled = false;
                                if (progressBox) progressBox.classList.add('hidden');
                                if (lastCheckTime) lastCheckTime.textContent = 'Just now';

                                StorageManager.addLog('security', 'Security Audit Run', 'Full LAN security scan completed - All checks passed', '192.168.1.104', 'pass');
                                ToastNotifier.show('success', 'Security Scan Passed', 'Local network and encryption parameters verified.');
                                this.renderAll();
                            }, 500);
                        }
                    }, 500);
                });
            }
        },

        // --- Settings & Reset ---
        bindSettingsEvents: function () {
            const settingsForm = document.getElementById('settings-form');
            const resetBtn = document.getElementById('reset-settings-btn');
            const resetAllDataBtn = document.getElementById('reset-all-data-btn');
            const clearLogBtn = document.getElementById('clear-activity-log-btn');

            if (settingsForm) {
                settingsForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const deviceName = document.getElementById('setting-device-name')?.value || 'Host-Node-Alpha';
                    const port = parseInt(document.getElementById('setting-port')?.value || '8080', 10);
                    const storageLimitGB = parseFloat(document.getElementById('setting-storage-limit')?.value || '10');
                    const defaultProtection = document.getElementById('setting-default-protection')?.value || 'public';

                    this.settings = { deviceName, port, storageLimitGB, defaultProtection };
                    StorageManager.saveSettings(this.settings);

                    ToastNotifier.show('success', 'Settings Saved', 'Node configuration parameters updated.');
                    this.renderAll();
                });
            }

            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    this.settings = { ...DEFAULT_SETTINGS };
                    StorageManager.saveSettings(this.settings);

                    document.getElementById('setting-device-name').value = DEFAULT_SETTINGS.deviceName;
                    document.getElementById('setting-port').value = DEFAULT_SETTINGS.port;
                    document.getElementById('setting-storage-limit').value = DEFAULT_SETTINGS.storageLimitGB;
                    document.getElementById('setting-default-protection').value = DEFAULT_SETTINGS.defaultProtection;

                    ToastNotifier.show('info', 'Settings Reset', 'Restored default node configuration.');
                    this.renderAll();
                });
            }

            if (resetAllDataBtn) {
                resetAllDataBtn.addEventListener('click', () => {
                    if (confirm('Are you sure you want to reset all files, logs, and settings to factory defaults?')) {
                        StorageManager.clearAll();
                        this.loadState();
                        this.renderAll();
                        ToastNotifier.show('warning', 'System Reset', 'All application state reset to seed defaults.');
                    }
                });
            }

            if (clearLogBtn) {
                clearLogBtn.addEventListener('click', () => {
                    if (confirm('Clear all audit logs?')) {
                        StorageManager.saveLogs([]);
                        this.loadState();
                        this.renderAll();
                        ToastNotifier.show('info', 'Logs Cleared', 'Activity log trail emptied.');
                    }
                });
            }

            // Log Filter chips
            document.querySelectorAll('.activity-filters .chip').forEach(chip => {
                chip.addEventListener('click', (e) => {
                    document.querySelectorAll('.activity-filters .chip').forEach(c => c.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.renderActivityLog();
                });
            });
        }
    };

    // Initialize Application on DOM Ready
    document.addEventListener('DOMContentLoaded', () => {
        LANShareApp.init();
    });

})();
