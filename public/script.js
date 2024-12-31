const NICKNAME_MAX_LENGTH = 50;
const MESSAGE_MAX_LENGTH = 1000;

function validateInput(input, maxLength) {
    const sanitized = input.trim();
    return {
        isValid: sanitized.length > 0 && sanitized.length <= maxLength,
        sanitized
    };
}

function setLoadingState(form, isLoading) {
    const button = form.querySelector('button[type="submit"]');
    const btnText = button.querySelector('.btn-text');
    const loader = button.querySelector('.btn-loader');
    
    button.disabled = isLoading;
    btnText.style.opacity = isLoading ? '0' : '1';
    loader.classList.toggle('hidden', !isLoading);
}

function createMessageCard(msg, index) {
    return `
        <div class="message-card" style="animation-delay: ${index * 0.1}s">
            <h3 class="text-amber-400 font-semibold mb-2">${msg.nickname}</h3>
            <p class="text-gray-300">${msg.message}</p>
            <div class="mt-4 text-xs text-gray-500">
                ${moment(msg.timestamp).format('MMM D, YYYY h:mm A')}
            </div>
        </div>
    `;
}

document.getElementById('messageForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nicknameInput = validateInput(document.getElementById('nicknameInput').value, NICKNAME_MAX_LENGTH);
    const messageInput = validateInput(document.getElementById('messageInput').value, MESSAGE_MAX_LENGTH);

    if (!nicknameInput.isValid || !messageInput.isValid) {
        Swal.fire({
            title: 'Invalid Input',
            text: 'Please check your name and message length',
            icon: 'warning',
            background: '#1a1a1a',
            color: '#ffffff'
        });
        return;
    }

    setLoadingState(this, true);

    try {
        const response = await fetch('/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nickname: nicknameInput.sanitized,
                message: messageInput.sanitized
            })
        });

        if (!response.ok) throw new Error('Failed to send message');

        Swal.fire({
            title: 'Message Sent',
            text: 'Your message has been saved',
            icon: 'success',
            background: '#1a1a1a',
            color: '#ffffff',
            timer: 2000,
            showConfirmButton: false
        });

        this.reset();
    } catch (err) {
        Swal.fire({
            title: 'Error',
            text: 'Failed to send message. Please try again.',
            icon: 'error',
            background: '#1a1a1a',
            color: '#ffffff'
        });
    } finally {
        setLoadingState(this, false);
    }
});

function updateCountdown() {
    const targetTime = moment.tz("2025-01-01 00:00", "Asia/Manila");
    const currentTime = moment.tz("Asia/Manila");
    const diff = targetTime.diff(currentTime);
    const duration = moment.duration(diff);

    const countdownElement = document.getElementById('countdown');
    
    if (duration.asSeconds() <= 0) {
        countdownElement.textContent = 'Happy New Year 2025!';
        clearInterval(countdownInterval);
        return;
    }

    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    countdownElement.textContent = 
        `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();

function viewMessages() {
    Swal.fire({
        title: 'Enter Password',
        input: 'password',
        inputPlaceholder: 'Enter password to view messages',
        showCancelButton: true,
        background: '#1a1a1a',
        color: '#ffffff',
        confirmButtonColor: '#eab308',
        cancelButtonColor: '#4b5563'
    }).then(result => {
        if (result.isConfirmed && result.value?.trim()) {
            fetchMessages(result.value.trim());
        }
    });
}

async function fetchMessages(password) {
    try {
        const response = await fetch(`/viewMessages?password=${encodeURIComponent(password)}`);
        const data = await response.json();
        
        if (data.message) throw new Error(data.message);
        
        const messageList = document.getElementById('messageList');
        
        if (!Array.isArray(data) || data.length === 0) {
            messageList.innerHTML = `
                <div class="col-span-full text-center text-gray-400 py-8">
                    No messages available yet
                </div>
            `;
            return;
        }
        
        messageList.innerHTML = data.map(createMessageCard).join('');
    } catch (err) {
        Swal.fire({
            title: 'Error',
            text: err.message || 'Failed to load messages',
            icon: 'error',
            background: '#1a1a1a',
            color: '#ffffff'
        });
    }
}


