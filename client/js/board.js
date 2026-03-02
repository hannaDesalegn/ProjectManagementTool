// Get board ID from URL
const urlParams = new URLSearchParams(window.location.search);
const boardId = urlParams.get('id');

let currentBoard = null;
let draggedCard = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!boardId) {
        showNotification('No board ID provided', 'error');
        setTimeout(() => window.location.href = '/dashboard.html', 2000);
        return;
    }

    loadBoard();
    initTheme();
});

// Load board data
async function loadBoard() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/index.html';
            return;
        }

        const response = await fetch(`/api/boards/${boardId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load board');
        }

        currentBoard = await response.json();
        renderBoard();
    } catch (error) {
        console.error('Error loading board:', error);
        showNotification('Failed to load board', 'error');
    }
}

// Render board
function renderBoard() {
    if (!currentBoard) return;

    document.getElementById('boardTitle').textContent = currentBoard.name;

    const listsContainer = document.getElementById('listsContainer');
    listsContainer.innerHTML = '';

    if (!currentBoard.lists || currentBoard.lists.length === 0) {
        listsContainer.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"/>
                    <path d="M9 3v18M15 3v18" stroke-width="2"/>
                </svg>
                <h3>No lists yet</h3>
                <p>Create your first list to start organizing tasks</p>
            </div>
        `;
        return;
    }

    currentBoard.lists.forEach(list => {
        const listElement = createListElement(list);
        listsContainer.appendChild(listElement);
    });
}

// Create list element
function createListElement(list) {
    const listDiv = document.createElement('div');
    listDiv.className = 'list';
    listDiv.dataset.listId = list.id;

    const cardCount = list.cards ? list.cards.length : 0;

    listDiv.innerHTML = `
        <div class="list-header">
            <h3 class="list-title">
                ${escapeHtml(list.name)}
                <span class="list-count">${cardCount}</span>
            </h3>
            <div class="list-actions">
                <button class="list-action-btn" onclick="deleteList('${list.id}')" title="Delete list">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke-width="2"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="list-cards" id="list-${list.id}" ondrop="handleDrop(event, '${list.id}')" ondragover="handleDragOver(event)">
            ${list.cards && list.cards.length > 0 ? list.cards.map(card => createCardHTML(card)).join('') : '<div class="empty-state"><p>No cards yet</p></div>'}
        </div>
        <div class="list-footer">
            <button class="add-card-btn" onclick="showAddCardModal('${list.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 5v14M5 12h14" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Add Card
            </button>
        </div>
    `;

    return listDiv;
}

// Create card HTML
function createCardHTML(card) {
    const priorityBadge = card.priority ? `<span class="card-priority ${card.priority}">${card.priority}</span>` : '';
    const description = card.description ? `<p class="card-description">${escapeHtml(card.description.substring(0, 100))}${card.description.length > 100 ? '...' : ''}</p>` : '';

    let metaItems = [];

    if (card.due_date) {
        const dueDate = new Date(card.due_date);
        const isOverdue = dueDate < new Date();
        metaItems.push(`
            <div class="card-meta-item ${isOverdue ? 'overdue' : ''}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke-width="2"/>
                    <path d="M12 6v6l4 2" stroke-width="2" stroke-linecap="round"/>
                </svg>
                ${formatDate(dueDate)}
            </div>
        `);
    }

    if (card.assignee) {
        metaItems.push(`
            <div class="card-assignee" title="${escapeHtml(card.assignee.name)}">
                ${card.assignee.profile_pic ? 
                    `<img src="${escapeHtml(card.assignee.profile_pic)}" alt="${escapeHtml(card.assignee.name)}">` :
                    `<div class="avatar-placeholder">${card.assignee.name.charAt(0).toUpperCase()}</div>`
                }
            </div>
        `);
    }

    const checklistCount = card.checklists ? card.checklists.length : 0;
    const checklistCompleted = card.checklists ? card.checklists.filter(item => item.is_completed).length : 0;
    
    if (checklistCount > 0) {
        metaItems.push(`
            <div class="card-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 11l3 3L22 4" stroke-width="2" stroke-linecap="round"/>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke-width="2"/>
                </svg>
                ${checklistCompleted}/${checklistCount}
            </div>
        `);
    }

    const commentCount = card.comments ? card.comments.length : 0;
    if (commentCount > 0) {
        metaItems.push(`
            <div class="card-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke-width="2"/>
                </svg>
                ${commentCount}
            </div>
        `);
    }

    return `
        <div class="card" draggable="true" ondragstart="handleDragStart(event, '${card.id}')" ondragend="handleDragEnd(event)" onclick="showCardDetails('${card.id}')">
            <div class="card-header">
                <h4 class="card-title">${escapeHtml(card.title)}</h4>
                ${priorityBadge}
            </div>
            ${description}
            ${metaItems.length > 0 ? `<div class="card-meta">${metaItems.join('')}</div>` : ''}
        </div>
    `;
} 


