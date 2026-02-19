# 3D First-Person Shooter Arena Battle

A browser-based 3D first-person shooter game where you battle against a computer-controlled AI opponent in an arena. Built with Three.js and vanilla JavaScript.

## Features

- **3D Arena Environment** - Bounded arena with walls, floor, lighting, and skybox
- **First-Person Controls** - Mouse look and arrow key movement
- **Combat System** - Projectile-based shooting with hit detection
- **AI Opponent** - Smart AI that chases and attacks the player
- **Health System** - Both player and AI have health bars with visual feedback
- **Game UI** - HUD with health displays, score counter, and game over screens
- **Visual Effects** - Particle effects for hits and glowing projectiles

## How to Play

### Getting Started
1. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, or Edge)
2. Click the "Start Game" button
3. Click on the game screen to lock your mouse pointer

### Controls
- **Arrow Keys** - Move around the arena
  - ⬆️ Up Arrow - Move forward
  - ⬇️ Down Arrow - Move backward
  - ⬅️ Left Arrow - Strafe left
  - ➡️ Right Arrow - Strafe right
- **Mouse** - Look around (first-person view)
- **Space Bar** - Shoot projectiles

### Objective
- Defeat the AI opponent by depleting its health to zero
- Avoid getting hit by AI projectiles
- Survive and win the battle!

### Game Rules
- Both player and AI start with 100 HP
- Each successful hit deals 20 damage
- The game ends when either the player or AI reaches 0 HP
- Press "Restart Game" to play again after game over

## Technical Details

### File Structure
```
├── index.html      # Main HTML file with game canvas
├── styles.css      # UI styling and layout
├── game.js         # Main game logic and loop
├── player.js       # Player controls and movement
├── ai.js           # AI opponent behavior
├── arena.js        # 3D environment setup
├── weapon.js       # Projectile and shooting system
└── ui.js           # UI management and HUD
```

### Technologies Used
- **Three.js** (r128) - 3D graphics rendering
- **JavaScript ES6+** - Game logic
- **HTML5** - Structure
- **CSS3** - Styling and UI
- **Pointer Lock API** - Mouse control

### Browser Compatibility
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

**Note:** The game requires an internet connection on first load to download Three.js from CDN. After that, it will be cached by your browser.

## Performance
The game is optimized to run at 60 FPS with:
- Low-poly 3D models
- Efficient collision detection
- Optimized particle effects
- Simple but effective AI pathfinding

## Development

### Running Locally
No build process required! Simply open `index.html` in your browser.

For development with live reload, you can use any local server:
```bash
# Python 3
python -m http.server 8000

# Node.js (if you have http-server installed)
npx http-server

# PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

## Credits
Created as a demonstration of browser-based 3D game development using Three.js and vanilla JavaScript.