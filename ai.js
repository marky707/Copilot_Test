/**
 * AI class - Computer-controlled opponent with basic behavior
 */

// Constants
const FRAME_RATE_NORMALIZATION = 60;

class AI {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position.clone();
        this.health = 100;
        this.maxHealth = 100;
        this.alive = true;
        this.speed = 0.15;
        this.weapon = new Weapon();
        
        // AI states
        this.state = 'idle'; // idle, chase, attack
        this.target = null;
        this.shootCooldown = 0;
        this.shootInterval = 1000; // Shoot every 1 second
        this.detectionRange = 100;
        this.attackRange = 30;
        
        this.createMesh();
    }

    createMesh() {
        // Create simple AI body (box with a "head")
        const bodyGeometry = new THREE.BoxGeometry(1, 2, 1);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            emissive: 0x330000
        });
        this.bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.bodyMesh.position.copy(this.position);
        this.bodyMesh.position.y = 1;
        this.bodyMesh.castShadow = true;
        this.scene.add(this.bodyMesh);

        // Create head
        const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xcc0000,
            emissive: 0x440000
        });
        this.headMesh = new THREE.Mesh(headGeometry, headMaterial);
        this.headMesh.position.copy(this.position);
        this.headMesh.position.y = 2.5;
        this.headMesh.castShadow = true;
        this.scene.add(this.headMesh);

        // Add a light to make AI visible
        this.light = new THREE.PointLight(0xff0000, 0.5, 10);
        this.light.position.copy(this.position);
        this.light.position.y = 2;
        this.scene.add(this.light);
    }

    update(deltaTime, player, arena) {
        if (!this.alive) return;

        this.weapon.update(deltaTime);
        this.updateBehavior(deltaTime, player, arena);
        this.updateMeshPosition();
    }

    updateBehavior(deltaTime, player, arena) {
        if (!player.alive) {
            this.state = 'idle';
            return;
        }

        const distanceToPlayer = this.position.distanceTo(player.position);

        // Update state based on distance
        if (distanceToPlayer > this.detectionRange) {
            this.state = 'idle';
        } else if (distanceToPlayer > this.attackRange) {
            this.state = 'chase';
        } else {
            this.state = 'attack';
        }

        // Execute state behavior
        switch(this.state) {
            case 'idle':
                this.idle();
                break;
            case 'chase':
                this.chase(deltaTime, player, arena);
                break;
            case 'attack':
                this.attack(deltaTime, player, arena);
                break;
        }
    }

    idle() {
        // Do nothing or wander randomly
    }

    chase(deltaTime, player, arena) {
        // Move towards player
        const direction = new THREE.Vector3()
            .subVectors(player.position, this.position)
            .normalize();

        this.position.x += direction.x * this.speed * deltaTime * FRAME_RATE_NORMALIZATION;
        this.position.z += direction.z * this.speed * deltaTime * FRAME_RATE_NORMALIZATION;

        // Check collision with arena boundaries
        arena.checkWallCollision(this.position, 1);

        // Look at player
        this.lookAt(player.position);
    }

    attack(deltaTime, player, arena) {
        // Stop and shoot at player
        this.lookAt(player.position);
        
        // Try to shoot (deltaTime is in seconds, convert to milliseconds)
        this.shootCooldown -= deltaTime * 1000;
        if (this.shootCooldown <= 0) {
            this.shoot(player.position);
            this.shootCooldown = this.shootInterval;
        }

        // Still try to maintain optimal distance
        const distanceToPlayer = this.position.distanceTo(player.position);
        if (distanceToPlayer < 15) {
            // Back away if too close
            const direction = new THREE.Vector3()
                .subVectors(this.position, player.position)
                .normalize();
            this.position.x += direction.x * this.speed * 0.5 * deltaTime * FRAME_RATE_NORMALIZATION;
            this.position.z += direction.z * this.speed * 0.5 * deltaTime * FRAME_RATE_NORMALIZATION;
            arena.checkWallCollision(this.position, 1);
        }
    }

    lookAt(targetPosition) {
        const direction = new THREE.Vector3()
            .subVectors(targetPosition, this.position)
            .normalize();
        
        this.rotation = Math.atan2(direction.x, direction.z);
    }

    shoot(targetPosition) {
        if (!this.alive) return;

        // Calculate direction to target
        const direction = new THREE.Vector3()
            .subVectors(targetPosition, this.position);
        
        // Add some inaccuracy to make it less perfect
        const inaccuracy = 0.1;
        direction.x += (Math.random() - 0.5) * inaccuracy;
        direction.y += (Math.random() - 0.5) * inaccuracy;
        direction.z += (Math.random() - 0.5) * inaccuracy;
        direction.normalize();

        const shootPosition = this.position.clone();
        shootPosition.y = 1.6; // Eye level

        this.weapon.shoot(this.scene, shootPosition, direction, 'ai');
    }

    updateMeshPosition() {
        if (this.bodyMesh) {
            this.bodyMesh.position.copy(this.position);
            this.bodyMesh.position.y = 1;
            this.bodyMesh.rotation.y = this.rotation || 0;
        }
        if (this.headMesh) {
            this.headMesh.position.copy(this.position);
            this.headMesh.position.y = 2.5;
        }
        if (this.light) {
            this.light.position.copy(this.position);
            this.light.position.y = 2;
        }
    }

    takeDamage(damage) {
        if (!this.alive) return;

        this.health = Math.max(0, this.health - damage);
        
        // Flash effect when hit
        if (this.bodyMesh) {
            this.bodyMesh.material.emissive.setHex(0xff0000);
            setTimeout(() => {
                if (this.bodyMesh) {
                    this.bodyMesh.material.emissive.setHex(0x330000);
                }
            }, 100);
        }

        if (this.health <= 0) {
            this.alive = false;
            this.destroy();
        }
    }

    destroy() {
        if (this.bodyMesh) {
            this.scene.remove(this.bodyMesh);
            this.bodyMesh.geometry.dispose();
            this.bodyMesh.material.dispose();
        }
        if (this.headMesh) {
            this.scene.remove(this.headMesh);
            this.headMesh.geometry.dispose();
            this.headMesh.material.dispose();
        }
        if (this.light) {
            this.scene.remove(this.light);
        }
    }

    reset(position) {
        // Remove old meshes
        this.destroy();
        
        // Reset properties
        this.position.copy(position);
        this.health = this.maxHealth;
        this.alive = true;
        this.state = 'idle';
        this.shootCooldown = 0;
        this.weapon.reset();
        
        // Recreate meshes
        this.createMesh();
    }

    getProjectiles() {
        return this.weapon.getActiveProjectiles();
    }

    getHealthPercentage() {
        return (this.health / this.maxHealth) * 100;
    }
}
