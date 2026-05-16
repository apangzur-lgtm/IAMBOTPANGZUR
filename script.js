// ==========================================
// 1. FIREBASE CONFIGURATION SETUP INITIALIZER
// ==========================================
// Your live, verified Firebase project credentials
const firebaseConfig = {
    apiKey: "AIzaSyAakHKECzXnsxmvofA-seaQE8Xjfqwd6D0",
    authDomain: "iambot-hub.firebaseapp.com",
    databaseURL: "https://iambot-hub-default-rtdb.firebaseio.com",
    projectId: "iambot-hub",
    storageBucket: "iambot-hub.firebasestorage.app",
    messagingSenderId: "897462850468",
    appId: "1:897462850468:web:904bcdabbf0f64f2682731"
};

// Initialize app compatibility layers instance
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Setup references endpoints
const registrationsRef = database.ref('registrations');
const commentsRef = database.ref('comments');
const mediaRef = database.ref('media');

// Local Global Dynamic Operational Cache State Arrays
let cachedRegistrations = {};

// ==========================================
// 2. RUNTIME LOADER & UI NAV MANAGEMENT
// ==========================================
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    }, 600);
    initializeCountdown(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)); // Default 7 days forward
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

    if (!username || !whatsapp || !division) return alert("Please fill all inputs.");

    // Validation Check: Prevent duplicates based on user lookup matching keys
    const isDuplicate = Object.values(cachedRegistrations).some(player => 
        player.username.toLowerCase() === username.toLowerCase()
    );

    if (isDuplicate) {
        alert("Error: This eFootball username is already filed or officially registered!");
        return;
    }

    // Push new entry record node securely onto database reference stream
    registrationsRef.push({
        username: username,
        whatsapp: whatsapp,
        division: division,
        status: "Pending Approval",
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        alert("Registration Submission Received!\nStatus: Pending Admin approval validation before card creation.");
        document.getElementById('registration-form').reset();
    }).catch(err => {
        console.error(err);
        alert("Database execution error. Verify connection profiles configurations.");
    });
});

// ==========================================
// 5. DATA FETCH LISTENERS & UI RENDERING
// ==========================================

// Handle Realtime Changes to Player Registrations Directory
registrationsRef.on('value', snapshot => {
    const data = snapshot.val() || {};
    cachedRegistrations = data; // Update local memory structure cache instance
    
    renderPublicVerifiedPlayersGrid(data);
    renderAdminControlPanels(data);
});

function renderPublicVerifiedPlayersGrid(playersObj) {
    const container = document.getElementById('player-grid-container');
    container.innerHTML = ''; // Wipe frame view clean
    
    const verifiedPlayers = Object.values(playersObj).filter(p => p.status === "Approved");
    document.getElementById('total-registered-count').innerText = verifiedPlayers.length;

    if (verifiedPlayers.length === 0) {
        container.innerHTML = `<div class="no-players-fallback">No fighters approved yet. Be the first to secure a grid placement slot!</div>`;
        return;
    }

    verifiedPlayers.forEach(player => {
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

// Public Interactive Search Realtime Filtration Input Mechanism
document.getElementById('player-search').addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('#player-grid-container .player-card');
    
    cards.forEach(card => {
        const name = card.querySelector('h4').innerText.toLowerCase();
        card.style.display = name.includes(query) ? 'flex' : 'none';
    });
});

// ==========================================
// 6. LIVE COMMUNITY BANTER FEED SYSTEM
// ==========================================
document.getElementById('comment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const nameInput = document.getElementById('comment-username');
    const textInput = document.getElementById('comment-text');

    commentsRef.push({
        user: nameInput.value.trim(),
        text: textInput.value.trim(),
        time: firebase.database.ServerValue.TIMESTAMP
    });
    textInput.value = ''; // Clean prompt space
});

commentsRef.limitToLast(40).on('value', snapshot => {
    const container = document.getElementById('chat-messages-container');
    container.innerHTML = '';
    
    snapshot.forEach(child => {
        const msg = child.val();
        const dateStr = msg.time ? new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
        
        const bubble = document.createElement('div');
        bubble.className = 'chat-msg';
        bubble.innerHTML = `
            <div class="chat-msg-header">
                <span class="chat-user">${escapeHTML(msg.user)}</span>
                <span class="chat-time">${dateStr}</span>
            </div>
            <div class="chat-text">${escapeHTML(msg.text)}</div>
        `;
        container.appendChild(bubble);
    });
    container.scrollTop = container.scrollHeight; // Auto anchor base focus down
});

