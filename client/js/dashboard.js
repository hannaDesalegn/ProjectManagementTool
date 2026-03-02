// Simple working dashboard
const API_BASE = '/api';
let currentWorkspaces = [];
let currentProjects = [];
let currentPage = 'overview';
let pendingInvitations = [];

// Check auth
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
        window.location.href = '/index.html';
        return;
    }

    try {
        const userData = JSON.parse(user);
        const displayName = userData.name || userData.email.split('@')[0];

        const userName = document.getElementById('userName');
        const userNameSidebar = document.getElementById('userNameSidebar');
        if (userName) userName.textContent = displayName;
        if (userNameSidebar) userNameSidebar.textContent = displayName;

        const avatarImg = document.getElementById('avatarImg');
        if (avatarImg) {
            avatarImg.src = userData.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&size=120&background=8b5cf6&color=fff`;
        }
    } catch (error) {
        console.error('Auth error:', error);
    }

    loadData();
}

// Load data
async function loadData() {
    const token = localStorage.getItem('token');

    try {
        const wsRes = await fetch(`${API_BASE}/workspaces`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (wsRes.ok) {
            const data = await wsRes.json();
            currentWorkspaces = data.workspaces || data || [];
            const totalRevenue = document.getElementById('totalRevenue');
            if (totalRevenue) totalRevenue.textContent = currentWorkspaces.length;
        }

        const prRes = await fetch(`${API_BASE}/projects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (prRes.ok) {
            const data = await prRes.json();
            currentProjects = data.projects || data || [];
            const activeProjects = document.getElementById('activeProjects');
            if (activeProjects) activeProjects.textContent = currentProjects.length;

            // Update active projects list in overview
            updateActiveProjectsList();
        }

        // Load invitations
        const invRes = await fetch(`${API_BASE}/workspaces/invitations/pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (invRes.ok) {
            const data = await invRes.json();
            pendingInvitations = data.invitations || [];
            updateNotificationBadge();
        }

        // Update sidebar
        updateTeamMembers();
        updateRecentActivity();

        initChart();
    } catch (error) {
        console.error('Load error:', error);
    }
}

// Update active projects list in overview
function updateActiveProjectsList() {
    const list = document.getElementById('activeProjectsList');
    if (!list) return;

    if (currentProjects.length === 0) {
        list.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400">No projects yet. Create your first project!</div>';
        return;
    }

    // Show up to 6 most recent projects
    const recentProjects = currentProjects.slice(0, 6);

    list.innerHTML = recentProjects.map(p => {
        const startDate = new Date(p.start_date).toLocaleDateString();
        const endDate = new Date(p.end_date).toLocaleDateString();

        return `
            <div class="glass-effect rounded-xl p-6 card-hover">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-white font-bold">${p.name}</h3>
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${
                        p.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                        p.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                    }">${p.status}</span>
                </div>
                <p class="text-gray-400 text-sm mb-4">${p.description || 'No description'}</p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span><i class="far fa-calendar mr-1"></i>${startDate}</span>
                    <span><i class="far fa-calendar-check mr-1"></i>${endDate}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Update team members
function updateTeamMembers() {
    const list = document.getElementById('teamMembersList');
    if (!list) return;

    const user = JSON.parse(localStorage.getItem('user'));
    const members = [
        { name: user.name, email: user.email, status: 'online', avatar: user.profile_pic }
    ];

    list.innerHTML = members.map(m => `
        <div class="flex items-center gap-3 p-2 hover:bg-purple-500/10 rounded-lg transition-colors cursor-pointer">
            <div class="relative">
                <img src="${m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&size=80&background=8b5cf6&color=fff`}" 
                     alt="${m.name}" class="w-8 h-8 rounded-full">
                <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0a0a0f]"></div>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-white text-sm font-medium truncate">${m.name}</p>
                <p class="text-gray-500 text-xs truncate">${m.email}</p>
            </div>
        </div>
    `).join('');
}

// Update recent activity
function updateRecentActivity() {
    const list = document.getElementById('activityList');
    if (!list) return;
    
    const activities = [];
    
    // Add workspace activities
    currentWorkspaces.slice(0, 2).forEach(ws => {
        activities.push({
            icon: 'fa-briefcase',
            color: 'text-blue-400',
            text: `Created workspace "${ws.name}"`,
            time: 'Recently'
        });
    });
    
    // Add project activities
    currentProjects.slice(0, 3).forEach(p => {
        activities.push({
            icon: 'fa-folder',
            color: 'text-purple-400',
            text: `Created project "${p.name}"`,
            time: 'Recently'
        });
    });
    
    if (activities.length === 0) {
        list.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No recent activity</p>';
        return;
    }
    
    list.innerHTML = activities.slice(0, 5).map(a => `
        <div class="flex items-start gap-3 p-2 hover:bg-purple-500/10 rounded-lg transition-colors">
            <div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <i class="fas ${a.icon} ${a.color} text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-white text-sm">${a.text}</p>
                <p class="text-gray-500 text-xs mt-1">${a.time}</p>
            </div>
        </div>
    `).join('');
}

// Update notification badge
function updateNotificationBadge() {
    const badge = document.querySelector('.fa-bell').parentElement.querySelector('.bg-red-500');
    if (badge && pendingInvitations.length > 0) {
        badge.style.display = 'block';
    } else if (badge) {
        badge.style.display = pendingInvitations.length > 0 ? 'block' : 'none';
    }
}

// Show invitations
function showInvitations() {
    if (pendingInvitations.length === 0) {
        showModal('Invitations', '<p class="text-gray-400 text-center py-8">No pending invitations</p>');
        return;
    }
    
    const invitationsHTML = pendingInvitations.map(inv => `
        <div class="glass-effect rounded-xl p-4 mb-3">
            <h4 class="text-white font-bold mb-2">${inv.workspace.name}</h4>
            <p class="text-gray-400 text-sm mb-3">Role: ${inv.role}</p>
            <div class="flex gap-2">
                <button onclick="acceptInvitation('${inv.id}')" class="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium">
                    <i class="fas fa-check mr-1"></i>Accept
                </button>
                <button onclick="rejectInvitation('${inv.id}')" class="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium">
                    <i class="fas fa-times mr-1"></i>Reject
                </button>
            </div>
        </div>
    `).join('');
    
    showModal('Workspace Invitations', invitationsHTML);
}

// Accept invitation
async function acceptInvitation(invitationId) {
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${API_BASE}/workspaces/invitations/${invitationId}/accept`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        if (res.ok) {
            showNotification('Invitation accepted!', 'success');
            closeModal();
            loadData();
            if (currentPage === 'workspaces') loadWorkspaces();
        } else {
            showNotification(data.error || 'Failed to accept invitation', 'error');
        }
    } catch (error) {
        showNotification('Network error', 'error');
        console.error(error);
    }
}

// Reject invitation
async function rejectInvitation(invitationId) {
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${API_BASE}/workspaces/invitations/${invitationId}/reject`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        if (res.ok) {
            showNotification('Invitation rejected', 'info');
            closeModal();
            loadData();
        } else {
            showNotification(data.error || 'Failed to reject invitation', 'error');
        }
    } catch (error) {
        showNotification('Network error', 'error');
        console.error(error);
    }
}

// Init chart
function initChart() {
    const canvas = document.getElementById('statsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm'],
            datasets: [{
                label: 'Tasks',
                data: [2.5, 2.8, 2.3, 2.7, 3.2, 2.9, 2.4, 3.8, 2.6, 3.5],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#9ca3af' } } },
            scales: {
                y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(139, 92, 246, 0.1)' } },
                x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
            }
        }
    });
}

// Switch page
function switchPage(page) {
    currentPage = page;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        }
    });
    
    const sections = ['overviewSection', 'projectsSection', 'workspacesSection', 'settingsSection'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    
    const pageTitle = document.getElementById('pageTitle');
    const titles = { overview: 'Statistics', projects: 'Projects', workspaces: 'Workspaces', settings: 'Settings' };
    if (pageTitle) pageTitle.textContent = titles[page] || 'Dashboard';
    
    const activeSection = document.getElementById(page + 'Section');
    if (activeSection) activeSection.classList.remove('hidden');
    
    if (page === 'settings') loadSettings();
    if (page === 'workspaces') loadWorkspaces();
    if (page === 'projects') loadProjects();
}

// Load settings
function loadSettings() {
    const profileSettings = document.getElementById('profileSettings');
    if (!profileSettings) return;
    
    const user = JSON.parse(localStorage.getItem('user'));
    profileSettings.innerHTML = `
        <div class="glass-effect rounded-2xl p-6">
            <h3 class="text-xl font-bold text-white mb-4">Profile</h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-gray-300 text-sm mb-2">Name</label>
                    <input type="text" value="${user.name}" class="w-full px-4 py-3 bg-[#0a0a0f] border border-gray-700 rounded-xl text-white">
                </div>
                <div>
                    <label class="block text-gray-300 text-sm mb-2">Email</label>
                    <input type="email" value="${user.email}" readonly class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-500">
                </div>
            </div>
        </div>
    `;
}

// Load workspaces
function loadWorkspaces() {
    const list = document.getElementById('workspacesList');
    if (!list) return;
    
    if (currentWorkspaces.length === 0) {
        list.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400">No workspaces</div>';
        return;
    }
    
    list.innerHTML = currentWorkspaces.map(ws => {
        const escapedName = ws.name.replace(/'/g, "\\'");
        return `
            <div class="glass-effect rounded-xl p-6 card-hover">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-white font-bold">${ws.name}</h3>
                    <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">${ws.type}</span>
                </div>
                <p class="text-gray-400 text-sm mb-4">${ws.current_members || 1} member${(ws.current_members || 1) > 1 ? 's' : ''}</p>
                <button onclick="inviteToWorkspace('${ws.id}', '${escapedName}')" class="w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm font-medium transition-all">
                    <i class="fas fa-user-plus mr-2"></i>Invite Member
                </button>
            </div>
        `;
    }).join('');
}

// Load projects
function loadProjects() {
    const list = document.getElementById('projectsList');
    if (!list) return;
    
    if (currentProjects.length === 0) {
        list.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400">No projects</div>';
        return;
    }
    
    list.innerHTML = currentProjects.map(p => {
        const startDate = new Date(p.start_date).toLocaleDateString();
        const endDate = new Date(p.end_date).toLocaleDateString();
        const escapedName = p.name.replace(/'/g, "\\'");
        
        return `
            <div class="glass-effect rounded-xl p-6 card-hover">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-white font-bold">${p.name}</h3>
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${
                        p.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                        p.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                    }">${p.status}</span>
                </div>
                <p class="text-gray-400 text-sm mb-4">${p.description || 'No description'}</p>
                <div class="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span><i class="far fa-calendar mr-1"></i>${startDate}</span>
                    <span><i class="far fa-calendar-check mr-1"></i>${endDate}</span>
                </div>
                <button onclick="createBoardFromDashboard('${p.id}', '${escapedName}')" class="w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm font-medium transition-all">
                    <i class="fas fa-columns mr-2"></i>Create Board
                </button>
            </div>
        `;
    }).join('');
}

// Show modal
function showModal(title, content) {
    const modal = document.createElement('div');
    modal.id = 'modal';
    modal.className = 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="glass-effect rounded-3xl w-full max-w-md">
            <div class="flex items-center justify-between p-6 border-b border-gray-700">
                <h3 class="text-2xl font-bold text-white">${title}</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-white">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-6">${content}</div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.remove();
}

// Create workspace
function createWorkspace() {
    showModal('Create Workspace', `
        <form id="wsForm" class="space-y-4">
            <input type="text" id="wsName" placeholder="Workspace Name" required class="w-full px-4 py-3 bg-[#0a0a0f] border border-gray-700 rounded-xl text-white">
            <select id="wsType" class="w-full px-4 py-3 bg-[#0a0a0f] border border-gray-700 rounded-xl text-white">
                <option value="PERSONAL">Personal</option>
                <option value="TEAM">Team</option>
                <option value="ORGANIZATION">Organization</option>
            </select>
            <button type="submit" class="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl">Create</button>
        </form>
    `);
    
    setTimeout(() => {
        document.getElementById('wsForm').onsubmit = async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            
            try {
                const res = await fetch(`${API_BASE}/workspaces`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${token}`, 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        name: document.getElementById('wsName').value,
                        type: document.getElementById('wsType').value
                    })
                });
                
                const data = await res.json();
                
                if (res.ok) {
                    showNotification('Workspace created successfully!', 'success');
                    closeModal();
                    loadData();
                    if (currentPage === 'workspaces') loadWorkspaces();
                } else {
                    const errorMsg = data.details ? data.details.join(', ') : data.error || 'Failed to create workspace';
                    showNotification(errorMsg, 'error');
                    console.error('Error:', data);
                }
            } catch (error) {
                showNotification('Network error. Please try again.', 'error');
                console.error('Network error:', error);
            }
        };
    }, 100);
}

