// Initial favorites data
let favorites = [
    { id: 1, title: 'Google', url: 'https://google.com', iconType: 'default', iconData: null },
    { id: 2, title: 'YouTube', url: 'https://youtube.com', iconType: 'default', iconData: null },
    { id: 3, title: 'Facebook', url: 'https://facebook.com', iconType: 'default', iconData: null },
    { id: 4, title: 'Twitter', url: 'https://twitter.com', iconType: 'default', iconData: null },
    { id: 5, title: 'Instagram', url: 'https://instagram.com', iconType: 'default', iconData: null },
    { id: 6, title: 'LinkedIn', url: 'https://linkedin.com', iconType: 'default', iconData: null }
];

// DOM elements
const timeElement = document.getElementById('current-time');
const dateElement = document.getElementById('current-date');
const favoritesContainer = document.getElementById('favorites-container');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const backgroundUrlInput = document.getElementById('background-url');
const backgroundFileInput = document.getElementById('background-file');
const editModal = document.getElementById('edit-modal');
const modalTitle = document.getElementById('modal-title');
const favoriteTitleInput = document.getElementById('favorite-title');
const favoriteUrlInput = document.getElementById('favorite-url');
const modalCancel = document.getElementById('modal-cancel');
const modalSave = document.getElementById('modal-save');
const searchInput = document.querySelector('.search-box input');
const contextMenu = document.getElementById('context-menu');

// New icon-related DOM elements
const defaultIcon = document.getElementById('default-icon');
const defaultIconLetter = document.getElementById('default-icon-letter');
const customIconInput = document.getElementById('custom-icon');
const customIconPreview = document.getElementById('custom-icon-preview');
const customIconPreviewImg = document.getElementById('icon-preview-img');
const iconUrlInput = document.getElementById('icon-url');
const urlIconPreview = document.getElementById('url-icon-preview');
const urlIconImg = document.getElementById('url-icon-img');

// Variables for editing
let editingFavoriteId = null;
let draggedItem = null;
let currentIconType = 'default';
let currentIconData = null;
let activeContextMenuId = null;

// Maximum number of slots in the grid (6 columns x 3 rows)
const MAX_SLOTS = 12;

