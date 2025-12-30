const API_URL = '/users';

// State
let users = [];
let isEditing = false;

// DOM Elements
const userForm = document.getElementById('userForm');
const userIdInput = document.getElementById('userId');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const userTableBody = document.querySelector('#userTable tbody');
const userCount = document.getElementById('userCount');
const emptyState = document.getElementById('emptyState');
const toast = document.getElementById('toast');

// Initialize
document.addEventListener('DOMContentLoaded', fetchUsers);

// Event Listeners
userForm.addEventListener('submit', handleFormSubmit);
cancelBtn.addEventListener('click', resetForm);

// API Functions
async function fetchUsers() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch users');
        users = await response.json();
        renderUsers();
    } catch (error) {
        console.error('Error:', error);
        showToast('Error loading users', 'error');
    }
}

async function createUser(user) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        if (!response.ok) throw new Error('Failed to create user');
        const newUser = await response.json();
        users.push(newUser);
        renderUsers();
        showToast('User created successfully');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error creating user', 'error');
    }
}

async function updateUser(id, user) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        if (!response.ok) throw new Error('Failed to update user');
        const updatedUser = await response.json();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) users[index] = updatedUser;
        renderUsers();
        showToast('User updated successfully');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error updating user', 'error');
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete user');
        users = users.filter(u => u.id !== id);
        renderUsers();
        showToast('User deleted successfully');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error deleting user', 'error');
    }
}

// UI Functions
function renderUsers() {
    userTableBody.innerHTML = '';
    
    if (users.length === 0) {
        emptyState.classList.add('visible');
    } else {
        emptyState.classList.remove('visible');
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${user.id}</td>
                <td>${escapeHtml(user.username)}</td>
                <td>${escapeHtml(user.email)}</td>
                <td>
                    <button class="btn edit-text" onclick="startEdit(${user.id})">Edit</button>
                    <button class="btn danger-text" onclick="deleteUser(${user.id})">Delete</button>
                </td>
            `;
            userTableBody.appendChild(tr);
        });
    }
    
    userCount.textContent = `${users.length} Users`;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const user = {
        username: usernameInput.value.trim(),
        email: emailInput.value.trim()
    };

    if (isEditing) {
        const id = parseInt(userIdInput.value);
        updateUser(id, user);
    } else {
        createUser(user);
    }

    resetForm();
}

// Global scope needed for onclick attributes
window.startEdit = function(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;

    userIdInput.value = user.id;
    usernameInput.value = user.username;
    emailInput.value = user.email;
    
    isEditing = true;
    submitBtn.innerHTML = '<span class="icon">✎</span> Update User';
    cancelBtn.classList.remove('hidden');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteUser = deleteUser;

function resetForm() {
    userForm.reset();
    userIdInput.value = '';
    isEditing = false;
    submitBtn.innerHTML = '<span class="icon">+</span> Add User';
    cancelBtn.classList.add('hidden');
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast show ${type}`; // Support for error styling if added later
    
    setTimeout(() => {
        toast.className = 'toast hidden';
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
