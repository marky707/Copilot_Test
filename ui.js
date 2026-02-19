/**
 * UI class - Manages all UI elements and HUD
 */
class UI {
    constructor() {
        this.elements = {
            playerHealthBar: document.getElementById('player-health-bar'),
            playerHealthText: document.getElementById('player-health-text'),
            aiHealthBar: document.getElementById('ai-health-bar'),
            aiHealthText: document.getElementById('ai-health-text'),
            scoreText: document.getElementById('score-text'),
            startMenu: document.getElementById('start-menu'),
            gameOverMenu: document.getElementById('game-over-menu'),
            gameOverTitle: document.getElementById('game-over-title'),
            gameOverMessage: document.getElementById('game-over-message'),
            startButton: document.getElementById('start-button'),
            restartButton: document.getElementById('restart-button'),
            instructions: document.getElementById('instructions'),
            crosshair: document.getElementById('crosshair'),
            hud: document.getElementById('hud')
        };

        this.score = 0;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.elements.startButton.addEventListener('click', () => {
            this.hideStartMenu();
            this.requestPointerLock();
        });

        this.elements.restartButton.addEventListener('click', () => {
            this.hideGameOverMenu();
            this.resetScore();
            this.requestPointerLock();
            if (window.game) {
                window.game.restart();
            }
        });

        // Handle pointer lock changes
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement) {
                this.elements.instructions.classList.add('hidden');
            }
        });
    }

    requestPointerLock() {
        const canvas = document.getElementById('game-canvas');
        canvas.requestPointerLock = canvas.requestPointerLock || 
                                    canvas.mozRequestPointerLock || 
                                    canvas.webkitRequestPointerLock;
        canvas.requestPointerLock();
    }

    updatePlayerHealth(health, maxHealth) {
        const percentage = (health / maxHealth) * 100;
        this.elements.playerHealthBar.style.width = percentage + '%';
        this.elements.playerHealthText.textContent = Math.ceil(health) + ' HP';
        
        // Change color based on health
        if (percentage < 25) {
            this.elements.playerHealthBar.style.background = 'linear-gradient(90deg, #ff0000 0%, #cc0000 100%)';
        } else if (percentage < 50) {
            this.elements.playerHealthBar.style.background = 'linear-gradient(90deg, #ff9800 0%, #ff5722 100%)';
        } else {
            this.elements.playerHealthBar.style.background = 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)';
        }
    }

    updateAIHealth(health, maxHealth) {
        const percentage = (health / maxHealth) * 100;
        this.elements.aiHealthBar.style.width = percentage + '%';
        this.elements.aiHealthText.textContent = Math.ceil(health) + ' HP';
    }

    updateScore(score) {
        this.score = score;
        this.elements.scoreText.textContent = 'Kills: ' + score;
    }

    incrementScore() {
        this.score++;
        this.updateScore(this.score);
    }

    resetScore() {
        this.score = 0;
        this.updateScore(this.score);
    }

    showStartMenu() {
        this.elements.startMenu.classList.remove('hidden');
        this.elements.hud.classList.add('hidden');
        this.elements.crosshair.classList.add('hidden');
    }

    hideStartMenu() {
        this.elements.startMenu.classList.add('hidden');
        this.elements.hud.classList.remove('hidden');
        this.elements.crosshair.classList.remove('hidden');
    }

    showGameOverMenu(winner) {
        this.elements.gameOverMenu.classList.remove('hidden');
        this.elements.hud.classList.add('hidden');
        this.elements.crosshair.classList.add('hidden');
        
        if (winner === 'player') {
            this.elements.gameOverTitle.textContent = 'Victory!';
            this.elements.gameOverTitle.style.color = '#4CAF50';
            this.elements.gameOverMessage.textContent = 'You defeated the AI opponent!';
        } else {
            this.elements.gameOverTitle.textContent = 'Defeat!';
            this.elements.gameOverTitle.style.color = '#f44336';
            this.elements.gameOverMessage.textContent = 'The AI opponent defeated you.';
        }
        
        // Exit pointer lock
        if (document.exitPointerLock) {
            document.exitPointerLock();
        }
    }

    hideGameOverMenu() {
        this.elements.gameOverMenu.classList.add('hidden');
        this.elements.hud.classList.remove('hidden');
        this.elements.crosshair.classList.remove('hidden');
    }

    showInstructions() {
        this.elements.instructions.classList.remove('hidden');
    }

    hideInstructions() {
        this.elements.instructions.classList.add('hidden');
    }
}
