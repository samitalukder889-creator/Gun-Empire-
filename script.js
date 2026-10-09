let coins = 1000;
let hp = 100;
let score = 0;
let currentGun = { name: 'M4A1 Assault', damage: 50, maxAmmo: 30, price: 0 };
let currentAmmo = 30;
let gameInterval = null;
let ownedGuns = { 'M4A1 Assault': true };
let playerX = 50;

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

function movePlayer(direction) {
    const player = document.getElementById('player-character');
    if (direction === 'left' && playerX > 20) {
        playerX -= 25;
    } else if (direction === 'right' && playerX < window.innerWidth - 150) {
        playerX += 25;
    } else if (direction === 'forward') {
        playerX += 10; // Moves slightly forward towards enemies
    }
    player.style.left = playerX + 'px';
}

function startMission() {
    document.getElementById('lobby-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    hp = 100;
    score = 0;
    playerX = 50;
    document.getElementById('player-character').style.left = playerX + 'px';
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

function fireWeapon() {
    if (currentAmmo > 0) {
        currentAmmo--;
    } else {
        currentAmmo = currentGun.maxAmmo; // Auto reload
    }
    updateDisplay();

    // Check if any enemy is in front to shoot
    const enemies = document.querySelectorAll('.enemy-unit');
    if (enemies.length > 0) {
        // Hit the first active enemy
        const targetEnemy = enemies[0];
        score += currentGun.damage;
        coins += 15;
        targetEnemy.remove();
        updateDisplay();
    }
}

function startSpawner() {
    if (gameInterval) clearInterval(gameInterval);
    
    const container = document.getElementById('enemies-container');
    container.innerHTML = '';

    gameInterval = setInterval(() => {
        if (!document.getElementById('game-screen').classList.contains('active')) {
            clearInterval(gameInterval);
            return;
        }

        // Limit active enemies on screen
        if (container.children.length < 3) {
            const enemy = document.createElement('div');
            enemy.classList.add('enemy-unit');
            enemy.innerHTML = '🦹‍♂️';

            const randomX = Math.floor(Math.random() * (window.innerWidth - 150)) + 100;
            const randomY = Math.floor(Math.random() * 150) + 50;

            enemy.style.left = randomX + 'px';
            enemy.style.top = randomY + 'px';

            // Allow clicking enemy directly as well
            enemy.onclick = function(e) {
                e.stopPropagation();
                score += currentGun.damage;
                coins += 20;
                enemy.remove();
                updateDisplay();
            };

            container.appendChild(enemy);
        } else {
            // Enemy attacks player if not killed
            hp -= 10;
            if (hp <= 0) {
                alert("Mission Failed! Hostiles defeated your squad.");
                returnToLobby();
                return;
            }
            updateDisplay();
        }
    }, 1500);
}
