// Enhanced Board functionality with full API integration
const API_BASE = '/api';
let currentBoard = null;
let currentLists = [];
let currentCards = [];
let listIdMap = {}; // Map list names to IDs

// Check auth
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

// Fetch with auth wrapper
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

// Get board ID from URL
function getBoardId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Load board data
async function loadBoard() {
    if (!checkAuth()) return;
    
    const boardId = getBoardId();
    if (!boardId) {
        showNotification('Board ID not found', 'error');
        return;
    }

    try {
        showLoading(true);
        
        // Load board details
        const boardRes = await fetchWithAuth(`${API_BASE}/boards/${boardId}`);
        if (!boardRes.ok) {
            throw new Error('Failed to load board');
        }
        
        const boardData = await boardRes.json();
        currentBoard = boardData.data || boardData;
        console.log('📋 Board loaded:', currentBoard);
        console.log('🎨 Board color:', currentBoard.background_color);
        console.log('📦 Full board object:', JSON.stringify(currentBoard, null, 2));
        
        document.getElementById('boardTitle').textContent = currentBoard.name;
        
        // Display list count
        updateListCount();
        
        // Apply board background color if exists
        if (currentBoard.background_color) {
            console.log('✅ Applying color:', currentBoard.background_color);
            applyBoardColor(currentBoard.background_color);
        } else {
            console.log('⚠️ No background_color found in board data');
            console.log('⚠️ Available fields:', Object.keys(currentBoard));
            // Apply default color anyway
            applyBoardColor('#8b5cf6');
        }
        
        // Load lists for this board
        await loadLists();
        
    } catch (error) {
        console.error('Error loading board:', error);
        showNotification('Failed to load board', 'error');
    } finally {
        showLoading(false);
    }
}

// Apply board color
function applyBoardColor(color) {
    console.log('🎨 Applying board color:', color);
    
    // Apply gradient background to body
    document.body.style.background = `linear-gradient(135deg, ${color}20 0%, ${color}05 50%, #0a0a0f 100%)`;
    
    // Update header background
    const header = document.querySelector('header');
    if (header) {
        header.style.background = `linear-gradient(90deg, ${color}15 0%, rgba(26, 26, 46, 0.6) 100%)`;
        header.style.backdropFilter = 'blur(20px)';
    }
    
    // Update floating shapes with the selected color
    const shapes = document.querySelectorAll('.floating-shape');
    if (shapes.length > 0) {
        shapes[0].style.background = color;
        shapes[1].style.background = color;
        shapes[2].style.background = color;
    }
    
    // Add accent color to lists
    const lists = document.querySelectorAll('.glass-effect');
    lists.forEach(list => {
        list.style.borderColor = `${color}30`;
    });
    
    console.log('✅ Color applied successfully!');
}

// Load lists and cards
async function loadLists() {
    const boardId = getBoardId();
    
    try {
        // Load lists from the board data
        if (currentBoard && currentBoard.lists) {
            currentLists = currentBoard.lists;
            
            // Create a map of list names to IDs for easy lookup
            currentBoard.lists.forEach(list => {
                const listName = list.name.toLowerCase().replace(/\s+/g, '');
                listIdMap[listName] = list.id;
            });
            
            console.log('📝 List ID Map:', listIdMap);
        }
        
        // Render the lists UI
        renderListsUI();
        
        // Load cards for each list
        await loadCards();
        
    } catch (error) {
        console.error('Error loading lists:', error);
        showNotification('Failed to load lists', 'error');
    }
}

