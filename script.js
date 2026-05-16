// ==========================================
// 1. EASY FORM CONFIGURATION (NO DATABASE)
// ==========================================
// Go to formsubmit.co, enter your email, and put the link they give you here.
// For now, it will use a secure dummy endpoint.
const FORM_ENDPOINT = "https://formsubmit.co/apangzur@gmail.com"; 

// Local storage keys to keep track of approved players locally
let officialPlayers = JSON.parse(localStorage.getItem('approved_players')) || [];
let pendingPlayers = JSON.parse(localStorage.getItem('pending_players')) || [];

// ==========================================
// 2. RUNTIME LOADER & UI NAV MANAGEMENT
// ==========================================
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    }, 600);
    initializeCountdown(new Date().getTime() + (7 * 24 * 60 * 60 * 1000));
    
    // Initial UI render from storage
    renderPublicVerifiedPlayersGrid();
    renderAdminControlPanels();
});

// Responsive Burger Dropdown Controller
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// ==========================================
// 3. TOURNAMENT COUNTDOWN SYSTEM ENGINE
// ==========================================
function initializeCountdown(targetTimestamp) {
    const d = document.getElementById('days');
    const h = document.getElementById('hours');
    const m = document.getElementById('minutes');
    const s = document.getElementById('seconds');

    function update() {
        const now = new Date().getTime();
        const difference = targetTimestamp - now;

        if (difference <= 0) {
            document.getElementById('reg-status').innerText = "REGISTRATION CLOSED";
            document.getElementById('reg-status').className = "status-closed";
            clearInterval(intervalId);
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        d.innerText = String(days).padStart(2, '0');
        h.innerText = String(hours).padStart(2, '0');
        m.innerText = String(minutes).padStart(2, '0');
        s.innerText = String(seconds).padStart(2, '0');
    }
    const intervalId = setInterval(update, 1000);
    update();
}

// ==========================================
// 4. PUBLIC APPLICATION REGISTRATION MODULE
// ==========================================
document.getElementById('registration-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('efootball-username').value.trim();
    const whatsapp = document.getElementById('whatsapp-number').value.trim();
    const division = document.getElementById('current-division').value;

    if (!username || !whatsapp || !division) return alert("Please fill all fields.");

    // Check duplicates
    const isDuplicate = officialPlayers.concat(pendingPlayers).some(player => 
        player.username.toLowerCase() === username.toLowerCase()
    );

    if (isDuplicate) {
        alert("Error: This username is already filed or registered!");
        return;
    }

    const newPlayer = {
        id: Date.now().toString(),
        username: username,
        whatsapp: whatsapp,
        division: division,
        status: "Pending Approval"
    };

    // Save to local pending storage cache
    pendingPlayers.push(newPlayer);
    localStorage.setItem('pending_players', JSON.stringify(pendingPlayers));

    // OPTIONAL: Send a copy straight to email using a simple background fetch request
    fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
            Tournament: "IAMBOT LEAGUE",
            Username: username,
            WhatsApp: whatsapp,
            Division: division
        })
    }).catch(err => console.log("Email fallback skip setup"));

    alert("Registration Received!\nStatus: Pending Admin approval validation.");
    document.getElementById('registration-form').reset();
    renderAdminControlPanels();
});

