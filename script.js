let coins = 1000;
let hp = 100;
let score = 0;
let currentGun = { name: 'M4A1 Assault', damage: 50, maxAmmo: 30, price: 0 };
let currentAmmo = 30;
let gameInterval = null;
let ownedGuns = { 'M4A1 Assault': true };

function updateDisplay() {
    document.getElementById('lobby-coins').innerText = coins;
    document.getElementById('hp-val').innerText = hp;
    document.getElementById('score-val').innerText = score;
    document.getElementById('current-gun-name').innerText = currentGun.name;
    document.getElementById('ammo-val').innerText = currentAmmo;
    document.getElementById('max-ammo-val').innerText = currentGun.maxAmmo;
}

function openArmory() {
    document.getElementById('armory-modal').classList.add('active');
}

function closeArmory() {
    document.getElementById('armory-modal').classList.remove('active');
}

function selectWeapon(name, damage, maxAmmo, price) {
    if (!ownedGuns[name]) {
        if (coins < price) {
            alert("Insufficient coins to purchase this weapon!");
            return;
        }
        coins -= price;
        ownedGuns[name] = true;
    }

    currentGun = { name, damage, maxAmmo, price };
    currentAmmo = maxAmmo;
    
    // Update tags UI safely
    updateArmoryTags();
    updateDisplay();
}

function updateArmoryTags() {
    const guns = [
        { id: 'tag-m4a1', name: 'M4A1 Assault', price: 0 },
        { id: 'tag-vector', name: 'Vector SMG', price: 200 },
        { id: 'tag-awm', name: 'AWM Sniper', price: 500 }
    ];

    guns.forEach(g => {
        const el = document.getElementById(g.id);
        if (currentGun.name === g.name) {
            el.innerText = "Equipped";
            el.className = "status-tag equipped";
        } else if (ownedGuns[g.name]) {
            el.innerText = "Owned";
            el.className = "status-tag";
        } else {
            el.innerText = "Cost: " + g.price + " 🪙";
            el.className = "status-tag";
        }
    });
}

function startMission() {
    document.getElementById('lobby-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    hp = 100;
    score = 0;
    currentAmmo = currentGun.maxAmmo;
    updateDisplay();
    startSpawner();
}

function returnToLobby() {
    if (gameInterval) clearInterval(gameInterval);
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('lobby-screen').classList.add('active');
    updateDisplay();
}

function fireWeapon(e) {
    // Prevent firing if clicking UI elements
    if (e.target.closest('.game-hud') || e.target.closest('.ammo-display')) return;

    if (currentAmmo > 0) {
        currentAmmo--;
    } else {
        currentAmmo = currentGun.maxAmmo; // Auto reload smoothly
    }
    updateDisplay();
}

function startSpawner() {
    if (gameInterval) clearInterval(gameInterval);
    
    const battlefield = document.getElementById('battlefield');

    gameInterval = setInterval(() => {
        if (!document.getElementById('game-screen').classList.contains('active')) {
            clearInterval(gameInterval);
            return;
        }

        const oldTarget = document.querySelector('.target-enemy');
        if (oldTarget) {
            oldTarget.remove();
            hp -= 10; // Miss penalty
            if (hp <= 0) {
                alert("Mission Failed! Hostiles overwhelmed your position.");
                returnToLobby();
                return;
            }
            updateDisplay();
        }

        const target = document.createElement('div');
        target.classList.add('target-enemy');
        target.innerHTML = '🎯';

        const maxX = battlefield.clientWidth - 60;
        const maxY = battlefield.clientHeight - 60;
        target.style.left = Math.max(10, Math.floor(Math.random() * Math.max(10, maxX))) + 'px';
        target.style.top = Math.max(10, Math.floor(Math.random() * Math.max(10, maxY))) + 'px';

        target.onclick = function(e) {
            e.stopPropagation();
            score += currentGun.damage;
            coins += 15; // Earn coins on successful target elimination
            target.remove();
            updateDisplay();
        };

        battlefield.appendChild(target);
    }, 1200);
}