// Ensure default lists exist (To Do, In Progress, Done)
async function ensureDefaultLists() {
    const boardId = getBoardId();
    const defaultLists = [
        { name: 'To Do', position: 1 },
        { name: 'In Progress', position: 2 },
        { name: 'Done', position: 3 }
    ];
    
    // Create lists if they don't exist
    for (const listData of defaultLists) {
        try {
            await fetchWithAuth(`${API_BASE}/boards/lists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: listData.name,
                    board_id: boardId,
                    position: listData.position
                })
            });
        } catch (error) {
            // List might already exist, that's okay
            console.log(`List "${listData.name}" might already exist`);
        }
    }
    
    // Render the lists UI
    renderListsUI();
}

// Update list count display
function updateListCount() {
    const listCountElement = document.getElementById('listCount');
    if (listCountElement && currentBoard && currentBoard.lists) {
        const activeListCount = currentBoard.lists.filter(list => !list.deleted_at).length;
        listCountElement.textContent = `${activeListCount} list${activeListCount !== 1 ? 's' : ''}`;
    }
}

// Render lists UI
function renderListsUI() {
    const container = document.getElementById('boardContainer');
    
    if (!currentBoard || !currentBoard.lists || currentBoard.lists.length === 0) {
        container.innerHTML = `
            <div class="flex-shrink-0 w-80">
                <div class="glass-effect rounded-xl p-4 text-center">
                    <p class="text-gray-400 mb-4">No lists yet</p>
                    <button type="button" onclick="addList()" class="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>Add List
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    // Render each list
    const listsHTML = currentBoard.lists.map(list => {
        const listKey = list.name.toLowerCase().replace(/\s+/g, '');
        return `
            <div class="flex-shrink-0 w-80" data-list="${listKey}" data-list-id="${list.id}">
                <div class="glass-effect rounded-xl p-4">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-white font-semibold">${list.name}</h3>
                        <div class="flex gap-1">
                            <button type="button" onclick="addCard('${listKey}', '${list.id}')" class="p-1 hover:bg-purple-500/10 rounded text-gray-400 hover:text-white">
                                <i class="fas fa-plus"></i>
                            </button>
                            ${list.name !== 'To Do' && list.name !== 'In Progress' && list.name !== 'Done' ? `
                            <button type="button" onclick="deleteList('${list.id}')" class="p-1 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-400">
                                <i class="fas fa-trash"></i>
                            </button>
                            ` : ''}
                        </div>
                    </div>
                    <div id="${listKey}Cards" class="space-y-3 min-h-[200px] list-droppable">
                        <div class="text-center text-gray-500 text-sm py-4" id="${listKey}Empty">No cards yet</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = listsHTML + `
        <div class="flex-shrink-0 w-80">
            <button type="button" onclick="addList()" class="w-full glass-effect rounded-xl p-4 text-gray-400 hover:text-white hover:bg-purple-500/10 transition-all border-2 border-dashed border-gray-600 hover:border-purple-500">
                <i class="fas fa-plus mr-2"></i>Add Another List
            </button>
        </div>
    `;
    
    // Initialize drag and drop after rendering
    setTimeout(initializeDragAndDrop, 100);
}

// Initialize drag and drop
function initializeDragAndDrop() {
    const lists = document.querySelectorAll('.list-droppable');
    
    lists.forEach(list => {
        new Sortable(list, {
            group: 'shared-cards',
            animation: 200,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            filter: '.text-center', // Don't drag empty state
            onEnd: function(evt) {
                const cardId = evt.item.getAttribute('data-card-id');
                const fromList = evt.from.id;
                const toList = evt.to.id;
                
                if (fromList !== toList) {
                    showNotification(`Card moved to ${toList.replace('Cards', '')}!`, 'success');
                }
                
                // Update empty states
                updateEmptyStates();
            }
        });
    });
}

// Load cards from API
async function loadCards() {
    if (!currentBoard || !currentBoard.lists) return;
    
    try {
        // Cards are already loaded with the board data
        currentBoard.lists.forEach(list => {
            const listKey = list.name.toLowerCase().replace(/\s+/g, '');
            const container = document.getElementById(listKey + 'Cards');
            const emptyState = document.getElementById(listKey + 'Empty');
            
            if (!container) return;
            
            if (list.cards && list.cards.length > 0) {
                // Hide empty state
                if (emptyState) emptyState.style.display = 'none';
                
                // Add each card to the UI
                list.cards.forEach(card => {
                    const cardElement = createCardElement(card);
                    container.appendChild(cardElement);
                });
            }
        });
        
        updateEmptyStates();
    } catch (error) {
        console.error('Error loading cards:', error);
    }
}

// Update empty states
function updateEmptyStates() {
    const lists = ['todo', 'progress', 'done'];
    lists.forEach(listType => {
        const container = document.getElementById(listType + 'Cards');
        const emptyState = document.getElementById(listType + 'Empty');
        const hasCards = container.children.length > 1; // More than just empty state
        
        if (emptyState) {
            emptyState.style.display = hasCards ? 'none' : 'block';
        }
    });
}

// Add new list
async function addList() {
    showModal('addList');
}

// Show add list modal
function showModal(type) {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'customModal';
    modalContainer.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modalContainer.onclick = (e) => { if (e.target === modalContainer) closeCustomModal(); };
    
    if (type === 'addList') {
        modalContainer.innerHTML = `
            <div class="glass-effect rounded-2xl p-8 max-w-md w-full" onclick="event.stopPropagation()">
                <h2 class="text-2xl font-bold text-white mb-6">Add New List</h2>
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-300 text-sm mb-2">List Name</label>
                        <input type="text" id="listNameInput" placeholder="New List" 
                            class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none">
                    </div>
                </div>
                <div class="flex gap-3 mt-6">
                    <button type="button" onclick="closeCustomModal()" class="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all">
                        Cancel
                    </button>
                    <button type="button" onclick="submitList()" class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all">
                        Create List
                    </button>
                </div>
            </div>
        `;
    }
    
    document.body.appendChild(modalContainer);
    setTimeout(() => document.getElementById('listNameInput')?.focus(), 100);
}

// Submit list
async function submitList() {
    const listName = document.getElementById('listNameInput').value.trim();
    if (!listName) {
        showNotification('Please enter a list name', 'error');
        return;
    }
    
    const boardId = getBoardId();
    
    try {
        showLoading(true);
        closeCustomModal();
        
        const response = await fetchWithAuth(`${API_BASE}/boards/lists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: listName,
                board_id: boardId,
                position: currentLists.length + 1
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create list');
        }
        
        const result = await response.json();
        showNotification('List created successfully!', 'success');
        
        // Add the new list to UI
        addListToUI(result.data || result, listName);
        
        // Update list count
        if (currentBoard.lists) {
            currentBoard.lists.push(result.data || result);
            updateListCount();
        }
        
    } catch (error) {
        console.error('Error creating list:', error);
        showNotification('Failed to create list', 'error');
    } finally {
        showLoading(false);
    }
}

// Close custom modal
function closeCustomModal() {
    const modal = document.getElementById('customModal');
    if (modal) modal.remove();
}

// Add list to UI
function addListToUI(listData, listName) {
    const container = document.getElementById('boardContainer');
    const addButton = container.lastElementChild;
    
    const newListElement = document.createElement('div');
    newListElement.className = 'flex-shrink-0 w-80';
    newListElement.setAttribute('data-list-id', listData.id);
    
    newListElement.innerHTML = `
        <div class="glass-effect rounded-xl p-4">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-white font-semibold">${listName}</h3>
                <div class="flex gap-1">
                    <button type="button" onclick="addCardToList('${listData.id}')" class="p-1 hover:bg-purple-500/10 rounded text-gray-400 hover:text-white">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button type="button" onclick="deleteList('${listData.id}')" class="p-1 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-400">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div id="list-${listData.id}-cards" class="space-y-3 min-h-[200px]">
                <div class="text-center text-gray-500 text-sm py-4">No cards yet</div>
            </div>
        </div>
    `;
    
    container.insertBefore(newListElement, addButton);
}

// Add new card
async function addCard(listType, listId) {
    // If listId is not provided, try to get it from the map
    if (!listId) {
        listId = listIdMap[listType];
    }
    
    if (!listId) {
        showNotification('List ID not found', 'error');
        console.error('List ID not found for:', listType);
        return;
    }
    
    showCardModal(listType, null, listId);
}

// Show card modal
function showCardModal(listType, cardData = null, listId = null) {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'customModal';
    modalContainer.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modalContainer.onclick = (e) => { if (e.target === modalContainer) closeCustomModal(); };
    
    const isEdit = cardData !== null;
    const selectedColor = (isEdit && cardData.color) ? cardData.color : '#1a1a2e';
    
    modalContainer.innerHTML = `
        <div class="glass-effect rounded-2xl p-8 max-w-md w-full" onclick="event.stopPropagation()">
            <h2 class="text-2xl font-bold text-white mb-6">${isEdit ? 'Edit Card' : 'Add New Card'}</h2>
            <div class="space-y-4">
                <div>
                    <label class="block text-gray-300 text-sm mb-2">Card Title</label>
                    <input type="text" id="cardTitleInput" placeholder="New Task" value="${isEdit ? cardData.title : ''}"
                        class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none">
                </div>
                <div>
                    <label class="block text-gray-300 text-sm mb-2">Description (Optional)</label>
                    <textarea id="cardDescInput" placeholder="Add more details..." rows="3"
                        class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none">${isEdit ? (cardData.description || '') : ''}</textarea>
                </div>
                <div>
                    <label class="block text-gray-300 text-sm mb-2">Card Color</label>
                    <div class="grid grid-cols-6 gap-2">
                        <button type="button" onclick="selectCardColor('#1a1a2e', this)" data-color="#1a1a2e" class="w-full h-10 rounded-lg bg-[#1a1a2e] border-2 ${selectedColor === '#1a1a2e' ? 'border-white' : 'border-transparent'} hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#ef4444', this)" data-color="#ef4444" class="w-full h-10 rounded-lg bg-red-500 border-2 ${selectedColor === '#ef4444' ? 'border-white' : 'border-transparent'} hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#f59e0b', this)" data-color="#f59e0b" class="w-full h-10 rounded-lg bg-orange-500 border-2 ${selectedColor === '#f59e0b' ? 'border-white' : 'border-transparent'} hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#10b981', this)" data-color="#10b981" class="w-full h-10 rounded-lg bg-green-500 border-2 ${selectedColor === '#10b981' ? 'border-white' : 'border-transparent'} hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#3b82f6', this)" data-color="#3b82f6" class="w-full h-10 rounded-lg bg-blue-500 border-2 ${selectedColor === '#3b82f6' ? 'border-white' : 'border-transparent'} hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#8b5cf6', this)" data-color="#8b5cf6" class="w-full h-10 rounded-lg bg-purple-500 border-2 ${selectedColor === '#8b5cf6' ? 'border-white' : 'border-transparent'} hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#ec4899', this)" data-color="#ec4899" class="w-full h-10 rounded-lg bg-pink-500 border-2 ${selectedColor === '#ec4899' ? 'border-white' : 'border-transparent'} hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#06b6d4', this)" data-color="#06b6d4" class="w-full h-10 rounded-lg bg-cyan-500 border-2 ${selectedColor === '#06b6d4' ? 'border-white' : 'border-transparent'} hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#84cc16', this)" data-color="#84cc16" class="w-full h-10 rounded-lg bg-lime-500 border-2 ${selectedColor === '#84cc16' ? 'border-white' : 'border-transparent'} hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#f97316', this)" data-color="#f97316" class="w-full h-10 rounded-lg bg-orange-600 border-2 ${selectedColor === '#f97316' ? 'border-white' : 'border-transparent'} hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#14b8a6', this)" data-color="#14b8a6" class="w-full h-10 rounded-lg bg-teal-500 border-2 ${selectedColor === '#14b8a6' ? 'border-white' : 'border-transparent'} hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#a855f7', this)" data-color="#a855f7" class="w-full h-10 rounded-lg bg-purple-600 border-2 ${selectedColor === '#a855f7' ? 'border-white' : 'border-transparent'} hover:border-gray-400 transition-all"></button>
                    </div>
                    <input type="hidden" id="cardColorInput" value="${selectedColor}">
                </div>
            </div>
            <div class="flex gap-3 mt-6">
                <button type="button" onclick="closeCustomModal()" class="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all">
                    Cancel
                </button>
                <button type="button" onclick="${isEdit ? `submitEditCard('${cardData.id}')` : `submitCard('${listType}', '${listId}')`}" class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all">
                    ${isEdit ? 'Update' : 'Create'} Card
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalContainer);
    setTimeout(() => document.getElementById('cardTitleInput')?.focus(), 100);
}

// Select card color
function selectCardColor(color, button) {
    // Remove border from all color buttons
    const colorButtons = document.querySelectorAll('[data-color]');
    colorButtons.forEach(btn => {
        btn.classList.remove('border-white');
        btn.classList.add('border-transparent');
    });
    
    // Add border to selected button
    button.classList.remove('border-transparent');
    button.classList.add('border-white');
    
    // Update hidden input
    document.getElementById('cardColorInput').value = color;
}

// Submit card
async function submitCard(listType, listId) {
    const cardTitle = document.getElementById('cardTitleInput').value.trim();
    const cardDescription = document.getElementById('cardDescInput').value.trim();
    const cardColor = document.getElementById('cardColorInput').value;
    
    if (!cardTitle) {
        showNotification('Please enter a card title', 'error');
        return;
    }
    
    // Get listId if not provided
    if (!listId) {
        listId = listIdMap[listType];
    }
    
    if (!listId) {
        showNotification('List not found. Please refresh the page.', 'error');
        return;
    }
    
    try {
        showLoading(true);
        closeCustomModal();
        
        // Save to API
        const response = await fetchWithAuth(`${API_BASE}/boards/cards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: cardTitle,
                list_id: listId,
                description: cardDescription,
                priority: 'MEDIUM',
                color: cardColor
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create card');
        }
        
        const result = await response.json();
        const card = result.data || result;
        
        // Add card to UI
        const container = document.getElementById(listType + 'Cards');
        const emptyState = document.getElementById(listType + 'Empty');
        if (emptyState) emptyState.style.display = 'none';
        
        const cardElement = createCardElement(card);
        container.appendChild(cardElement);
        
        showNotification('Card saved successfully!', 'success');
        updateEmptyStates();
        
    } catch (error) {
        console.error('Error creating card:', error);
        showNotification(error.message || 'Failed to create card', 'error');
    } finally {
        showLoading(false);
    }
}

// Add card to specific list
async function addCardToList(listId) {
    showCardModalForList(listId);
}

// Show card modal for specific list
function showCardModalForList(listId) {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'customModal';
    modalContainer.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modalContainer.onclick = (e) => { if (e.target === modalContainer) closeCustomModal(); };
    
    modalContainer.innerHTML = `
        <div class="glass-effect rounded-2xl p-8 max-w-md w-full" onclick="event.stopPropagation()">
            <h2 class="text-2xl font-bold text-white mb-6">Add New Card</h2>
            <div class="space-y-4">
                <div>
                    <label class="block text-gray-300 text-sm mb-2">Card Title</label>
                    <input type="text" id="cardTitleInput" placeholder="New Task"
                        class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none">
                </div>
                <div>
                    <label class="block text-gray-300 text-sm mb-2">Description (Optional)</label>
                    <textarea id="cardDescInput" placeholder="Add more details..." rows="3"
                        class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none"></textarea>
                </div>
                <div>
                    <label class="block text-gray-300 text-sm mb-2">Card Color</label>
                    <div class="grid grid-cols-6 gap-2">
                        <button type="button" onclick="selectCardColor('#1a1a2e', this)" data-color="#1a1a2e" class="w-full h-10 rounded-lg bg-[#1a1a2e] border-2 border-white hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#ef4444', this)" data-color="#ef4444" class="w-full h-10 rounded-lg bg-red-500 border-2 border-transparent hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#f59e0b', this)" data-color="#f59e0b" class="w-full h-10 rounded-lg bg-orange-500 border-2 border-transparent hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#10b981', this)" data-color="#10b981" class="w-full h-10 rounded-lg bg-green-500 border-2 border-transparent hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#3b82f6', this)" data-color="#3b82f6" class="w-full h-10 rounded-lg bg-blue-500 border-2 border-transparent hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#8b5cf6', this)" data-color="#8b5cf6" class="w-full h-10 rounded-lg bg-purple-500 border-2 border-transparent hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#ec4899', this)" data-color="#ec4899" class="w-full h-10 rounded-lg bg-pink-500 border-2 border-transparent hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#06b6d4', this)" data-color="#06b6d4" class="w-full h-10 rounded-lg bg-cyan-500 border-2 border-transparent hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#84cc16', this)" data-color="#84cc16" class="w-full h-10 rounded-lg bg-lime-500 border-2 border-transparent hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#f97316', this)" data-color="#f97316" class="w-full h-10 rounded-lg bg-orange-600 border-2 border-transparent hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#14b8a6', this)" data-color="#14b8a6" class="w-full h-10 rounded-lg bg-teal-500 border-2 border-transparent hover:border-gray-400 transition-all"></button>
                        <button type="button" onclick="selectCardColor('#a855f7', this)" data-color="#a855f7" class="w-full h-10 rounded-lg bg-purple-600 border-2 border-transparent hover:border-gray-400 transition-all"></button>
                    </div>
                    <input type="hidden" id="cardColorInput" value="#1a1a2e">
                </div>
            </div>
            <div class="flex gap-3 mt-6">
                <button type="button" onclick="closeCustomModal()" class="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all">
                    Cancel
                </button>
                <button type="button" onclick="submitCardToList('${listId}')" class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all">
                    Create Card
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalContainer);
    setTimeout(() => document.getElementById('cardTitleInput')?.focus(), 100);
}

// Submit card to specific list
async function submitCardToList(listId) {
    const cardTitle = document.getElementById('cardTitleInput').value.trim();
    const cardDescription = document.getElementById('cardDescInput').value.trim();
    const cardColor = document.getElementById('cardColorInput').value;
    
    if (!cardTitle) {
        showNotification('Please enter a card title', 'error');
        return;
    }
    
    try {
        showLoading(true);
        closeCustomModal();
        
        const response = await fetchWithAuth(`${API_BASE}/boards/cards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: cardTitle,
                list_id: listId,
                description: cardDescription,
                priority: 'MEDIUM',
                color: cardColor
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create card');
        }
        
        const result = await response.json();
        const card = result.data || result;
        
        // Add card to UI
        const container = document.getElementById(`list-${listId}-cards`);
        const emptyState = container.querySelector('.text-center');
        if (emptyState) emptyState.style.display = 'none';
        
        const cardElement = createCardElement(card);
        container.appendChild(cardElement);
        
        showNotification('Card created successfully!', 'success');
        
    } catch (error) {
        console.error('Error creating card:', error);
        showNotification('Failed to create card', 'error');
    } finally {
        showLoading(false);
    }
}