// Update clock
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}`;
    
    // Update the date with day of week, day, month
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayOfWeek = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    
    dateElement.textContent = `${dayOfWeek}, ${day} ${month}`;
}

// Initialize and update clock every second
updateClock();
setInterval(updateClock, 1000);

// Load favorites from localStorage
function loadFavorites() {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
    }
    renderFavorites();
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Create icon based on type and data
function createIconElement(favorite) {
    const iconContainer = document.createElement('div');
    iconContainer.className = 'favorite-icon';
    
    if (favorite.iconType === 'default' || !favorite.iconType) {
        // Default letter icon
        iconContainer.textContent = favorite.title.charAt(0);
    } else if (favorite.iconType === 'custom' || favorite.iconType === 'url') {
        // Custom icon from file or URL
        const img = document.createElement('img');
        img.src = favorite.iconData;
        iconContainer.innerHTML = '';
        iconContainer.appendChild(img);
    }
    
    return iconContainer;
}

// Render favorites
function renderFavorites() {
    favoritesContainer.innerHTML = '';
    
    // Render existing favorites
    favorites.forEach(favorite => {
        const favoriteElement = document.createElement('div');
        favoriteElement.className = 'favorite-item';
        favoriteElement.setAttribute('draggable', 'true');
        favoriteElement.setAttribute('data-id', favorite.id);
        
        const iconElement = createIconElement(favorite);
        
        favoriteElement.innerHTML = `
            <div class="favorite-title">${favorite.title}</div>
        `;
        
        // Insert the icon at the beginning
        favoriteElement.insertBefore(iconElement, favoriteElement.firstChild);
        
        favoriteElement.addEventListener('click', (e) => {
            window.location.href = favorite.url;
        });
        
        // Right-click context menu
        favoriteElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, favorite.id);
        });
        
        // Drag events
        favoriteElement.addEventListener('dragstart', handleDragStart);
        favoriteElement.addEventListener('dragover', handleDragOver);
        favoriteElement.addEventListener('drop', handleDrop);
        favoriteElement.addEventListener('dragend', handleDragEnd);
        
        favoritesContainer.appendChild(favoriteElement);
    });
    
    // Calculate remaining slots
    const totalElements = favorites.length;
    const remainingSlots = MAX_SLOTS - totalElements;
    
    // Add placeholder slots that act as "add new" buttons
    if (remainingSlots > 0) {
        for (let i = 0; i < remainingSlots; i++) {
            const placeholder = document.createElement('div');
            placeholder.className = 'tab-placeholder';
            
            // Add a subtle plus indicator to show it's clickable
            const plusIndicator = document.createElement('div');
            plusIndicator.className = 'plus-indicator';
            plusIndicator.innerHTML = '+';
            placeholder.appendChild(plusIndicator);
            
            // Add click event to open the add modal
            placeholder.addEventListener('click', () => {
                showAddModal();
            });
            
            favoritesContainer.appendChild(placeholder);
        }
    }
}

// Show context menu
function showContextMenu(e, id) {
    const contextMenu = document.getElementById('context-menu');
    
    // Position the menu
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
    
    // Store the active favorite id
    activeContextMenuId = id;
    
    // Show the menu
    contextMenu.classList.add('active');
}

// Handle context menu actions
function handleContextMenuAction(action) {
    if (!activeContextMenuId) return;
    
    if (action === 'edit') {
        editFavorite(activeContextMenuId);
    } else if (action === 'delete') {
        deleteFavorite(activeContextMenuId);
    }
    
    // Hide the menu
    document.getElementById('context-menu').classList.remove('active');
    activeContextMenuId = null;
}

// Drag and drop functionality
function handleDragStart(e) {
    draggedItem = this;
    setTimeout(() => {
        this.style.opacity = '0.4';
    }, 0);
}

function handleDragOver(e) {
    e.preventDefault();
    return false;
}

function handleDrop(e) {
    e.stopPropagation();
    
    if (draggedItem !== this) {
        // Get the indexes
        const items = Array.from(favoritesContainer.querySelectorAll('.favorite-item'));
        const fromIndex = items.indexOf(draggedItem);
        const toIndex = items.indexOf(this);
        
        // Reorder favorites array
        const movedItem = favorites.splice(fromIndex, 1)[0];
        favorites.splice(toIndex, 0, movedItem);
        
        // Save and render
        saveFavorites();
        renderFavorites();
    }
    
    return false;
}

function handleDragEnd(e) {
    this.style.opacity = '1';
}

// Reset icon selection in modal
function resetIconSelection() {
    // Reset active state
    defaultIcon.classList.add('active');
    customIconPreview.classList.remove('active');
    urlIconPreview.classList.remove('active');
    
    // Reset previews
    defaultIconLetter.textContent = 'A';
    customIconPreviewImg.style.display = 'none';
    urlIconImg.style.display = 'none';
    
    // Reset inputs
    customIconInput.value = '';
    iconUrlInput.value = '';
    
    // Reset current selection
    currentIconType = 'default';
    currentIconData = null;
}

// Add a new favorite
function showAddModal() {
    modalTitle.textContent = 'Добавить закладку';
    favoriteTitleInput.value = '';
    favoriteUrlInput.value = '';
    editingFavoriteId = null;
    
    resetIconSelection();
    
    editModal.classList.add('active');
}

// Edit a favorite
function editFavorite(id) {
    const favorite = favorites.find(f => f.id === id);
    if (favorite) {
        modalTitle.textContent = 'Изменить закладку';
        favoriteTitleInput.value = favorite.title;
        favoriteUrlInput.value = favorite.url;
        editingFavoriteId = id;
        
        // Set icon type and preview
        resetIconSelection();
        
        if (favorite.iconType === 'default' || !favorite.iconType) {
            defaultIcon.classList.add('active');
            defaultIconLetter.textContent = favorite.title.charAt(0);
            currentIconType = 'default';
        } else if (favorite.iconType === 'custom') {
            defaultIcon.classList.remove('active');
            customIconPreview.classList.add('active');
            customIconPreviewImg.src = favorite.iconData;
            customIconPreviewImg.style.display = 'block';
            currentIconType = 'custom';
            currentIconData = favorite.iconData;
        } else if (favorite.iconType === 'url') {
            defaultIcon.classList.remove('active');
            urlIconPreview.classList.add('active');
            urlIconImg.src = favorite.iconData;
            urlIconImg.style.display = 'block';
            iconUrlInput.value = favorite.iconData;
            currentIconType = 'url';
            currentIconData = favorite.iconData;
        }
        
        editModal.classList.add('active');
    }
}

// Delete a favorite
function deleteFavorite(id) {
    favorites = favorites.filter(f => f.id !== id);
    saveFavorites();
    renderFavorites();
}

// Save a favorite from modal
function saveFavorite() {
    const title = favoriteTitleInput.value.trim();
    let url = favoriteUrlInput.value.trim();
    
    if (!title || !url) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    // Add http:// if missing
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }
    
    const favoriteData = {
        title,
        url,
        iconType: currentIconType,
        iconData: currentIconData
    };
    
    if (currentIconType === 'default') {
        favoriteData.iconData = null;
    }
    
    if (editingFavoriteId) {
        // Update existing favorite
        const index = favorites.findIndex(f => f.id === editingFavoriteId);
        if (index !== -1) {
            favoriteData.id = editingFavoriteId;
            favorites[index] = favoriteData;
        }
    } else {
        // Add new favorite
        const newId = favorites.length > 0 ? Math.max(...favorites.map(f => f.id)) + 1 : 1;
        favoriteData.id = newId;
        favorites.push(favoriteData);
    }
    
    saveFavorites();
    renderFavorites();
    editModal.classList.remove('active');
}

// Icon selection handlers
defaultIcon.addEventListener('click', () => {
    defaultIcon.classList.add('active');
    customIconPreview.classList.remove('active');
    urlIconPreview.classList.remove('active');
    currentIconType = 'default';
    currentIconData = null;
    
    // Update letter preview
    const title = favoriteTitleInput.value.trim();
    defaultIconLetter.textContent = title ? title.charAt(0) : 'A';
});

// Update default icon letter when title changes
favoriteTitleInput.addEventListener('input', () => {
    if (currentIconType === 'default') {
        const title = favoriteTitleInput.value.trim();
        defaultIconLetter.textContent = title ? title.charAt(0) : 'A';
    }
});

// Custom icon file handler
customIconInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            customIconPreviewImg.src = e.target.result;
            customIconPreviewImg.style.display = 'block';
            
            defaultIcon.classList.remove('active');
            customIconPreview.classList.add('active');
            urlIconPreview.classList.remove('active');
            
            currentIconType = 'custom';
            currentIconData = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// URL icon handler
iconUrlInput.addEventListener('change', () => {
    const url = iconUrlInput.value.trim();
    if (url) {
        urlIconImg.src = url;
        urlIconImg.style.display = 'block';
        
        defaultIcon.classList.remove('active');
        customIconPreview.classList.remove('active');
        urlIconPreview.classList.add('active');
        
        currentIconType = 'url';
        currentIconData = url;
        
        // Handle error for URL images
        urlIconImg.onerror = function() {
            alert('Не удалось загрузить изображение по указанному URL');
            urlIconImg.style.display = 'none';
        };
    }
});

// Settings functionality
settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('active');
});

backgroundUrlInput.addEventListener('change', () => {
    const url = backgroundUrlInput.value.trim();
    if (url) {
        document.body.style.backgroundImage = `url(${url})`;
        localStorage.setItem('backgroundUrl', url);
    }
});

backgroundFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.body.style.backgroundImage = `url(${e.target.result})`;
            localStorage.setItem('backgroundData', e.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// Modal functionality
modalCancel.addEventListener('click', () => {
    editModal.classList.remove('active');
});

modalSave.addEventListener('click', saveFavorite);

// Search functionality
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `https://yandex.ru/search/?text=${encodeURIComponent(query)}`;
        }
    }
});

// Close panels when clicking outside
document.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
        settingsPanel.classList.remove('active');
    }
    
    if (e.target === editModal) {
        editModal.classList.remove('active');
    }
    
    // Close context menu when clicking outside
    if (!contextMenu.contains(e.target)) {
        contextMenu.classList.remove('active');
    }
});

// Load saved background
function loadSavedBackground() {
    const backgroundUrl = localStorage.getItem('backgroundUrl');
    const backgroundData = localStorage.getItem('backgroundData');
    
    if (backgroundUrl) {
        document.body.style.backgroundImage = `url(${backgroundUrl})`;
        backgroundUrlInput.value = backgroundUrl;
    } else if (backgroundData) {
        document.body.style.backgroundImage = `url(${backgroundData})`;
    }
}

// Initialize
window.onload = () => {
    loadFavorites();
    loadSavedBackground();
};

// Expose functions to global scope for onclick handlers
window.editFavorite = editFavorite;
window.deleteFavorite = deleteFavorite;
window.handleContextMenuAction = handleContextMenuAction;