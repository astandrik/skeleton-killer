# Skeleton Killer

A real-time multiplayer browser game where players fight skeletons in a graveyard. Built with Node.js, TypeScript, Phaser 3, and Socket.IO.

## Core Game Mechanics

### Player System

- Players are represented by knight sprites
- Local player has blue tint to distinguish from other players
- Health pool of 100 points
- Combat range of 50 units with 10 damage per hit
- 500ms attack cooldown
- Full directional movement using arrow keys
- Spacebar triggers attacks

### Enemy System

- Skeletons with 50 health points
- AI-driven following behavior
- Movement speed of 40 units per second
- Maintains minimum distance of 30 units from target
- Visual feedback on damage (red tint and shake animation)
- Automatic targeting system for nearest player

## Technical Architecture

The game uses a sophisticated component-based architecture for maximum flexibility and maintainability.

### Entity System

Base entity class provides core functionality:

```typescript
class Entity {
  protected sprite: Phaser.GameObjects.Sprite;
  protected components: Map<string, Component>;
  public readonly id: string;

  addComponent(component: Component): void;
  getComponent<T extends Component>(name: string): T | undefined;
  hasComponent(name: string): boolean;
  update(delta: number): void;
  getPosition(): { x: number; y: number };
  setPosition(x: number, y: number): void;
}
```

### Component System

All components extend the base Component class:

```typescript
abstract class Component {
  protected entity: Entity | null;
  abstract readonly name: string;

  initialize(entity: Entity): void;
  abstract update(delta: number): void;
  destroy(): void;
}
```

#### Core Components

1. **PhysicsComponent**

- Integrates with Phaser's Arcade Physics system
- Handles velocity-based movement
- Manages collision detection

```typescript
setVelocity(x: number, y: number): void;
```

2. **HealthComponent**

- Manages entity health points
- Handles damage and healing
- Triggers destruction on zero health

```typescript
takeDamage(amount: number): void;
heal(amount: number): void;
getHealth(): number;
```

3. **CombatComponent**

- Configurable attack range, damage, and cooldown
- Distance-based attack validation
- Cooldown management

```typescript
canAttack(): boolean;
attack(target: Entity): void;
```

4. **FollowComponent**

- AI behavior for enemies
- Configurable movement speed and minimum distance
- Smooth target following with velocity-based movement

```typescript
setTarget(target: Entity): void;
```

5. **NetworkComponent**

- Handles multiplayer synchronization
- Manages real-time state updates
- Coordinates player actions across clients

6. **InputComponent**

- Processes keyboard input for player control
- Manages attack key (spacebar) and movement (arrow keys)
- Local player control only

### Networking Architecture

The networking system uses Socket.IO for real-time communication:

#### Data Structures

```typescript
interface PlayerInfo {
  id: string;
  x: number;
  y: number;
  health: number;
}

interface AttackInfo {
  x: number;
  y: number;
  direction: "left" | "right" | "up" | "down";
}
```

#### Events

- `currentPlayers`: Initial game state
- `playerJoined`: New player connection
- `playerLeft`: Player disconnection
- `playerMoved`: Position updates
- `skeletonSpawned`: New skeleton creation
- `skeletonHit`: Skeleton damage events
- `playerAttacked`: Combat action broadcasts

## Project Structure

```
src/
├── client/
│   ├── core/
│   │   ├── BaseComponent.ts     # Component system base
│   │   ├── Entity.ts            # Entity system base
│   │   ├── PhysicsComponent.ts  # Movement and collisions
│   │   ├── HealthComponent.ts   # Health management
│   │   ├── CombatComponent.ts   # Combat mechanics
│   │   ├── FollowComponent.ts   # AI behavior
│   │   ├── NetworkComponent.ts  # Multiplayer sync
│   │   └── InputComponent.ts    # Player control
│   ├── entities/
│   │   ├── Player.ts            # Player implementation
│   │   └── Skeleton.ts          # Enemy implementation
│   ├── scenes/
│   │   └── MainScene.ts         # Main game scene
│   └── utils/
│       ├── NetworkManager.ts    # Network handling
│       └── TextureManager.ts    # Asset management
└── server/
    └── server.ts               # Game server
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

This command:

- Cleans the dist directory
- Builds server-side TypeScript
- Bundles client-side code with esbuild
- Copies static assets

3. Start the server:

```bash
npm start
```

4. Open `http://localhost:3000` in your browser

## Development

Run in development mode with hot reloading:

```bash
npm run dev
```

This will:

- Build the project
- Watch for file changes
- Automatically restart the server
- Enable source maps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Future Improvements

1. Combat Enhancements

   - Different attack patterns for skeletons
   - Special abilities for players
   - Weapon variety with different stats

2. Gameplay Features

   - Player progression system
   - Multiple enemy types
   - Power-ups and items
   - Environmental hazards

3. Technical Improvements

   - Enhanced client prediction
   - State reconciliation
   - Performance optimizations
   - Enhanced error handling

4. Multiplayer Features
   - Player teams
   - PvP modes
   - Leaderboards
   - Chat system
