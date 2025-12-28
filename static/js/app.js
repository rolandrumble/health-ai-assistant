/**
 * AI Health Symptom Analyzer - Frontend Application
 * Handles all interactive functionality
 */

// =============================================================================
// Global State
// =============================================================================

const state = {
    symptoms: [],
    currentUser: null,
    chatContext: '',
    uploadedFile: null
};

// API base URL - adjust for deployment
const API_URL = '';  // Empty for same-origin requests

// =============================================================================
// Utility Functions
// =============================================================================

function formatTimestamp(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
        <span class="notification-message">${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? 'rgba(16, 185, 129, 0.9)' : type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(14, 165, 233, 0.9)'};
        color: white;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add CSS animation keyframes
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(styleSheet);

// =============================================================================
// Navigation Functions
// =============================================================================

function scrollToAnalyzer() {
    document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth' });
}

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
}

// =============================================================================
// Tab Navigation
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
    
    initializeSymptomInput();
    initializeFileUpload();
    initializeChatInput();
    initializeSymptomForm();
});

// =============================================================================
// Symptom Input Handling
// =============================================================================

function initializeSymptomInput() {
    const input = document.getElementById('symptom-input');
    
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const symptom = this.value.trim();
            
            if (symptom && !state.symptoms.includes(symptom)) {
                state.symptoms.push(symptom);
                renderSymptomTags();
                this.value = '';
            }
        }
    });
}

function renderSymptomTags() {
    const container = document.getElementById('symptoms-tags');
    container.innerHTML = state.symptoms.map((symptom, index) => `
        <span class="symptom-tag">
            ${symptom}
            <span class="remove-tag" onclick="removeSymptom(${index})">×</span>
        </span>
    `).join('');
    
    document.getElementById('symptoms-hidden').value = JSON.stringify(state.symptoms);
}

function removeSymptom(index) {
    state.symptoms.splice(index, 1);
    renderSymptomTags();
}

// =============================================================================
// Symptom Form Submission
// =============================================================================

