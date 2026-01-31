import API_BASE_URL from './config.js';

// ============================================
// STATE MANAGEMENT
// ============================================

let currentUser = null;
let selectedUserId = null;
let allUsers = [];
let messageRefreshInterval = null;

// ============================================
// DOM ELEMENTS
// ============================================

const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const contactsList = document.getElementById('contactsList');
const messagesContainer = document.getElementById('messagesContainer');
const emptyState = document.getElementById('emptyState');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.querySelector('.send-btn');
const selectedUserName = document.getElementById('selectedUserName');
const selectedUserUsername = document.getElementById('selectedUserUsername');
const selectedUserAvatar = document.getElementById('selectedUserAvatar');

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check if user is logged in
        const user = localStorage.getItem('user');
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        currentUser = JSON.parse(user);
        console.log('Current user:', currentUser);

        // Load all users for sidebar
        await loadContacts();

        // Setup event listeners
        setupEventListeners();

        console.log('Chat page initialized');
    } catch (error) {
        console.error('Initialization error:', error);
        window.location.href = 'login.html';
    }
});

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Logout
    logoutBtn.addEventListener('click', handleLogout);

    // Search
    searchInput.addEventListener('input', handleSearch);
    document.addEventListener('click', (e) => {
        if (e.target !== searchInput && e.target !== searchResults) {
            searchResults.style.display = 'none';
        }
    });

    // Message form
    messageForm.addEventListener('submit', handleSendMessage);
    messageInput.addEventListener('input', (e) => {
        sendBtn.disabled = e.target.value.trim() === '';
    });
}

// ============================================
// LOAD CONTACTS
// ============================================

async function loadContacts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch contacts');
        }

        allUsers = await response.json();
        renderContacts();

    } catch (error) {
        console.error('Error loading contacts:', error);
        alert('Failed to load contacts');
    }
}

// ============================================
// RENDER CONTACTS
// ============================================

function renderContacts() {
    contactsList.innerHTML = '';

    if (allUsers.length === 0) {
        contactsList.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">No contacts available</p>';
        return;
    }

    allUsers.forEach(user => {
        const contactItem = createContactElement(user);
        contactsList.appendChild(contactItem);
    });
}

function createContactElement(user) {
    const div = document.createElement('div');
    div.className = 'contact-item';
    if (selectedUserId === user._id) {
        div.classList.add('active');
    }

    const avatar = getAvatarEmoji(user.gender);

    div.innerHTML = `
        <div class="contact-avatar">${avatar}</div>
        <div class="contact-info">
            <h3>${user.fullName}</h3>
            <p>@${user.username}</p>
        </div>
    `;

    div.addEventListener('click', () => selectContact(user));

    return div;
}

// ============================================
// SELECT CONTACT
// ============================================

async function selectContact(user) {
    selectedUserId = user._id;

    // Update UI
    selectedUserName.textContent = user.fullName;
    selectedUserUsername.textContent = `@${user.username}`;
    selectedUserAvatar.textContent = getAvatarEmoji(user.gender);
    messageInput.disabled = false;
    sendBtn.disabled = messageInput.value.trim() === '';

    emptyState.style.display = 'none';
    messagesContainer.innerHTML = '';

    // Update active contact
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    // Load messages
    await loadMessages();

    // Set up auto-refresh
    if (messageRefreshInterval) {
        clearInterval(messageRefreshInterval);
    }
    messageRefreshInterval = setInterval(loadMessages, 2000); // Refresh every 2 seconds
}

// ============================================
// LOAD MESSAGES
// ============================================

async function loadMessages() {
    if (!selectedUserId) return;

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/messages/${selectedUserId}`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }

        const messages = await response.json();
        renderMessages(messages);

    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// ============================================
// RENDER MESSAGES
// ============================================

function renderMessages(messages) {
    messagesContainer.innerHTML = '';

    if (messages.length === 0) {
        messagesContainer.innerHTML = '<p style="text-align: center; color: #999; margin-top: 20px;">No messages yet. Start the conversation!</p>';
        return;
    }

    messages.forEach(msg => {
        const msgEl = createMessageElement(msg);
        messagesContainer.appendChild(msgEl);
    });

    // Auto-scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function createMessageElement(message) {
    const div = document.createElement('div');
    div.className = 'message';

    const isSent = message.senderId === currentUser._id;
    div.classList.add(isSent ? 'sent' : 'received');

    const time = new Date(message.createdAt).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    div.innerHTML = `
        <div class="message-content">
            ${escapeHtml(message.message)}
            <div class="message-time">${time}</div>
        </div>
    `;

    return div;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// SEND MESSAGE
// ============================================

async function handleSendMessage(e) {
    e.preventDefault();

    const messageText = messageInput.value.trim();
    if (!messageText || !selectedUserId) return;

    // Disable button while sending
    sendBtn.disabled = true;

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/messages/send/${selectedUserId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ message: messageText })
            }
        );

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        // Clear input
        messageInput.value = '';

        // Reload messages
        await loadMessages();

    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
    } finally {
        sendBtn.disabled = messageInput.value.trim() === '';
    }
}

// ============================================
// SEARCH USERS
// ============================================

async function handleSearch(e) {
    const query = e.target.value.trim();

    if (!query) {
        searchResults.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/users/search?username=${encodeURIComponent(query)}`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        if (!response.ok) {
            throw new Error('Failed to search users');
        }

        const results = await response.json();
        renderSearchResults(results, query);

    } catch (error) {
        console.error('Error searching users:', error);
        searchResults.innerHTML = '<p style="padding: 12px; text-align: center; color: #999;">Search failed</p>';
        searchResults.style.display = 'block';
    }
}

function renderSearchResults(results, query) {
    if (results.length === 0) {
        searchResults.innerHTML = '<p style="padding: 12px; text-align: center; color: #999;">No users found</p>';
        searchResults.style.display = 'block';
        return;
    }

    searchResults.innerHTML = '';

    results.forEach(user => {
        const resultEl = document.createElement('div');
        resultEl.className = 'search-result-item';

        const avatar = getAvatarEmoji(user.gender);

        resultEl.innerHTML = `
            <div class="search-result-avatar">${avatar}</div>
            <div class="search-result-info">
                <h4>${user.fullName}</h4>
                <p>@${user.username}</p>
            </div>
        `;

        resultEl.addEventListener('click', () => {
            selectContact(user);
            searchInput.value = '';
            searchResults.style.display = 'none';
        });

        searchResults.appendChild(resultEl);
    });

    searchResults.style.display = 'block';
}

// ============================================
// LOGOUT
// ============================================

async function handleLogout() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/auth/logout`,
            {
                method: 'POST',
                credentials: 'include'
            }
        );

        // Clear local storage and redirect
        localStorage.removeItem('user');
        window.location.href = 'login.html';

    } catch (error) {
        console.error('Logout error:', error);
        // Even if logout fails, clear local storage and redirect
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getAvatarEmoji(gender) {
    if (gender === 'male') {
        return '👨';
    } else if (gender === 'female') {
        return '👩';
    }
    return '👤';
}
