/**
 * Player class - Handles player controls, movement, and camera
 */
class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.position = new THREE.Vector3(0, 1.6, 20);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = { yaw: 0, pitch: 0 };
        this.speed = 0.3;
        this.health = 100;
        this.maxHealth = 100;
        this.alive = true;
        
        // Control states
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            shoot: false
        };
        
        this.weapon = new Weapon();
        this.setupCamera();
        this.setupControls();
    }

    setupCamera() {
        this.camera.position.copy(this.position);
        this.camera.rotation.order = 'YXZ';
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Mouse controls
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }

    onKeyDown(event) {
        switch(event.key) {
            case 'ArrowUp':
                this.keys.forward = true;
                break;
            case 'ArrowDown':
                this.keys.backward = true;
                break;
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'ArrowRight':
                this.keys.right = true;
                break;
            case ' ':
                event.preventDefault();
                this.keys.shoot = true;
                this.shoot();
                break;
        }
    }

    onKeyUp(event) {
        switch(event.key) {
            case 'ArrowUp':
                this.keys.forward = false;
                break;
            case 'ArrowDown':
                this.keys.backward = false;
                break;
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case ' ':
                this.keys.shoot = false;
                break;
        }
    }

    onMouseMove(event) {
        if (!document.pointerLockElement) return;

        const sensitivity = 0.002;
        this.rotation.yaw -= event.movementX * sensitivity;
        this.rotation.pitch -= event.movementY * sensitivity;

        // Limit pitch to prevent camera flipping
        this.rotation.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.pitch));
    }

    update(deltaTime, arena) {
        if (!this.alive) return;

        this.updateMovement(arena);
        this.updateCamera();
        this.weapon.update(deltaTime);
    }

    updateMovement(arena) {
        // Calculate movement direction
        const direction = new THREE.Vector3();
        
        if (this.keys.forward) direction.z -= 1;
        if (this.keys.backward) direction.z += 1;
        if (this.keys.left) direction.x -= 1;
        if (this.keys.right) direction.x += 1;
        
        if (direction.length() > 0) {
            direction.normalize();
            
            // Apply rotation to direction
            const rotatedDirection = direction.applyAxisAngle(
                new THREE.Vector3(0, 1, 0),
                this.rotation.yaw
            );
            
            // Update position
            this.position.x += rotatedDirection.x * this.speed;
            this.position.z += rotatedDirection.z * this.speed;
            
            // Check collision with arena boundaries
            arena.checkWallCollision(this.position, 1);
        }
    }

    updateCamera() {
        this.camera.position.copy(this.position);
        this.camera.rotation.y = this.rotation.yaw;
        this.camera.rotation.x = this.rotation.pitch;
    }

    shoot() {
        if (!this.alive) return;

        // Get shooting direction from camera
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);

        this.weapon.shoot(this.scene, this.position, direction, 'player');
    }

    takeDamage(damage) {
        if (!this.alive) return;

        this.health = Math.max(0, this.health - damage);
        
        if (this.health <= 0) {
            this.alive = false;
        }
    }

    reset(position) {
        this.position.copy(position);
        this.health = this.maxHealth;
        this.alive = true;
        this.rotation = { yaw: 0, pitch: 0 };
        this.weapon.reset();
        this.updateCamera();
    }

    getProjectiles() {
        return this.weapon.getActiveProjectiles();
    }

    getHealthPercentage() {
        return (this.health / this.maxHealth) * 100;
    }
}