function initializeSymptomForm() {
    const form = document.getElementById('symptom-form');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (state.symptoms.length === 0) {
            showNotification('Please add at least one symptom', 'error');
            return;
        }
        
        const formData = {
            symptoms: state.symptoms,
            age: parseInt(document.getElementById('age').value),
            gender: document.getElementById('gender').value,
            duration: document.getElementById('duration').value,
            severity: document.getElementById('severity').value,
            medical_history: document.getElementById('medical-history').value || null
        };
        
        const btn = document.getElementById('analyze-btn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');
        
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        btn.disabled = true;
        
        try {
            const response = await fetch(`${API_URL}/api/analyze/symptoms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) throw new Error('Analysis failed');
            
            const result = await response.json();
            displayResults(result);
            showNotification('Analysis complete!', 'success');
            
        } catch (error) {
            console.error('Error:', error);
            showNotification('Failed to analyze symptoms. Please try again.', 'error');
        } finally {
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            btn.disabled = false;
        }
    });
}

// =============================================================================
// File Upload Handling
// =============================================================================

function initializeFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('report-file');
    
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFileSelection(files[0]);
    });
    
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) handleFileSelection(this.files[0]);
    });
}

function handleFileSelection(file) {
    if (!file.name.endsWith('.pdf')) {
        showNotification('Please upload a PDF file', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB', 'error');
        return;
    }
    
    state.uploadedFile = file;
    document.getElementById('upload-area').style.display = 'none';
    document.getElementById('file-preview').style.display = 'block';
    document.getElementById('file-name').textContent = file.name;
}

function removeFile() {
    state.uploadedFile = null;
    document.getElementById('upload-area').style.display = 'block';
    document.getElementById('file-preview').style.display = 'none';
    document.getElementById('report-file').value = '';
}

async function analyzeReport() {
    if (!state.uploadedFile) {
        showNotification('Please upload a file first', 'error');
        return;
    }
    
    const btn = document.getElementById('analyze-report-btn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';
    btn.disabled = true;
    
    const formData = new FormData();
    formData.append('file', state.uploadedFile);
    
    try {
        const response = await fetch(`${API_URL}/api/analyze/report`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Report analysis failed');
        
        const result = await response.json();
        displayReportResults(result);
        showNotification('Report analyzed successfully!', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to analyze report. Please try again.', 'error');
    } finally {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        btn.disabled = false;
    }
}

// =============================================================================
// Chat Functionality
// =============================================================================

function initializeChatInput() {
    const input = document.getElementById('chat-input');
    
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    addChatMessage(message, 'user');
    input.value = '';
    input.disabled = true;
    document.getElementById('send-chat-btn').disabled = true;
    
    const typingId = addTypingIndicator();
    
    try {
        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, context: state.chatContext })
        });
        
        if (!response.ok) throw new Error('Chat request failed');
        
        const result = await response.json();
        removeTypingIndicator(typingId);
        addChatMessage(result.response, 'assistant');
        state.chatContext += `\nUser: ${message}\nAssistant: ${result.response}`;
        
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator(typingId);
        addChatMessage('Sorry, I encountered an error. Please try again.', 'assistant');
    } finally {
        input.disabled = false;
        document.getElementById('send-chat-btn').disabled = false;
        input.focus();
    }
}

function addChatMessage(content, role) {
    const container = document.getElementById('chat-messages');
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const messageHtml = `
        <div class="chat-message ${role}">
            <div class="message-avatar">${role === 'user' ? '👤' : '🤖'}</div>
            <div class="message-content">
                <p>${formatMessageContent(content)}</p>
                <span class="message-time">${time}</span>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', messageHtml);
    container.scrollTop = container.scrollHeight;
}

function formatMessageContent(content) {
    try {
        const parsed = JSON.parse(content);
        if (typeof parsed === 'object') return formatJsonResponse(parsed);
    } catch (e) {}
    return content.replace(/\n/g, '<br>');
}

function formatJsonResponse(obj) {
    let html = '';
    if (obj.preliminary_assessment) html += `<p><strong>Assessment:</strong> ${obj.preliminary_assessment}</p>`;
    if (obj.recommendations && obj.recommendations.length > 0) {
        html += '<p><strong>Recommendations:</strong></p><ul>';
        obj.recommendations.forEach(rec => html += `<li>${rec}</li>`);
        html += '</ul>';
    }
    return html || JSON.stringify(obj, null, 2);
}

function addTypingIndicator() {
    const container = document.getElementById('chat-messages');
    const id = 'typing-' + Date.now();
    
    const html = `
        <div class="chat-message assistant" id="${id}">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p class="typing-indicator">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </p>
            </div>
        </div>
    `;
    
    if (!document.getElementById('typing-styles')) {
        const style = document.createElement('style');
        style.id = 'typing-styles';
        style.textContent = `
            .typing-indicator { display: flex; gap: 4px; padding: 4px 0; }
            .typing-indicator .dot {
                width: 8px; height: 8px; background: var(--text-muted);
                border-radius: 50%; animation: typingBounce 1.4s infinite ease-in-out both;
            }
            .typing-indicator .dot:nth-child(1) { animation-delay: -0.32s; }
            .typing-indicator .dot:nth-child(2) { animation-delay: -0.16s; }
            @keyframes typingBounce {
                0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                40% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    container.insertAdjacentHTML('beforeend', html);
    container.scrollTop = container.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
}

// =============================================================================
// Results Display
// =============================================================================

function displayResults(result) {
    const resultsArea = document.getElementById('results-area');
    const resultsContent = document.getElementById('results-content');
    const timestamp = document.getElementById('results-timestamp');
    
    timestamp.textContent = formatTimestamp(result.timestamp);
    const urgencyClass = `urgency-${result.urgency_level}`;
    
    let conditionsHtml = '';
    if (result.possible_conditions && result.possible_conditions.length > 0) {
        conditionsHtml = result.possible_conditions.map(condition => `
            <div class="condition-card">
                <h5>${condition.name || 'Condition'}</h5>
                <p class="likelihood">Likelihood: ${condition.likelihood || 'N/A'}</p>
                <p>${condition.description || ''}</p>
            </div>
        `).join('');
    }
    
    let recommendationsHtml = '';
    if (result.recommendations && result.recommendations.length > 0) {
        recommendationsHtml = `
            <ul class="recommendation-list">
                ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        `;
    }
    
    let html = `
        <div class="result-section">
            <h4>📋 Preliminary Assessment</h4>
            <p>${result.preliminary_assessment}</p>
        </div>
        <div class="result-section">
            <h4>⚠️ Urgency Level</h4>
            <span class="urgency-badge ${urgencyClass}">${result.urgency_level.toUpperCase()}</span>
        </div>
        ${conditionsHtml ? `<div class="result-section"><h4>🔍 Possible Conditions</h4>${conditionsHtml}</div>` : ''}
        ${recommendationsHtml ? `<div class="result-section"><h4>💡 Recommendations</h4>${recommendationsHtml}</div>` : ''}
        <div class="result-section">
            <h4>🏷️ Symptoms Analyzed</h4>
            <div class="symptoms-tags">
                ${result.symptoms.map(s => `<span class="symptom-tag">${s}</span>`).join('')}
            </div>
        </div>
    `;
    
    resultsContent.innerHTML = html;
    resultsArea.style.display = 'block';
    resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayReportResults(result) {
    const resultsArea = document.getElementById('results-area');
    const resultsContent = document.getElementById('results-content');
    const timestamp = document.getElementById('results-timestamp');
    
    timestamp.textContent = formatTimestamp(result.timestamp);
    
    let analysisContent = result.analysis;
    try {
        const parsed = JSON.parse(analysisContent);
        if (typeof parsed === 'object') analysisContent = formatJsonResponse(parsed);
    } catch (e) {
        analysisContent = analysisContent.replace(/\n/g, '<br>');
    }
    
    let html = `
        <div class="result-section">
            <h4>📄 Report: ${result.filename}</h4>
        </div>
        <div class="result-section">
            <h4>📊 Analysis</h4>
            <div class="analysis-content">${analysisContent}</div>
        </div>
    `;
    
    resultsContent.innerHTML = html;
    resultsArea.style.display = 'block';
    resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =============================================================================
// Authentication Modal
// =============================================================================

function showAuthModal(type) {
    const modal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    modal.classList.add('active');
    
    if (type === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
}

document.addEventListener('click', function(e) {
    const modal = document.getElementById('auth-modal');
    if (e.target === modal) closeAuthModal();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeAuthModal();
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }
        
        const result = await response.json();
        state.currentUser = result;
        
        showNotification(`Welcome back, ${result.name}!`, 'success');
        closeAuthModal();
        updateUIForLoggedInUser();
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const userType = document.getElementById('signup-type').value;
    
    try {
        const response = await fetch(`${API_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, user_type: userType })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Signup failed');
        }
        
        showNotification('Account created successfully! Please log in.', 'success');
        showAuthModal('login');
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function updateUIForLoggedInUser() {
    const navLinks = document.querySelector('.nav-links');
    const authButtons = navLinks.querySelectorAll('.btn');
    
    authButtons.forEach(btn => btn.remove());
    
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
        <span class="user-name">👤 ${state.currentUser.name}</span>
        <button class="btn btn-outline" onclick="handleLogout()">Logout</button>
    `;
    userInfo.style.cssText = 'display: flex; align-items: center; gap: 16px;';
    navLinks.appendChild(userInfo);
}

function handleLogout() {
    state.currentUser = null;
    showNotification('Logged out successfully', 'success');
    location.reload();
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('symptom-input').focus();
    }
});
