/**
 * Game class - Main game logic and loop
 */

// Constants for frame-rate independence
const FRAME_RATE_NORMALIZATION = 60;
const PARTICLE_FADE_RATE = 0.02;

class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.arena = null;
        this.player = null;
        this.ai = null;
        this.ui = null;
        this.clock = new THREE.Clock();
        this.running = false;
        this.gameState = 'menu'; // menu, playing, gameover
        
        this.init();
    }

    init() {
        // Setup Three.js scene
        this.setupScene();
        this.setupRenderer();
        
        // Create game objects
        this.arena = new Arena(this.scene);
        this.player = new Player(this.scene, this.camera);
        this.ai = new AI(this.scene, new THREE.Vector3(0, 0, -20));
        
        // Setup UI
        this.ui = new UI();
        
        // Start render loop
        this.animate();
        
        // Make game globally accessible for UI callbacks
        window.game = this;
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 100);
        
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
    }

    setupRenderer() {
        const canvas = document.getElementById('game-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    start() {
        this.running = true;
        this.gameState = 'playing';
        
        // Reset entities
        this.player.reset(new THREE.Vector3(0, 1.6, 20));
        this.ai.reset(new THREE.Vector3(0, 0, -20));
        
        // Update UI
        this.ui.updatePlayerHealth(this.player.health, this.player.maxHealth);
        this.ui.updateAIHealth(this.ai.health, this.ai.maxHealth);
    }

    restart() {
        this.start();
    }

    update() {
        const deltaTime = this.clock.getDelta();

        if (this.gameState !== 'playing') return;

        // Update game entities
        this.player.update(deltaTime, this.arena);
        this.ai.update(deltaTime, this.player, this.arena);

        // Check collisions
        this.checkCollisions();

        // Update UI
        this.ui.updatePlayerHealth(this.player.health, this.player.maxHealth);
        this.ui.updateAIHealth(this.ai.health, this.ai.maxHealth);

        // Check game over conditions
        this.checkGameOver();
    }

    checkCollisions() {
        // Check player projectiles hitting AI
        const playerProjectiles = this.player.getProjectiles();
        for (const projectile of playerProjectiles) {
            if (projectile.checkCollision(this.ai.position, 1)) {
                this.ai.takeDamage(projectile.damage);
                projectile.destroy();
                
                // Create hit effect
                this.createHitEffect(projectile.position);
            }
        }

        // Check AI projectiles hitting player
        const aiProjectiles = this.ai.getProjectiles();
        for (const projectile of aiProjectiles) {
            if (projectile.checkCollision(this.player.position, 1)) {
                this.player.takeDamage(projectile.damage);
                projectile.destroy();
                
                // Create hit effect
                this.createHitEffect(projectile.position);
            }
        }
    }

    createHitEffect(position) {
        // Simple particle effect for hits
        const particleCount = 10;
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 4, 4);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0xffff00,
                transparent: true,
                opacity: 1
            });
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2
            );
            
            this.scene.add(particle);
            
            // Animate particle with time tracking for frame-rate independence
            let lastTime = Date.now();
            const animateParticle = () => {
                const currentTime = Date.now();
                const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
                lastTime = currentTime;
                
                // Update position and opacity based on deltaTime
                const velocityScaled = velocity.clone().multiplyScalar(deltaTime * FRAME_RATE_NORMALIZATION);
                particle.position.add(velocityScaled);
                particle.material.opacity -= PARTICLE_FADE_RATE * deltaTime * FRAME_RATE_NORMALIZATION;
                
                if (particle.material.opacity > 0) {
                    requestAnimationFrame(animateParticle);
                } else {
                    this.scene.remove(particle);
                    particle.geometry.dispose();
                    particle.material.dispose();
                }
            };
            animateParticle();
        }
    }

    checkGameOver() {
        if (!this.player.alive) {
            this.gameOver('ai');
        } else if (!this.ai.alive) {
            this.gameOver('player');
        }
    }

    gameOver(winner) {
        this.gameState = 'gameover';
        this.running = false;
        
        if (winner === 'player') {
            this.ui.incrementScore();
        }
        
        this.ui.showGameOverMenu(winner);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
