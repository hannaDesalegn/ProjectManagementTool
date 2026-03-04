// Boards Manager - Handles board creation and navigation from dashboard

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
        if (typeof showNotification === 'function') {
            showNotification('Board created successfully!', 'success');
        }
        // Optionally reload boards for the project (if you want to show them in the UI)
        if (typeof loadProjectBoards === 'function') {
            await loadProjectBoards(projectId);
        }
        // Navigate to board
        window.location.href = `/board.html?id=${board.id}`;
    } catch (error) {
        console.error('Error creating board:', error);
        if (typeof showNotification === 'function') {
            showNotification(error.message || 'Failed to create board', 'error');
        } else {
            alert(error.message || 'Failed to create board');
        }
    }
}

// Load boards for a project
async function loadProjectBoards(projectId) {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/index.html';
        return [];
    }

    try {
        const response = await fetch(`${API_BASE}/boards/project/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to load boards');
        }

        const boards = await response.json();
        return boards;
    } catch (error) {
        console.error('Error loading boards:', error);
        return [];
    }
}

// Navigate to board
function openBoard(boardId) {
    window.location.href = `/board.html?id=${boardId}`;
}

// Make functions globally available
window.createBoardFromDashboard = createBoardFromDashboard;
window.loadProjectBoards = loadProjectBoards;
window.openBoard = openBoard;