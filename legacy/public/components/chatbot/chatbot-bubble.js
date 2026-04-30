// Chatbot Bubble Component
class ChatbotBubble {
    constructor(apiUrl = 'http://localhost:11434') {
        this.apiUrl = apiUrl;
        this.isOpen = false;
        this.chatHistory = [];
        this.createBubble();
        this.createChatBox();
        this.attachEventListeners();
    }

    createBubble() {
        // Create the floating bubble element
        const bubble = document.createElement('div');
        bubble.id = 'chatbot-bubble';
        bubble.innerHTML = `
            <div class="chatbot-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </div>
        `;
        document.body.appendChild(bubble);
        
        // Add link to the CSS file
        this.addStylesheet();
    }

    addStylesheet() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'components/chatbot/chatbot-styles.css';
        link.id = 'chatbot-styles';
        document.head.appendChild(link);
    }

    createChatBox() {
        // Create the chatbox container
        const container = document.createElement('div');
        container.id = 'chatbot-container';
        container.innerHTML = `
            <div class="chatbot-header">
                <div class="chatbot-title">
                    <div class="chatbot-title-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <span>GITA (Gateway Informasi dan Tanya Administrasi)</span>
                </div>
                <button class="chatbot-close">&times;</button>
            </div>
            <div class="chatbot-quick-actions">
                <button class="quick-action-btn" data-question="Apa itu LPJ?">Apa itu LPJ?</button>
                <button class="quick-action-btn" data-question="Apa itu KAK?">Apa itu KAK?</button>
                <button class="quick-action-btn" data-question="Perbedaan LPJ dan KAK">Perbedaan LPJ & KAK</button>
                <button class="quick-action-btn" data-question="Isi LPJ lengkap">Isi LPJ lengkap</button>
                <button class="quick-action-btn" data-question="Isi KAK lengkap">Isi KAK lengkap</button>
                <button class="quick-action-btn" data-question="Kapan LPJ dibuat?">Kapan LPJ dibuat?</button>
                <button class="quick-action-btn" data-question="Syarat LPJ">Syarat LPJ</button>
                <button class="quick-action-btn" data-question="Format KAK">Format KAK</button>
            </div>
            <div class="chatbot-messages" id="chatbot-messages">
                <div class="message bot-message">
                    Halo! Saya asisten LPJ & KAK. Bagaimana saya bisa membantu Anda hari ini?
                </div>
            </div>
            <div class="chatbot-input-area">
                <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Tulis pesan Anda...">
                <button class="chatbot-send-btn" id="chatbot-send-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        `;
        document.body.appendChild(container);

        // Add event listeners for quick action buttons
        this.attachQuickActionListeners();
    }

    attachQuickActionListeners() {
        const quickActionButtons = document.querySelectorAll('.quick-action-btn');
        quickActionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const question = e.target.getAttribute('data-question');
                this.processQuickAction(question);
            });
        });
    }

    attachEventListeners() {
        const bubble = document.getElementById('chatbot-bubble');
        const container = document.getElementById('chatbot-container');
        const closeBtn = document.querySelector('.chatbot-close');
        const sendBtn = document.getElementById('chatbot-send-btn');
        const input = document.getElementById('chatbot-input');

        // Toggle chatbox on bubble click
        bubble.addEventListener('click', () => {
            this.toggleChatBox();
        });

        // Close chatbox
        closeBtn.addEventListener('click', () => {
            this.closeChatBox();
        });

        // Send message on button click
        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        // Send message on Enter key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    toggleChatBox() {
        const container = document.getElementById('chatbot-container');
        const bubble = document.getElementById('chatbot-bubble');

        if (!this.isOpen) {
            // Remove any closing class if present before opening
            container.classList.remove('closing');
            container.classList.add('open');
            // Add class to bubble when chat is open to move it up
            bubble.classList.add('chat-open');
            this.isOpen = true;
        } else {
            this.closeChatBox();
        }
    }

    closeChatBox() {
        const container = document.getElementById('chatbot-container');
        const bubble = document.getElementById('chatbot-bubble');

        // Add closing animation class
        container.classList.add('closing');

        // Wait for animation to complete before hiding
        setTimeout(() => {
            if(container.classList.contains('closing')) {
                container.classList.remove('open', 'closing');
                bubble.classList.remove('chat-open');  // Remove class when chat closes
                this.isOpen = false;
            }
        }, 300); // Match the CSS transition duration
    }

    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        const typingIndicator = this.addTypingIndicator();

        try {
            // Call the Ollama API
            const response = await this.callOllamaAPI(message);
            
            // Remove typing indicator
            this.removeTypingIndicator(typingIndicator);

            // Add bot response to chat
            this.addMessage(response, 'bot');
        } catch (error) {
            // Remove typing indicator
            this.removeTypingIndicator(typingIndicator);
            
            // Show error message
            this.addMessage('Terjadi kesalahan saat menghubungi asisten. Silakan coba lagi.', 'bot');
            console.error('Chatbot error:', error);
        }
    }

    async callOllamaAPI(prompt) {
        const response = await fetch(`${this.apiUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'lpj-kak-bot-fast-corr',
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.6,
                    top_p: 0.9
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Save to chat history
        this.chatHistory.push({ sender, text });
    }

    addTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.textContent = 'Mengetik...';
        messagesContainer.appendChild(typingDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return typingDiv;
    }

    removeTypingIndicator(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    processQuickAction(question) {
        // Add user message to chat
        this.addMessage(question, 'user');

        // Show typing indicator
        const typingIndicator = this.addTypingIndicator();

        // Call the Ollama API
        this.callOllamaAPI(question)
            .then(response => {
                // Remove typing indicator
                this.removeTypingIndicator(typingIndicator);

                // Add bot response to chat
                this.addMessage(response, 'bot');
            })
            .catch(error => {
                // Remove typing indicator
                this.removeTypingIndicator(typingIndicator);

                // Show error message
                this.addMessage('Terjadi kesalahan saat menghubungi asisten. Silakan coba lagi.', 'bot');
                console.error('Chatbot error:', error);
            });
    }
}

// Initialize the chatbot when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // IMPORTANT: Replace with your actual VPS IP address
    // Example: new ChatbotBubble('http://123.456.789.012:11434');
    new ChatbotBubble('http://148.230.101.137:11434'); // Your VPS IP - Using corrected fast model
});