// Add card to UI
function addCardToUI(listType, cardData) {
    const container = document.getElementById(listType + 'Cards');
    const emptyState = document.getElementById(listType + 'Empty');
    
    if (emptyState) emptyState.style.display = 'none';
    
    const cardElement = createCardElement(cardData);
    container.appendChild(cardElement);
}

// Create card element
function createCardElement(cardData) {
    const cardElement = document.createElement('div');
    const cardColor = cardData.color || '#1a1a2e';
    cardElement.className = 'border border-gray-700 rounded-lg p-3 card-hover cursor-pointer';
    cardElement.style.backgroundColor = cardColor;
    cardElement.setAttribute('data-card-id', cardData.id);
    
    const createdDate = new Date(cardData.created_at).toLocaleDateString();
    
    cardElement.innerHTML = `
        <h4 class="text-white font-medium mb-2">${cardData.title}</h4>
        ${cardData.description ? `<p class="text-gray-300 text-sm mb-2">${cardData.description}</p>` : ''}
        <div class="flex items-center justify-between text-xs text-gray-400">
            <span><i class="far fa-clock mr-1"></i>${createdDate}</span>
            <div class="flex gap-2">
                <button type="button" onclick="editCard('${cardData.id}')" class="text-blue-400 hover:text-blue-300">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" onclick="deleteCard('${cardData.id}', this)" class="text-red-400 hover:text-red-300">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    return cardElement;
}

// Edit card
async function editCard(cardId) {
    const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
    const currentTitle = cardElement.querySelector('h4').textContent;
    const currentDesc = cardElement.querySelector('p')?.textContent || '';
    const currentColor = cardElement.style.backgroundColor || '#1a1a2e';
    
    // Convert RGB to hex if needed
    let hexColor = currentColor;
    if (currentColor.startsWith('rgb')) {
        const rgb = currentColor.match(/\d+/g);
        hexColor = '#' + rgb.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
    }
    
    showCardModal(null, {
        id: cardId,
        title: currentTitle,
        description: currentDesc,
        color: hexColor
    });
}

// Submit edit card
async function submitEditCard(cardId) {
    const newTitle = document.getElementById('cardTitleInput').value.trim();
    const newDesc = document.getElementById('cardDescInput').value.trim();
    const newColor = document.getElementById('cardColorInput').value;
    
    if (!newTitle) {
        showNotification('Please enter a card title', 'error');
        return;
    }
    
    try {
        closeCustomModal();
        
        // Update UI immediately
        const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
        cardElement.style.backgroundColor = newColor;
        cardElement.querySelector('h4').textContent = newTitle;
        const descElement = cardElement.querySelector('p');
        if (newDesc) {
            if (descElement) {
                descElement.textContent = newDesc;
            } else {
                const titleElement = cardElement.querySelector('h4');
                titleElement.insertAdjacentHTML('afterend', `<p class="text-gray-300 text-sm mb-2">${newDesc}</p>`);
            }
        } else if (descElement) {
            descElement.remove();
        }
        
        showNotification('Card updated!', 'success');
        
    } catch (error) {
        console.error('Error updating card:', error);
        showNotification('Failed to update card', 'error');
    }
}

// Delete card
async function deleteCard(cardId, buttonElement) {
    if (!confirm('Delete this card?')) return;
    
    try {
        showLoading(true);
        
        // Remove from UI
        const cardElement = buttonElement.closest('[data-card-id]');
        cardElement.remove();
        
        showNotification('Card deleted', 'info');
        updateEmptyStates();
        
    } catch (error) {
        console.error('Error deleting card:', error);
        showNotification('Failed to delete card', 'error');
    } finally {
        showLoading(false);
    }
}

// Delete list
async function deleteList(listId) {
    if (!confirm('Delete this list and all its cards?')) return;
    
    try {
        showLoading(true);
        
        const response = await fetchWithAuth(`${API_BASE}/boards/lists/${listId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete list');
        }
        
        // Remove from UI
        const listElement = document.querySelector(`[data-list-id="${listId}"]`);
        if (listElement) {
            listElement.remove();
        }
        
        // Update list count
        if (currentBoard.lists) {
            currentBoard.lists = currentBoard.lists.filter(list => list.id !== listId);
            updateListCount();
        }
        
        showNotification('List deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting list:', error);
        showNotification('Failed to delete list', 'error');
    } finally {
        showLoading(false);
    }
}

