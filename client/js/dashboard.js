// --- Global fetch wrapper for 401 handling ---
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    options.headers = options.headers || {};
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, options);
    if (res.status === 401) {
        showNotification('Session expired. Please log in again.', 'error');
        setTimeout(() => { window.location.href = '/index.html'; }, 1500);
        throw new Error('Unauthorized');
    }
    return res;
}
// --- Workspace & Project Creation UI Logic ---
function showModalById(id) {
    document.getElementById(id).classList.remove('hidden');
}

function hideModalById(id) {
    document.getElementById(id).classList.add('hidden');
}

// Workspace Modal
document.addEventListener('DOMContentLoaded', () => {
    const wsBtn = document.getElementById('createWorkspaceBtn');
    const wsBtnTop = document.getElementById('createWorkspaceBtnTop');
    const wsModal = document.getElementById('createWorkspaceModal');
    const wsForm = document.getElementById('workspaceForm');
    const wsClose = document.getElementById('closeWorkspaceModal');
    if (wsBtn) wsBtn.addEventListener('click', () => showModalById('createWorkspaceModal'));
    if (wsBtnTop) wsBtnTop.addEventListener('click', () => showModalById('createWorkspaceModal'));
    if (wsClose) wsClose.addEventListener('click', () => hideModalById('createWorkspaceModal'));
    if (wsForm) wsForm.onsubmit = async(e) => {
        e.preventDefault();
        const name = document.getElementById('workspaceName').value;
        const type = document.getElementById('workspaceType').value;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/workspaces`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type })
            });
            if (!res.ok) throw new Error('Failed to create workspace');
            showNotification('Workspace created!', 'success');
            hideModalById('createWorkspaceModal');
            loadData();
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };
});

// Project Modal (Workspace section only)
document.addEventListener('DOMContentLoaded', () => {
    const prBtn = document.getElementById('createProjectBtn');
    const prModal = document.getElementById('createProjectModal');
    const prForm = document.getElementById('projectForm');
    const prClose = document.getElementById('closeProjectModal');
    if (prBtn) prBtn.addEventListener('click', async() => {
        // Always populate workspace dropdown with latest workspaces
        const wsSelect = document.getElementById('projectWorkspace');
        if (!currentWorkspaces.length) {
            showNotification('Please create a workspace first.', 'error');
            return;
        }
        wsSelect.innerHTML = currentWorkspaces.map(ws => `<option value="${ws.id}">${ws.name}</option>`).join('');
        showModalById('createProjectModal');
    });
    if (prClose) prClose.addEventListener('click', () => hideModalById('createProjectModal'));
    if (prForm) prForm.onsubmit = async(e) => {
        e.preventDefault();
        const name = document.getElementById('projectName').value;
        const description = document.getElementById('projectDescription').value;
        const workspace_id = document.getElementById('projectWorkspace').value;
        if (!workspace_id) {
            showNotification('Workspace is required.', 'error');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/projects`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, workspace_id })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || err.message || 'Failed to create project');
            }
            showNotification('Project created!', 'success');
            hideModalById('createProjectModal');
            loadData();
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };
});
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
        
        // Set settings fields
        const settingsName = document.getElementById('settingsName');
        const settingsEmail = document.getElementById('settingsEmail');
        if (settingsName) settingsName.value = userData.name;
        if (settingsEmail) settingsEmail.value = userData.email;
    } catch (error) {
        console.error('Auth error:', error);
    }

    loadData();
}

// Load data
async function loadData() {
    try {
        showLoadingState();
        
        const wsRes = await fetchWithAuth(`${API_BASE}/workspaces`);
        if (wsRes.ok) {
            const data = await wsRes.json();
            currentWorkspaces = data.workspaces || data || [];
            updateWorkspaceCount();
        }

        const prRes = await fetchWithAuth(`${API_BASE}/projects`);
        if (prRes.ok) {
            const data = await prRes.json();
            currentProjects = data.projects || data || [];
            updateProjectCount();
            updateActiveProjectsList();
        }

        // Load invitations
        const invRes = await fetchWithAuth(`${API_BASE}/workspaces/invitations/pending`);
        if (invRes.ok) {
            const data = await invRes.json();
            pendingInvitations = data.invitations || [];
            updateNotificationBadge();
        }

        // Update sidebar
        updateTeamMembers();
        loadRecentActivity();
        
        hideLoadingState();
    } catch (error) {
        console.error('Load error:', error);
        hideLoadingState();
        showNotification('Failed to load data', 'error');
    }
}