// Drag and drop handlers
function handleDragStart(event, cardId) {
    draggedCard = cardId;
    event.target.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
    draggedCard = null;
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
}

async function handleDrop(event, listId) {
    event.preventDefault();
    
    if (!draggedCard) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/boards/cards/${draggedCard}/move`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ new_list_id: listId })
        });

        if (!response.ok) {
            throw new Error('Failed to move card');
        }

        await loadBoard();
        showNotification('Card moved successfully', 'success');
    } catch (error) {
        console.error('Error moving card:', error);
        showNotification('Failed to move card', 'error');
    }
}

// Modal functions
function showAddListModal() {
    document.getElementById('addListModal').classList.add('active');
    document.getElementById('listName').focus();
}

function showAddCardModal(listId) {
    document.getElementById('cardListId').value = listId;
    document.getElementById('addCardModal').classList.add('active');
    document.getElementById('cardTitle').focus();
}

async function showCardDetails(cardId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/boards/cards/${cardId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load card details');
        }

        const card = await response.json();
        renderCardDetails(card);
        document.getElementById('cardDetailsModal').classList.add('active');
    } catch (error) {
        console.error('Error loading card details:', error);
        showNotification('Failed to load card details', 'error');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    
    // Reset forms
    if (modalId === 'addListModal') {
        document.getElementById('addListForm').reset();
    } else if (modalId === 'addCardModal') {
        document.getElementById('addCardForm').reset();
    }
}

// Form handlers
async function handleAddList(event) {
    event.preventDefault();
    
    const name = document.getElementById('listName').value.trim();
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/boards/lists', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                board_id: boardId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create list');
        }

        await loadBoard();
        closeModal('addListModal');
        showNotification('List created successfully', 'success');
    } catch (error) {
        console.error('Error creating list:', error);
        showNotification('Failed to create list', 'error');
    }
}

async function handleAddCard(event) {
    event.preventDefault();
    
    const title = document.getElementById('cardTitle').value.trim();
    const description = document.getElementById('cardDescription').value.trim();
    const priority = document.getElementById('cardPriority').value;
    const due_date = document.getElementById('cardDueDate').value;
    const list_id = document.getElementById('cardListId').value;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/boards/cards', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                description: description || undefined,
                priority,
                due_date: due_date || undefined,
                list_id
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create card');
        }

        await loadBoard();
        closeModal('addCardModal');
        showNotification('Card created successfully', 'success');
    } catch (error) {
        console.error('Error creating card:', error);
        showNotification('Failed to create card', 'error');
    }
}

// Delete functions
async function deleteList(listId) {
    if (!confirm('Are you sure you want to delete this list? All cards in this list will also be deleted.')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/boards/lists/${listId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete list');
        }

        await loadBoard();
        showNotification('List deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting list:', error);
        showNotification('Failed to delete list', 'error');
    }
}

async function deleteCard(cardId) {
    if (!confirm('Are you sure you want to delete this card?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/boards/cards/${cardId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete card');
        }

        closeModal('cardDetailsModal');
        await loadBoard();
        showNotification('Card deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting card:', error);
        showNotification('Failed to delete card', 'error');
    }
}

// Render card details
function renderCardDetails(card) {
    const detailsBody = document.getElementById('cardDetailsBody');
    document.getElementById('cardDetailsTitle').textContent = card.title;

    const checklistHTML = card.checklists && card.checklists.length > 0 ? `
        <div class="card-section">
            <h3>Checklist</h3>
            <div class="checklist">
                ${card.checklists.map(item => `
                    <div class="checklist-item">
                        <input type="checkbox" ${item.is_completed ? 'checked' : ''} 
                            onchange="toggleChecklistItem('${item.id}')">
                        <span class="${item.is_completed ? 'completed' : ''}">${escapeHtml(item.content)}</span>
                    </div>
                `).join('')}
            </div>
            <button class="btn-text" onclick="showAddChecklistItem('${card.id}')">+ Add item</button>
        </div>
    ` : '';

    const commentsHTML = card.comments && card.comments.length > 0 ? `
        <div class="card-section">
            <h3>Comments</h3>
            <div class="comments">
                ${card.comments.map(comment => `
                    <div class="comment">
                        <div class="comment-header">
                            ${comment.user.profile_pic ? 
                                `<img src="${escapeHtml(comment.user.profile_pic)}" alt="${escapeHtml(comment.user.name)}" class="comment-avatar">` :
                                `<div class="avatar-placeholder">${comment.user.name.charAt(0).toUpperCase()}</div>`
                            }
                            <div>
                                <strong>${escapeHtml(comment.user.name)}</strong>
                                <span class="comment-time">${formatDate(new Date(comment.created_at))}</span>
                            </div>
                        </div>
                        <p class="comment-content">${escapeHtml(comment.content)}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    detailsBody.innerHTML = `
        <div class="card-details-content">
            <div class="card-main">
                ${card.description ? `
                    <div class="card-section">
                        <h3>Description</h3>
                        <p>${escapeHtml(card.description)}</p>
                    </div>
                ` : ''}
                
                ${checklistHTML}
                ${commentsHTML}
                
                <div class="card-section">
                    <h3>Add Comment</h3>
                    <form onsubmit="handleAddComment(event, '${card.id}')">
                        <textarea id="commentContent" rows="3" placeholder="Write a comment..." required></textarea>
                        <button type="submit" class="btn-primary">Add Comment</button>
                    </form>
                </div>
            </div>
            
            <div class="card-sidebar">
                <div class="card-info">
                    <h3>Details</h3>
                    
                    ${card.priority ? `
                        <div class="info-item">
                            <label>Priority</label>
                            <span class="card-priority ${card.priority}">${card.priority}</span>
                        </div>
                    ` : ''}
                    
                    ${card.due_date ? `
                        <div class="info-item">
                            <label>Due Date</label>
                            <span>${formatDate(new Date(card.due_date))}</span>
                        </div>
                    ` : ''}
                    
                    ${card.assignee ? `
                        <div class="info-item">
                            <label>Assigned To</label>
                            <div class="assignee-info">
                                ${card.assignee.profile_pic ? 
                                    `<img src="${escapeHtml(card.assignee.profile_pic)}" alt="${escapeHtml(card.assignee.name)}">` :
                                    `<div class="avatar-placeholder">${card.assignee.name.charAt(0).toUpperCase()}</div>`
                                }
                                <span>${escapeHtml(card.assignee.name)}</span>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="info-item">
                        <label>List</label>
                        <span>${escapeHtml(card.list.name)}</span>
                    </div>
                </div>
                
                <div class="card-actions">
                    <button class="btn-danger" onclick="deleteCard('${card.id}')">Delete Card</button>
                </div>
            </div>
        </div>
    `;
}

// Add comment handler
async function handleAddComment(event, cardId) {
    event.preventDefault();
    
    const content = document.getElementById('commentContent').value.trim();
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/boards/cards/${cardId}/comments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            throw new Error('Failed to add comment');
        }

        document.getElementById('commentContent').value = '';
        await showCardDetails(cardId);
        showNotification('Comment added', 'success');
    } catch (error) {
        console.error('Error adding comment:', error);
        showNotification('Failed to add comment', 'error');
    }
}

// Toggle checklist item
async function toggleChecklistItem(itemId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/boards/checklist/${itemId}/toggle`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to toggle checklist item');
        }

        await loadBoard();
    } catch (error) {
        console.error('Error toggling checklist item:', error);
        showNotification('Failed to update checklist item', 'error');
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(date) {
    const now = new Date();
    const diff = date - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    if (days < 0) return `${Math.abs(days)} days ago`;
    if (days < 7) return `in ${days} days`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function goToDashboard() {
    window.location.href = '/dashboard.html';
}

// Theme functions
function initTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Close modals on outside click
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
});

// Close modals on escape key
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});