// Go back to dashboard
function goBack() {
    window.location.href = '/dashboard.html';
}

// Show loading state
function showLoading(show) {
    const existingLoader = document.getElementById('loader');
    
    if (show && !existingLoader) {
        const loader = document.createElement('div');
        loader.id = 'loader';
        loader.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        loader.innerHTML = `
            <div class="glass-effect rounded-xl p-6 flex items-center gap-3">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                <span class="text-white">Loading...</span>
            </div>
        `;
        document.body.appendChild(loader);
    } else if (!show && existingLoader) {
        existingLoader.remove();
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const colors = {
        'success': 'bg-green-500/20 border-2 border-green-500 text-green-400',
        'error': 'bg-red-500/20 border-2 border-red-500 text-red-400',
        'info': 'bg-blue-500/20 border-2 border-blue-500 text-blue-400'
    };
    
    const notification = document.getElementById('notification');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl font-medium ${colors[type]}`;
    notification.textContent = message;
    notification.style.transform = 'translateX(0)';
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
    }, 4000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBoard();
});

// Make functions globally available
window.addList = addList;
window.submitList = submitList;
window.addCard = addCard;
window.submitCard = submitCard;
window.addCardToList = addCardToList;
window.submitCardToList = submitCardToList;
window.editCard = editCard;
window.submitEditCard = submitEditCard;
window.deleteCard = deleteCard;
window.deleteList = deleteList;
window.goBack = goBack;
window.closeCustomModal = closeCustomModal;
window.initializeDragAndDrop = initializeDragAndDrop;
window.applyBoardColor = applyBoardColor;
window.updateListCount = updateListCount;
window.selectCardColor = selectCardColor;