// Show loading state
function showLoadingState() {
    const counts = ['workspaceCount', 'projectCount', 'boardCount', 'taskCount'];
    counts.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = '<div class="skeleton h-8 w-16 rounded"></div>';
        }
    });
}

// Hide loading state
function hideLoadingState() {
    // Counts will be updated by their respective functions
}

// Update workspace count
function updateWorkspaceCount() {
    const el = document.getElementById('workspaceCount');
    if (el) {
        el.innerHTML = `<span class="pulse-glow">${currentWorkspaces.length}</span>`;
    }
}

// Update project count
function updateProjectCount() {
    const el = document.getElementById('projectCount');
    if (el) {
        el.innerHTML = `<span class="pulse-glow">${currentProjects.length}</span>`;
    }
}

// Load recent activity
async function loadRecentActivity() {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    // Show loading
    container.innerHTML = '<div class="text-gray-400 text-center py-8"><i class="fas fa-spinner fa-spin mr-2"></i>Loading activity...</div>';
    
    try {
        const activities = [];
        
        // Add workspace activities
        currentWorkspaces.slice(0, 3).forEach(ws => {
            const timeAgo = getTimeAgo(new Date(ws.created_at));
            activities.push({
                icon: 'fa-briefcase',
                color: 'text-purple-400',
                bgColor: 'bg-purple-500/20',
                text: `Created workspace "${ws.name}"`,
                time: timeAgo,
                type: 'workspace'
            });
        });
        
        // Add project activities
        currentProjects.slice(0, 3).forEach(p => {
            const timeAgo = getTimeAgo(new Date(p.created_at));
            activities.push({
                icon: 'fa-folder',
                color: 'text-blue-400',
                bgColor: 'bg-blue-500/20',
                text: `Created project "${p.name}"`,
                time: timeAgo,
                type: 'project'
            });
        });
        
        // Sort by most recent
        activities.sort((a, b) => b.time.localeCompare(a.time));
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-inbox text-gray-600 text-2xl"></i>
                    </div>
                    <p class="text-gray-500 text-sm">No recent activity</p>
                    <p class="text-gray-600 text-xs mt-1">Start by creating a workspace or project</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = activities.slice(0, 8).map(a => `
            <div class="activity-item flex items-start gap-3 p-3 hover:bg-purple-500/5 rounded-lg transition-all cursor-pointer">
                <div class="w-10 h-10 rounded-lg ${a.bgColor} flex items-center justify-center flex-shrink-0">
                    <i class="fas ${a.icon} ${a.color}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-white text-sm">${a.text}</p>
                    <p class="text-gray-500 text-xs mt-1">
                        <i class="far fa-clock mr-1"></i>${a.time}
                    </p>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading activity:', error);
        container.innerHTML = '<div class="text-red-400 text-center py-8">Failed to load activity</div>';
    }
}

// Get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
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
    // This function is now replaced by loadRecentActivity
    loadRecentActivity();
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
                <div class="flex gap-2">
                    <button onclick="inviteToWorkspace('${ws.id}', '${escapedName}')" class="flex-1 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm font-medium transition-all">
                        <i class="fas fa-user-plus mr-2"></i>Invite Member
                    </button>
                    <button onclick="deleteWorkspace('${ws.id}')" class="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all">
                        <i class="fas fa-trash mr-2"></i>Delete
                    </button>
                </div>
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
                <div class="flex gap-2">
                    <button onclick="createBoardFromDashboard('${p.id}', '${escapedName}')" class="flex-1 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm font-medium transition-all">
                        <i class="fas fa-columns mr-2"></i>Create Board
                    </button>
                    <button onclick="deleteProject('${p.id}')" class="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all">
                        <i class="fas fa-trash mr-2"></i>Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
// Delete workspace
async function deleteWorkspace(workspaceId) {
    if (!confirm('Are you sure you want to delete this workspace? This will also delete all its projects and boards.')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE}/workspaces/${workspaceId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            showNotification('Workspace deleted!', 'success');
            loadData();
            if (currentPage === 'workspaces') loadWorkspaces();
        } else {
            const data = await res.json().catch(() => ({}));
            showNotification(data.error || 'Failed to delete workspace', 'error');
        }
    } catch (err) {
        showNotification('Network error', 'error');
    }
}

// Delete project
async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project? This will also delete all its boards.')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE}/projects/${projectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            showNotification('Project deleted!', 'success');
            loadData();
            if (currentPage === 'projects') loadProjects();
            updateActiveProjectsList();
        } else {
            const data = await res.json().catch(() => ({}));
            showNotification(data.error || 'Failed to delete project', 'error');
        }
    } catch (err) {
        showNotification('Network error', 'error');
    }
}
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
    console.log('🚀 Dashboard loading...');
    
    // Check auth first
    checkAuth();
    
    // Make functions globally accessible
    window.inviteToWorkspace = inviteToWorkspace;
    window.closeModal = closeModal;
    window.acceptInvitation = acceptInvitation;
    window.rejectInvitation = rejectInvitation;
    window.deleteWorkspace = deleteWorkspace;
    window.deleteProject = deleteProject;
    window.createBoardFromDashboard = createBoardFromDashboard;
    
    // Add event listeners with error handling
    setTimeout(() => {
        try {
            // Navigation buttons
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Nav clicked:', item.getAttribute('data-page'));
                    switchPage(item.getAttribute('data-page'));
                });
            });
            
            // Logout button
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Logout clicked');
                    logout();
                });
            }
            
            // Theme toggle
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Theme toggle clicked');
                    toggleTheme();
                });
            }
            
            // Create workspace button
            const createWsBtn = document.getElementById('createWorkspaceBtn');
            if (createWsBtn) {
                createWsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Create workspace clicked');
                    createWorkspace();
                });
            }
            
            // Create project button
            const createPrBtn = document.getElementById('createProjectBtn');
            if (createPrBtn) {
                createPrBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Create project clicked');
                    createProject();
                });
            }
            
            // Notification bell click
            const notificationBtn = document.querySelector('.fa-bell')?.parentElement;
            if (notificationBtn) {
                notificationBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Notification bell clicked');
                    showInvitations();
                });
            }
            
            // Time period buttons
            const periodButtons = document.querySelectorAll('.glass-effect.rounded-xl.p-1 > button');
            periodButtons.forEach((btn, index) => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Period button clicked:', index);
                    
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
            
            console.log('✅ All event listeners attached successfully');
            
        } catch (error) {
            console.error('❌ Error setting up event listeners:', error);
        }
    }, 500);
});

// Create board from dashboard
async function createBoardFromDashboard(projectId, projectName) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    // Show modal to get board name
    const boardName = prompt(`Create a new board for "${projectName}"`, 'My Board');
    if (!boardName) return;

    try {
        // Get project details to get workspace_id
        const projectRes = await fetch(`${API_BASE}/projects/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!projectRes.ok) {
            const err = await projectRes.json();
            throw new Error(err.error || 'Failed to get project details. Please create a project first.');
        }
        const project = await projectRes.json();
        if (!project.workspace_id) {
            throw new Error('Project is missing workspace. Please create a workspace and project first.');
        }

        // Create board
        const response = await fetch(`${API_BASE}/boards`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: boardName,
                project_id: projectId,
                workspace_id: project.workspace_id
            })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || error.message || 'Failed to create board');
        }
        const board = await response.json();
        showNotification('Board created successfully!', 'success');
        
        // Navigate to board
        window.location.href = `/board.html?id=${board.id}`;
    } catch (error) {
        console.error('Error creating board:', error);
        showNotification(error.message || 'Failed to create board', 'error');
    }
}

// Make function globally available
window.createBoardFromDashboard = createBoardFromDashboard;
window.loadRecentActivity = loadRecentActivity;
window.showAllBoards = showAllBoards;
window.saveSettings = saveSettings;

// Show all boards function
function showAllBoards() {
    showNotification('Boards view coming soon!', 'info');
}

// Save settings function
function saveSettings() {
    const name = document.getElementById('settingsName')?.value;
    if (name && name !== currentUser.name) {
        currentUser.name = name;
        localStorage.setItem('user', JSON.stringify(currentUser));
        document.getElementById('userName').textContent = name;
        showNotification('Settings saved!', 'success');
    }
}