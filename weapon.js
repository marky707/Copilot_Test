/**
 * Projectile class - Represents a bullet/laser shot
 */

// Constants
const FRAME_RATE_NORMALIZATION = 60;

class Projectile {
    constructor(scene, position, direction, owner) {
        this.scene = scene;
        this.position = position.clone();
        this.direction = direction.clone().normalize();
        this.owner = owner; // 'player' or 'ai'
        this.speed = 2;
        this.damage = 20;
        this.lifetime = 3000; // 3 seconds
        this.creationTime = Date.now();
        this.active = true;
        
        this.createMesh();
    }

    createMesh() {
        // Create a glowing projectile
        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: this.owner === 'player' ? 0x00ff00 : 0xff0000,
            emissive: this.owner === 'player' ? 0x00ff00 : 0xff0000,
            emissiveIntensity: 1
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        
        // Add point light for glow effect
        this.light = new THREE.PointLight(
            this.owner === 'player' ? 0x00ff00 : 0xff0000,
            1,
            5
        );
        this.light.position.copy(this.position);
        
        this.scene.add(this.mesh);
        this.scene.add(this.light);
    }

    update(deltaTime) {
        if (!this.active) return;

        // Move projectile (frame-rate independent)
        const velocity = this.direction.clone().multiplyScalar(this.speed * deltaTime * FRAME_RATE_NORMALIZATION);
        this.position.add(velocity);
        this.mesh.position.copy(this.position);
        this.light.position.copy(this.position);

        // Check lifetime
        if (Date.now() - this.creationTime > this.lifetime) {
            this.destroy();
        }

        // Check if out of bounds
        if (Math.abs(this.position.x) > 50 || 
            Math.abs(this.position.z) > 50 || 
            this.position.y < 0 || 
            this.position.y > 20) {
            this.destroy();
        }
    }

    destroy() {
        this.active = false;
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        if (this.light) {
            this.scene.remove(this.light);
        }
    }

    // Check collision with target position
    checkCollision(targetPosition, targetRadius = 1) {
        if (!this.active) return false;
        const distance = this.position.distanceTo(targetPosition);
        return distance < (targetRadius + 0.2);
    }
}

/**
 * Weapon class - Manages shooting mechanics
 */
class Weapon {
    constructor() {
        this.fireRate = 500; // milliseconds between shots
        this.lastFireTime = 0;
        this.projectiles = [];
    }

    canShoot() {
        const currentTime = Date.now();
        return currentTime - this.lastFireTime >= this.fireRate;
    }

    shoot(scene, position, direction, owner) {
        if (!this.canShoot()) return null;

        this.lastFireTime = Date.now();
        
        // Offset the projectile start position slightly forward
        const offsetPosition = position.clone().add(
            direction.clone().multiplyScalar(1)
        );
        
        const projectile = new Projectile(scene, offsetPosition, direction, owner);
        this.projectiles.push(projectile);
        
        return projectile;
    }

    update(deltaTime) {
        // Update all active projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(deltaTime);
            
            // Remove inactive projectiles
            if (!projectile.active) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    getActiveProjectiles() {
        return this.projectiles.filter(p => p.active);
    }

    reset() {
        // Destroy all projectiles
        this.projectiles.forEach(projectile => projectile.destroy());
        this.projectiles = [];
        this.lastFireTime = 0;
    }
}
