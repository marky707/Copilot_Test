/**
 * Arena class - Creates and manages the 3D game environment
 */
class Arena {
    constructor(scene) {
        this.scene = scene;
        this.walls = [];
        this.arenaSize = 50; // Arena dimensions
        this.setup();
    }

    setup() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);

        // Create floor
        this.createFloor();

        // Create walls
        this.createWalls();

        // Create skybox
        this.createSkybox();
    }

    createFloor() {
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Add grid pattern to floor
        const gridHelper = new THREE.GridHelper(100, 50, 0x444444, 0x222222);
        this.scene.add(gridHelper);
    }

    createWalls() {
        const wallHeight = 10;
        const wallThickness = 1;
        const halfSize = this.arenaSize / 2;

        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.7,
            metalness: 0.3
        });

        // North wall
        const northWall = this.createWall(
            this.arenaSize, wallHeight, wallThickness,
            0, wallHeight / 2, -halfSize,
            wallMaterial
        );
        this.walls.push(northWall);

        // South wall
        const southWall = this.createWall(
            this.arenaSize, wallHeight, wallThickness,
            0, wallHeight / 2, halfSize,
            wallMaterial
        );
        this.walls.push(southWall);

        // East wall
        const eastWall = this.createWall(
            wallThickness, wallHeight, this.arenaSize,
            halfSize, wallHeight / 2, 0,
            wallMaterial
        );
        this.walls.push(eastWall);

        // West wall
        const westWall = this.createWall(
            wallThickness, wallHeight, this.arenaSize,
            -halfSize, wallHeight / 2, 0,
            wallMaterial
        );
        this.walls.push(westWall);
    }

    createWall(width, height, depth, x, y, z, material) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(x, y, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        this.scene.add(wall);
        return wall;
    }

    createSkybox() {
        // Simple gradient skybox
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
    }

    // Check if position is within arena bounds
    isWithinBounds(position, margin = 2) {
        const halfSize = this.arenaSize / 2 - margin;
        return Math.abs(position.x) < halfSize && 
               Math.abs(position.z) < halfSize;
    }

    // Get random spawn position
    getRandomSpawnPosition() {
        const margin = 5;
        const halfSize = this.arenaSize / 2 - margin;
        return new THREE.Vector3(
            (Math.random() - 0.5) * 2 * halfSize,
            1.6,
            (Math.random() - 0.5) * 2 * halfSize
        );
    }

    // Check collision with walls
    checkWallCollision(position, radius = 1) {
        const halfSize = this.arenaSize / 2;
        const margin = radius;

        // Check bounds
        if (position.x < -halfSize + margin) position.x = -halfSize + margin;
        if (position.x > halfSize - margin) position.x = halfSize - margin;
        if (position.z < -halfSize + margin) position.z = -halfSize + margin;
        if (position.z > halfSize - margin) position.z = halfSize - margin;

        return position;
    }
}
