# Skeleton Killer

A multiplayer browser game where players fight skeletons in a graveyard. Built with Node.js, TypeScript, Phaser, and Socket.IO.

## Architecture

The game uses a component-based architecture for better maintainability and extensibility. The core systems are:

### Entity-Component System

- `Entity`: Base class for all game objects (Player, Skeleton)
- Components:
  - `PhysicsComponent`: Handles movement and collisions
  - `HealthComponent`: Manages health and damage
  - `NetworkComponent`: Handles multiplayer synchronization
  - `InputComponent`: Processes player input
  - `CombatComponent`: Manages combat mechanics

### Network Architecture

- `NetworkManager`: Handles Socket.IO communication
- `NetworkHandler`: Manages game state synchronization
- Events:
  - Player movement
  - Combat actions
  - Entity spawning/despawning

### Scene Management

- `MainScene`: Primary game scene
- `TextureManager`: Handles asset loading and management

## Features

- Real-time multiplayer gameplay
- Component-based architecture for extensibility
- Pixel graphics style
- Sword combat against skeletons
- Multiple players can join and fight together

## Installation

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

3. Start the server:

```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Development

To run in development mode with hot reloading:

```bash
npm run dev
```

## Controls

- Arrow keys: Move character
- Spacebar: Attack with sword

## Architecture Details

### Entity System

Entities are the base game objects that can have multiple components attached to them. Each component handles a specific aspect of the entity's behavior:

```typescript
class Entity {
  addComponent(component: Component);
  getComponent<T extends Component>(name: string): T;
  update(delta: number);
}
```

### Components

Components encapsulate specific behaviors:

```typescript
abstract class Component {
  abstract readonly name: string;
  initialize(entity: Entity);
  abstract update(delta: number);
  destroy();
}
```

### Networking

The networking system uses Socket.IO for real-time communication:

```typescript
class NetworkManager {
  emitPlayerMove(position: Position);
  emitPlayerAttack(attackInfo: AttackInfo);
  emitAttackSkeleton(skeletonId: string);
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Future Improvements

- Add more enemy types
- Implement different weapon types
- Add player progression system
- Enhance combat mechanics
- Add environmental hazards