// ==========================================
// 5. RENDERING ELEMENTS INTERFACE
// ==========================================
function renderPublicVerifiedPlayersGrid() {
    const container = document.getElementById('player-grid-container');
    container.innerHTML = '';
    
    document.getElementById('total-registered-count').innerText = officialPlayers.length;

    if (officialPlayers.length === 0) {
        container.innerHTML = `<div class="no-players-fallback">No fighters approved yet. Be the first to secure a slot!</div>`;
        return;
    }

    officialPlayers.forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.innerHTML = `
            <div class="player-avatar"><i class="fa-solid fa-shield-halved"></i></div>
            <div class="player-info">
                <h4>${escapeHTML(player.username)}</h4>
                <p>${escapeHTML(player.division)}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// Live Search Filter
document.getElementById('player-search').addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('#player-grid-container .player-card');
    cards.forEach(card => {
        const name = card.querySelector('h4').innerText.toLowerCase();
        card.style.display = name.includes(query) ? 'flex' : 'none';
    });
});

// Mock Chat Banter system fallback to keep dashboard lively
document.getElementById('comment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const nameInput = document.getElementById('comment-username');
    const textInput = document.getElementById('comment-text');
    const container = document.getElementById('chat-messages-container');

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg';
    bubble.innerHTML = `
        <div class="chat-msg-header">
            <span class="chat-user">${escapeHTML(nameInput.value)}</span>
            <span class="chat-time">Just Now</span>
        </div>
        <div class="chat-text">${escapeHTML(textInput.value)}</div>
    `;
    container.appendChild(bubble);
    textInput.value = '';
    container.scrollTop = container.scrollHeight;
});

// ==========================================
// 6. ADMIN MODERATION ACTIONS PANEL
// ==========================================
const adminPasswordHashKey = "IAMBOTADMIN2026"; 

document.getElementById('admin-login-btn').addEventListener('click', () => {
    const token = prompt("Provide Hub Dashboard Security Credentials:");
    if (token === adminPasswordHashKey) {
        document.getElementById('admin-dashboard').classList.remove('hidden');
        document.getElementById('admin-dashboard').scrollIntoView();
        alert("Credentials Verified.");
    } else if (token !== null) {
        alert("Access Refused.");
    }
});

document.getElementById('admin-logout-btn').addEventListener('click', () => {
    document.getElementById('admin-dashboard').classList.add('hidden');
    window.scrollTo(0,0);
});

function renderAdminControlPanels() {
    const pendingBody = document.getElementById('admin-pending-table-body');
    const allBody = document.getElementById('admin-all-players-body');
    
    pendingBody.innerHTML = '';
    allBody.innerHTML = '';

    pendingPlayers.forEach(player => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHTML(player.username)}</strong></td>
            <td><a href="https://wa.me/${player.whatsapp.replace(/\D/g,'')}" target="_blank" style="color:#00ff66;"><i class="fa-brands fa-whatsapp"></i> Chat</a></td>
            <td>${escapeHTML(player.division)}</td>
            <td>
                <div class="action-btn-group">
                    <button onclick="approvePlayer('${player.id}')" class="btn-action btn-approve">Pass</button>
                    <button onclick="deletePending('${player.id}')" class="btn-action btn-reject">Deny</button>
                </div>
            </td>
        `;
        pendingBody.appendChild(tr);
    });

    officialPlayers.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHTML(player.username)}</td>
            <td style="color:#00ff66">Approved</td>
            <td><button onclick="deleteOfficial('${player.id}')" class="btn-action btn-reject"><i class="fa-solid fa-trash"></i></button></td>
        `;
        allBody.appendChild(row);
    });
}

window.approvePlayer = function(id) {
    const index = pendingPlayers.findIndex(p => p.id === id);
    if (index > -1) {
        const player = pendingPlayers.splice(index, 1)[0];
        player.status = "Approved";
        officialPlayers.push(player);
        
        localStorage.setItem('pending_players', JSON.stringify(pendingPlayers));
        localStorage.setItem('approved_players', JSON.stringify(officialPlayers));
        
        renderPublicVerifiedPlayersGrid();
        renderAdminControlPanels();
        alert("Player Approved!");
    }
};

window.deletePending = function(id) {
    pendingPlayers = pendingPlayers.filter(p => p.id !== id);
    localStorage.setItem('pending_players', JSON.stringify(pendingPlayers));
    renderAdminControlPanels();
};

window.deleteOfficial = function(id) {
    if (confirm("Remove player permanently?")) {
        officialPlayers = officialPlayers.filter(p => p.id !== id);
        localStorage.setItem('approved_players', JSON.stringify(officialPlayers));
        renderPublicVerifiedPlayersGrid();
        renderAdminControlPanels();
    }
};

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