// Create project
function createProject() {
    if (currentWorkspaces.length === 0) {
        showNotification('Please create a workspace first', 'info');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const endDate = nextMonth.toISOString().split('T')[0];
    
    showModal('Create Project', `
        <form id="prForm" class="space-y-4">
            <input type="text" id="prName" placeholder="Project Name" required class="w-full px-4 py-3 bg-[#0a0a0f] border border-gray-700 rounded-xl text-white">
            <select id="prWs" required class="w-full px-4 py-3 bg-[#0a0a0f] border border-gray-700 rounded-xl text-white">
                ${currentWorkspaces.map(ws => `<option value="${ws.id}">${ws.name}</option>`).join('')}
            </select>
            <textarea id="prDesc" placeholder="Description (optional)" rows="3" class="w-full px-4 py-3 bg-[#0a0a0f] border border-gray-700 rounded-xl text-white resize-none"></textarea>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-gray-300 text-sm mb-2">Start Date</label>
                    <input type="date" id="prStart" value="${today}" required class="w-full px-4 py-3 bg-[#0a0a0f] border border-gray-700 rounded-xl text-white">
                </div>
                <div>
                    <label class="block text-gray-300 text-sm mb-2">End Date</label>
                    <input type="date" id="prEnd" value="${endDate}" required class="w-full px-4 py-3 bg-[#0a0a0f] border border-gray-700 rounded-xl text-white">
                </div>
            </div>
            <button type="submit" class="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl">Create</button>
        </form>
    `);
    
    setTimeout(() => {
        document.getElementById('prForm').onsubmit = async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            
            try {
                const res = await fetch(`${API_BASE}/projects`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${token}`, 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        name: document.getElementById('prName').value,
                        workspace_id: document.getElementById('prWs').value,
                        description: document.getElementById('prDesc').value || '',
                        start_date: document.getElementById('prStart').value,
                        end_date: document.getElementById('prEnd').value
                    })
                });
                
                const data = await res.json();
                
                if (res.ok) {
                    showNotification('Project created successfully!', 'success');
                    closeModal();
                    loadData();
                    if (currentPage === 'projects') loadProjects();
                    updateActiveProjectsList();
                } else {
                    const errorMsg = data.details ? data.details.join(', ') : data.error || 'Failed to create project';
                    showNotification(errorMsg, 'error');
                    console.error('Error:', data);
                }
            } catch (error) {
                showNotification('Network error. Please try again.', 'error');
                console.error('Network error:', error);
            }
        };
    }, 100);
}

// Invite to workspace
function inviteToWorkspace(workspaceId, workspaceName) {
    showModal(`Invite to ${workspaceName}`, `
        <form id="inviteWsForm" class="space-y-4">
            <div>
                <label class="block text-gray-300 text-sm mb-2">Email Address</label>
                <input type="email" id="inviteEmail" placeholder="user@example.com" required class="w-full px-4 py-3 bg-[#0a0a0f] border border-gray-700 rounded-xl text-white">
            </div>
            <div>
                <label class="block text-gray-300 text-sm mb-2">Role</label>
                <select id="inviteRole" class="w-full px-4 py-3 bg-[#0a0a0f] border border-gray-700 rounded-xl text-white">
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                </select>
            </div>
            <button type="submit" class="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl">Send Invitation</button>
        </form>
    `);
    
    setTimeout(() => {
        document.getElementById('inviteWsForm').onsubmit = async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            
            try {
                const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/invite`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${token}`, 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        email: document.getElementById('inviteEmail').value,
                        role: document.getElementById('inviteRole').value
                    })
                });
                
                const data = await res.json();
                
                if (res.ok) {
                    showNotification('Invitation sent successfully!', 'success');
                    closeModal();
                } else {
                    const errorMsg = data.error || 'Failed to send invitation';
                    showNotification(errorMsg, 'error');
                }
            } catch (error) {
                showNotification('Network error. Please try again.', 'error');
                console.error('Network error:', error);
            }
        };
    }, 100);
}

// Notification
function showNotification(message, type = 'info') {
    const colors = {
        'success': 'bg-green-500/20 border-2 border-green-500 text-green-400',
        'error': 'bg-red-500/20 border-2 border-red-500 text-red-400',
        'info': 'bg-blue-500/20 border-2 border-blue-500 text-blue-400'
    };
    
    const notification = document.getElementById('notification');
    if (notification) {
        notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl font-medium ${colors[type]}`;
        notification.textContent = message;
        notification.style.transform = 'translateX(0)';
        
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
        }, 4000);
    }
}

// Logout
function logout() {
    localStorage.clear();
    window.location.href = '/index.html';
}

// Theme toggle
function toggleTheme() {
    const body = document.body;
    const isDark = body.style.backgroundColor === 'rgb(10, 10, 15)' || !body.style.backgroundColor;
    
    if (isDark) {
        body.style.backgroundColor = '#f3f4f6';
        body.style.color = '#1f2937';
        showNotification('Light mode enabled', 'info');
    } else {
        body.style.backgroundColor = '#0a0a0f';
        body.style.color = '#ffffff';
        showNotification('Dark mode enabled', 'info');
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Make functions globally accessible
    window.inviteToWorkspace = inviteToWorkspace;
    window.closeModal = closeModal;
    window.acceptInvitation = acceptInvitation;
    window.rejectInvitation = rejectInvitation;
    
    setTimeout(() => {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage(item.getAttribute('data-page'));
            });
        });
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', logout);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
        
        const createWsBtn = document.getElementById('createWorkspaceBtn');
        if (createWsBtn) createWsBtn.addEventListener('click', createWorkspace);
        
        const createPrBtn = document.getElementById('createProjectBtn');
        if (createPrBtn) createPrBtn.addEventListener('click', createProject);
        
        // Notification bell click
        const notificationBtn = document.querySelector('.fa-bell').parentElement;
        if (notificationBtn) {
            notificationBtn.addEventListener('click', showInvitations);
        }
        
        // Time period buttons
        const periodButtons = document.querySelectorAll('.glass-effect.rounded-xl.p-1 > button');
        periodButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                periodButtons.forEach(b => {
                    b.classList.remove('bg-gradient-to-r', 'from-purple-500', 'to-pink-500', 'text-white');
                    b.classList.add('text-gray-400');
                });
                btn.classList.add('bg-gradient-to-r', 'from-purple-500', 'to-pink-500', 'text-white');
                btn.classList.remove('text-gray-400');
                
                const periods = ['Days', 'Weeks', 'Months'];
                showNotification(`Viewing ${periods[index]} data`, 'info');
            });
        });
    }, 500);
});