// Initial favorites data
let favorites = [
    { id: 1, title: 'Google', url: 'https://google.com' },
    { id: 2, title: 'YouTube', url: 'https://youtube.com' },
    { id: 3, title: 'Facebook', url: 'https://facebook.com' },
    { id: 4, title: 'Twitter', url: 'https://twitter.com' },
    { id: 5, title: 'Instagram', url: 'https://instagram.com' },
    { id: 6, title: 'LinkedIn', url: 'https://linkedin.com' }
];

// DOM elements
const timeElement = document.getElementById('current-time');
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

// Variables for editing
let editingFavoriteId = null;
let draggedItem = null;

// Update clock
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
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

// Render favorites
function renderFavorites() {
    favoritesContainer.innerHTML = '';
    
    favorites.forEach(favorite => {
        const favoriteElement = document.createElement('div');
        favoriteElement.className = 'favorite-item';
        favoriteElement.setAttribute('draggable', 'true');
        favoriteElement.setAttribute('data-id', favorite.id);
        
        favoriteElement.innerHTML = `
            <div class="favorite-icon">${favorite.title.charAt(0)}</div>
            <div class="favorite-title">${favorite.title}</div>
            <div class="controls">
                <button class="control-btn edit" onclick="editFavorite(${favorite.id})">✏️</button>
                <button class="control-btn delete" onclick="deleteFavorite(${favorite.id})">❌</button>
            </div>
        `;
        
        favoriteElement.addEventListener('click', (e) => {
            if (!e.target.closest('.controls')) {
                window.location.href = favorite.url;
            }
        });
        
        // Drag events
        favoriteElement.addEventListener('dragstart', handleDragStart);
        favoriteElement.addEventListener('dragover', handleDragOver);
        favoriteElement.addEventListener('drop', handleDrop);
        favoriteElement.addEventListener('dragend', handleDragEnd);
        
        favoritesContainer.appendChild(favoriteElement);
    });
    
    // Add the "+" button for adding new favorites
    const addButton = document.createElement('div');
    addButton.className = 'add-favorite';
    addButton.textContent = '+';
    addButton.addEventListener('click', () => {
        showAddModal();
    });
    
    favoritesContainer.appendChild(addButton);
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

// Add a new favorite
function showAddModal() {
    modalTitle.textContent = 'Добавить закладку';
    favoriteTitleInput.value = '';
    favoriteUrlInput.value = '';
    editingFavoriteId = null;
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
    
    if (editingFavoriteId) {
        // Update existing favorite
        const index = favorites.findIndex(f => f.id === editingFavoriteId);
        if (index !== -1) {
            favorites[index].title = title;
            favorites[index].url = url;
        }
    } else {
        // Add new favorite
        const newId = favorites.length > 0 ? Math.max(...favorites.map(f => f.id)) + 1 : 1;
        favorites.push({ id: newId, title, url });
    }
    
    saveFavorites();
    renderFavorites();
    editModal.classList.remove('active');
}

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
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
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