// ==========================================
// 7. TOURNAMENT MEDIA HQ DISPLAY LOADER
// ==========================================
mediaRef.on('value', snapshot => {
    const grid = document.getElementById('media-display-grid');
    const adminMediaList = document.getElementById('admin-media-list');
    const data = snapshot.val() || {};
    
    adminMediaList.innerHTML = '';
    
    if (Object.keys(data).length > 0) {
        grid.innerHTML = ''; // Wipe fallback defaults
        
        Object.entries(data).forEach(([key, asset]) => {
            // Render to Public Section Display Layout Frame Matrix Base Grid Layout Card
            const card = document.createElement('div');
            card.className = 'media-card';
            card.innerHTML = `
                <h4>${escapeHTML(asset.type)}</h4>
                <img src="${encodeURI(asset.url)}" class="media-img-frame" alt="Tournament Graphic Asset" onerror="this.parentElement.innerHTML='<p style=\'color:red\'>Failed to load media layout link address element asset target.</p>'">
            `;
            grid.appendChild(card);

            // Render Control Operations Tracker Inside Managed Elements Viewport Component
            const managedItem = document.createElement('div');
            managedItem.className = 'managed-media-item';
            managedItem.innerHTML = `
                <span>${escapeHTML(asset.type)}</span>
                <button onclick="deleteMediaAsset('${key}')" class="btn-action btn-reject">Drop</button>
            `;
            adminMediaList.innerHTML += managedItem.outerHTML;
        });
    }
});

// ==========================================
// 8. SECURITY MODERATION ACCESS CONTROLS (ADMIN)
// ==========================================
const adminPasswordHashKey = "IAMBOT_ADMIN_2026"; // Your access password bypass token string literal

document.getElementById('admin-login-btn').addEventListener('click', () => {
    const token = prompt("Provide Hub Dashboard Security Credentials:");
    if (token === adminPasswordHashKey) {
        document.getElementById('admin-dashboard').classList.remove('hidden');
        document.getElementById('admin-dashboard').scrollIntoView();
        alert("Credentials Verified. Operational Grid Synchronized.");
    } else if (token !== null) {
        alert("Access Refused: Signature Identification Mismatch.");
    }
});

document.getElementById('admin-logout-btn').addEventListener('click', () => {
    document.getElementById('admin-dashboard').classList.add('hidden');
    window.scrollTo(0,0);
});

function renderAdminControlPanels(playersObj) {
    const pendingBody = document.getElementById('admin-pending-table-body');
    const allBody = document.getElementById('admin-all-players-body');
    
    pendingBody.innerHTML = '';
    allBody.innerHTML = '';

    Object.entries(playersObj).forEach(([id, player]) => {
        if (player.status === "Pending Approval") {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHTML(player.username)}</strong></td>
                <td><a href="https://wa.me/${player.whatsapp.replace(/\D/g,'')}" target="_blank" style="color:#00ff66; text-decoration:none;"><i class="fa-brands fa-whatsapp"></i> Chat</a></td>
                <td>${escapeHTML(player.division)}</td>
                <td>
                    <div class="action-btn-group">
                        <button onclick="updatePlayerStatus('${id}', 'Approved')" class="btn-action btn-approve">Pass</button>
                        <button onclick="removePlayerEntry('${id}')" class="btn-action btn-reject">Deny</button>
                    </div>
                </td>
            `;
            pendingBody.appendChild(tr);
        }

        // Output all registers tracking list array rows
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHTML(player.username)}</td>
            <td style="color:${player.status === 'Approved' ? '#00ff66' : '#ff9900'}">${player.status}</td>
            <td><button onclick="removePlayerEntry('${id}')" class="btn-action btn-reject"><i class="fa-solid fa-trash"></i></button></td>
        `;
        allBody.appendChild(row);
    });
}

// Action Handlers
window.updatePlayerStatus = function(id, status) {
    registrationsRef.child(id).update({ status: status })
        .then(() => alert("Profile Credentials Context Mutated Successfully."))
        .catch(err => alert("Operation Refused: " + err.message));
};

window.removePlayerEntry = function(id) {
    if (confirm("Confirm permanent records modification purge context operations command execution parameters?")) {
        registrationsRef.child(id).remove()
            .then(() => alert("Selected Identity Index Erased from Storage Tree Matrix Grid System."));
    }
};

// Handle Image Push Updates
document.getElementById('admin-media-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const type = document.getElementById('media-type-select').value;
    const url = document.getElementById('media-url-input').value.trim();

    mediaRef.push({ type: type, url: url }).then(() => {
        alert("Media Asset Track Generated and Synchronized.");
        document.getElementById('admin-media-form').reset();
    });
});

window.deleteMediaAsset = function(key) {
    if (confirm("Evict this media asset element out from the public gallery space?")) {
        mediaRef.child(key).remove();
    }
};

// Security Text Sanitization Utility Hook
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

