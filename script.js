window.addEventListener('load', function() {
    let progress = 0;
    const bar = document.getElementById('load-progress');
    const txt = document.getElementById('load-text');
    
    const loader = setInterval(function() {
        progress += 25;
        bar.style.width = progress + '%';
        txt.innerText = 'Loading Combat Engine... ' + progress + '%';
        
        if (progress >= 100) {
            clearInterval(loader);
            setTimeout(function() {
                document.getElementById('splash-screen').classList.remove('active');
                document.getElementById('hub-screen').classList.add('active');
            }, 300);
        }
    }, 100);
});

let currentMode = 'Campaign';
let currentWeapon = { name: 'M4A1 Assault', damage: 50, maxAmmo: 30 };
let userCoins = 1000;

function selectMode(mode) {
    currentMode = mode;
    document.getElementById('hub-screen').classList.remove('active');
    document.getElementById('world-screen').classList.add('active');
    document.getElementById('mode-header-title').innerText = mode + ' - Select Zone';
}

function openArmoryModal() {
    document.getElementById('armory-modal').classList.add('active');
}

function closeArmoryModal() {
    document.getElementById('armory-modal').classList.remove('active');
}

function equipWeapon(name, damage, ammoStr) {
    currentWeapon.name = name;
    currentWeapon.damage = damage;
    currentWeapon.maxAmmo = parseInt(ammoStr.split('/')[0]);
    ammo = currentWeapon.maxAmmo;
    
    document.getElementById('active-gun-name').innerText = '🔫 ' + name;
    refreshHUD();
    closeArmoryModal();
}

let score = 0;
let hp = 100;
let ammo = 30;
let level = 1;
let spawnerInterval = null;
let activeEnemies = [];

function launchGame(worldName, bg1, bg2) {
    document.getElementById('world-screen').classList.remove('active');
    document.getElementById('play-screen').classList.add('active');
    
    const battlefield = document.getElementById('battlefield');
    battlefield.style.background = 'linear-gradient(135deg, ' + bg1 + ', ' + bg2 + ')';
    document.getElementById('zone-indicator').innerText = 'Zone: ' + worldName + ' (' + currentMode + ')';
    
    score = 0;
    hp = 100;
    ammo = currentWeapon.maxAmmo;
    level = 1;
    activeEnemies = [];
    refreshHUD();
    
    startTargetSpawner();
}

function startTargetSpawner() {
    if (spawnerInterval) clearInterval(spawnerInterval);
    
    spawnerInterval = setInterval(function() {
        const battlefield = document.getElementById('battlefield');
        if (!document.getElementById('play-screen').classList.contains('active')) {
            clearInterval(spawnerInterval);
            return;
        }
        
        if (activeEnemies.length > 5) {
            let oldEn = activeEnemies.shift();
            if (oldEn && oldEn.element) {
                oldEn.element.remove();
                hp -= 15;
                if (hp <= 0) triggerGameOver();
                refreshHUD();
            }
        }
        
        const target = document.createElement('div');
        target.className = 'combat-target';
        target.innerHTML = '<div class="enemy-hp-bar"><div class="enemy-hp-fill"></div></div>' + (currentMode === 'Campaign' ? '🦹' : '👾');
        
        const maxX = battlefield.clientWidth - 70;
        const maxY = battlefield.clientHeight - 70;
        
        let posX = Math.max(20, Math.floor(Math.random() * maxX));
        let posY = Math.max(20, Math.floor(Math.random() * maxY));
        
        target.style.left = posX + 'px';
        target.style.top = posY + 'px';
        
        let vx = (Math.random() - 0.5) * 5;
        let vy = (Math.random() - 0.5) * 5;
        let enemyHealth = 100;
        
        let enemyObj = {
            element: target,
            update: function() {
                let curX = parseFloat(target.style.left) + vx;
                let curY = parseFloat(target.style.top) + vy;
                
                if (curX <= 10 || curX >= battlefield.clientWidth - 60) vx *= -1;
                if (curY <= 10 || curY >= battlefield.clientHeight - 60) vy *= -1;
                
                target.style.left = curX + 'px';
                target.style.top = curY + 'px';
            }
        };
        
        activeEnemies.push(enemyObj);
        
        target.onmousedown = function(e) {
            e.stopPropagation();
            if (ammo <= 0) return;
            
            enemyHealth -= currentWeapon.damage;
            const hpFill = target.querySelector('.enemy-hp-fill');
            if (hpFill) hpFill.style.width = Math.max(0, enemyHealth) + '%';
            
            target.style.transform = 'scale(1.2)';
            setTimeout(function() { target.style.transform = 'scale(1)'; }, 100);
            
            if (enemyHealth <= 0) {
                score += 100;
                userCoins += 50;
                document.getElementById('user-coins').innerText = userCoins;
                
                if (score >= level * 300) level++;
                
                activeEnemies = activeEnemies.filter(function(en) { return en.element !== target; });
                target.style.transform = 'scale(2)';
                target.style.opacity = '0';
                setTimeout(function() { target.remove(); }, 150);
            }
            refreshHUD();
        };
        
        battlefield.appendChild(target);
    }, 1200);
}

setInterval(function() {
    if (document.getElementById('play-screen').classList.contains('active')) {
        activeEnemies.forEach(function(en) { en.update(); });
    }
}, 30);

function shootWeapon(e) {
    if (ammo <= 0) return;
    ammo--;
    refreshHUD();
    
    const battlefield = document.getElementById('battlefield');
    const muzzleFlash = document.createElement('div');
    muzzleFlash.style.position = 'absolute';
    muzzleFlash.style.left = (e.clientX - 12) + 'px';
    muzzleFlash.style.top = (e.clientY - 12) + 'px';
    muzzleFlash.style.width = '24px';
    muzzleFlash.style.height = '24px';
    muzzleFlash.style.background = 'radial-gradient(circle, #facc15 0%, #ef4444 100%)';
    muzzleFlash.style.borderRadius = '50%';
    muzzleFlash.style.pointerEvents = 'none';
    battlefield.appendChild(muzzleFlash);
    setTimeout(function() { muzzleFlash.remove(); }, 70);
}

function reloadAmmo() {
    ammo = currentWeapon.maxAmmo;
    refreshHUD();
}

function throwGrenade() {
    score += 300;
    activeEnemies.forEach(function(en) { en.element.remove(); });
    activeEnemies = [];
    refreshHUD();
}

function refreshHUD() {
    document.getElementById('hp-val').innerText = hp;
    document.getElementById('score-val').innerText = score;
    document.getElementById('lvl-val').innerText = level;
    document.getElementById('ammo-txt').innerText = ammo + '/' + currentWeapon.maxAmmo;
}

function triggerGameOver() {
    if (spawnerInterval) clearInterval(spawnerInterval);
    activeEnemies.forEach(function(en) { en.element.remove(); });
    activeEnemies = [];
    score = 0;
    hp = 100;
    ammo = currentWeapon.maxAmmo;
    goHome();
}

function goHome() {
    if (spawnerInterval) clearInterval(spawnerInterval);
    activeEnemies.forEach(function(en) { en.element.remove(); });
    activeEnemies = [];
    document.getElementById('play-screen').classList.remove('active');
    document.getElementById('world-screen').classList.remove('active');
    document.getElementById('hub-screen').classList.add('active');
}
