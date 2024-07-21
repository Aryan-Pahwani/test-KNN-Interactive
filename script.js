const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let particleSize = 2;
let alienSize = 10;
let density = 20;
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;
    init();
}

window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = particleSize;
        this.baseX = x;
        this.baseY = y;
        this.density = (Math.random() * 30) + 1;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = 100;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;
        
        if (distance < maxDistance) {
            this.x -= directionX;
            this.y -= directionY;
        } else {
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx/10;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy/10;
            }
        }
    }
}

class Alien {
    constructor(x, y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.size = alienSize;
        this.color = this.randomColor();
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.stroke();
    }

    randomColor() {
        return `rgb(${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)})`;
    }
}

const particles = [];
const aliens = [];
const mouse = {
    x: null,
    y: null,
    radius: 150
}

function getClosestAlienColor(x, y) {
    let closestDist = Infinity;
    let closestColor = 'white';
    for (let alien of aliens) {
        let dx = x - alien.x;
        let dy = y - alien.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < closestDist) {
            closestDist = distance;
            closestColor = alien.color;
        }
    }
    return closestColor;
}

function init() {
    particles.length = 0;
    aliens.length = 0;

    for (let i = 0; i < 3; i++) {
        aliens.push(new Alien());
    }

    createParticles();
}

function createParticles() {
    particles.length = 0;
    for (let y = 0; y < canvas.height; y += density) {
        for (let x = 0; x < canvas.width; x += density) {
            let color = getClosestAlienColor(x, y);
            particles.push(new Particle(x, y, color));
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].draw();
        particles[i].update();
    }
    for (let i = 0; i < aliens.length; i++) {
        aliens[i].draw();
    }
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', function(event) {
    mouse.x = event.x - canvas.offsetLeft;
    mouse.y = event.y - canvas.offsetTop;
});

canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    aliens.push(new Alien(x, y));
    createParticles();
});

canvas.addEventListener('contextmenu', function(event) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    let clickedAlien = aliens.find(alien => 
        Math.sqrt((x - alien.x)**2 + (y - alien.y)**2) < alien.size
    );

    if (clickedAlien) {
        showContextMenu(clickedAlien, event.clientX, event.clientY);
    }
});

function showContextMenu(alien, x, y) {
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';

    const changeColorBtn = document.createElement('button');
    changeColorBtn.textContent = 'Change Color';
    changeColorBtn.onclick = () => {
        alien.color = alien.randomColor();
        createParticles();
        document.body.removeChild(menu);
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => {
        aliens.splice(aliens.indexOf(alien), 1);
        createParticles();
        document.body.removeChild(menu);
    };

    menu.appendChild(changeColorBtn);
    menu.appendChild(deleteBtn);
    document.body.appendChild(menu);

    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target)) {
            document.body.removeChild(menu);
            document.removeEventListener('click', closeMenu);
        }
    });
}

function createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';

    const bgColorLabel = document.createElement('label');
    bgColorLabel.textContent = 'Background Color:';
    const bgColorInput = document.createElement('input');
    bgColorInput.type = 'color';
    bgColorInput.value = '#ffffff';
    bgColorInput.addEventListener('input', (e) => {
        document.body.style.backgroundColor = e.target.value;
    });

    const particleSizeLabel = document.createElement('label');
    particleSizeLabel.textContent = 'Particle Size:';
    const particleSizeInput = document.createElement('input');
    particleSizeInput.type = 'range';
    particleSizeInput.min = '1';
    particleSizeInput.max = '10';
    particleSizeInput.value = particleSize;
    particleSizeInput.addEventListener('input', (e) => {
        particleSize = parseInt(e.target.value);
        createParticles();
    });

    const alienSizeLabel = document.createElement('label');
    alienSizeLabel.textContent = 'Alien Size:';
    const alienSizeInput = document.createElement('input');
    alienSizeInput.type = 'range';
    alienSizeInput.min = '5';
    alienSizeInput.max = '30';
    alienSizeInput.value = alienSize;
    alienSizeInput.addEventListener('input', (e) => {
        alienSize = parseInt(e.target.value);
        aliens.forEach(alien => alien.size = alienSize);
    });

    const densityLabel = document.createElement('label');
    densityLabel.textContent = 'Density:';
    const densityInput = document.createElement('input');
    densityInput.type = 'range';
    densityInput.min = '5';
    densityInput.max = '30';
    densityInput.value = density;
    densityInput.addEventListener('input', (e) => {
        density = 34-parseInt(e.target.value);
        createParticles();
    });

    sidebar.appendChild(bgColorLabel);
    sidebar.appendChild(bgColorInput);
    sidebar.appendChild(particleSizeLabel);
    sidebar.appendChild(particleSizeInput);
    sidebar.appendChild(alienSizeLabel);
    sidebar.appendChild(alienSizeInput);
    sidebar.appendChild(densityInput);
    sidebar.appendChild(densityLabel);

    document.body.appendChild(sidebar);
}

resizeCanvas();
createSidebar();
animate();