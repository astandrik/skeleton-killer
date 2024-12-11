import { Entity } from "./Entity";
import { NetworkManager } from "../utils/NetworkManager";

export abstract class Component {
  protected entity: Entity | null = null;
  public abstract readonly name: string;

  public initialize(entity: Entity): void {
    this.entity = entity;
  }

  public abstract update(delta: number): void;

  public destroy(): void {
    this.entity = null;
  }
}

// Common components that can be reused across entities

export class PhysicsComponent extends Component {
  public readonly name = "physics";
  private body: Phaser.Physics.Arcade.Body | null = null;

  public initialize(entity: Entity): void {
    super.initialize(entity);
    if (entity["scene"] && entity["scene"].physics && entity["sprite"]) {
      entity["scene"].physics.add.existing(entity["sprite"]);
      this.body = entity["sprite"].body as Phaser.Physics.Arcade.Body;
    }
  }

  public setVelocity(x: number, y: number): void {
    if (this.body) {
      this.body.setVelocity(x, y);
    }
  }

  public update(): void {
    // Physics updates are handled by Phaser's physics system
  }
}

export class HealthComponent extends Component {
  public readonly name = "health";
  private currentHealth: number;
  private maxHealth: number;

  constructor(maxHealth: number) {
    super();
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
  }

  public takeDamage(amount: number): void {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    if (this.currentHealth === 0) {
      // Emit death event or handle directly
      this.entity?.destroy();
    }
  }

  public heal(amount: number): void {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  }

  public getHealth(): number {
    return this.currentHealth;
  }

  public update(): void {
    // Health updates are event-driven
  }
}

export class NetworkComponent extends Component {
  public readonly name = "network";
  private lastPosition: { x: number; y: number } = { x: 0, y: 0 };
  public readonly networkManager: NetworkManager;

  constructor(networkManager: NetworkManager) {
    super();
    this.networkManager = networkManager;
  }

  public update(): void {
    const currentPosition = this.entity?.getPosition();
    if (
      currentPosition &&
      (currentPosition.x !== this.lastPosition.x ||
        currentPosition.y !== this.lastPosition.y)
    ) {
      this.networkManager.emitPlayerMove(currentPosition);
      this.lastPosition = currentPosition;
    }
  }
}

export class FollowComponent extends Component {
  public readonly name = "follow";
  private target: Entity | null = null;
  private speed: number;
  private minDistance: number;
  private physicsComponent: PhysicsComponent | null = null;

  constructor(speed: number = 50, minDistance: number = 30) {
    super();
    this.speed = speed;
    this.minDistance = minDistance;
  }

  public setTarget(target: Entity): void {
    this.target = target;
  }

  public initialize(entity: Entity): void {
    super.initialize(entity);
    const physics = entity.getComponent<PhysicsComponent>("physics");
    if (!physics) {
      console.error("FollowComponent requires PhysicsComponent");
      return;
    }
    this.physicsComponent = physics;
  }

  public update(): void {
    if (!this.entity || !this.target || !this.physicsComponent) return;

    const myPos = this.entity.getPosition();
    const targetPos = this.target.getPosition();

    // Calculate direction to target
    const dx = targetPos.x - myPos.x;
    const dy = targetPos.y - myPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only move if we're further than minDistance
    if (distance > this.minDistance) {
      // Normalize direction and multiply by speed
      const vx = (dx / distance) * this.speed;
      const vy = (dy / distance) * this.speed;
      this.physicsComponent.setVelocity(vx, vy);
    } else {
      // Stop moving if we're close enough
      this.physicsComponent.setVelocity(0, 0);
    }
  }
}

export class CombatComponent extends Component {
  public readonly name = "combat";
  private attackRange: number;
  private attackDamage: number;
  private lastAttackTime: number = 0;
  private attackCooldown: number;

  constructor(
    attackRange: number,
    attackDamage: number,
    attackCooldown: number = 500
  ) {
    super();
    this.attackRange = attackRange;
    this.attackDamage = attackDamage;
    this.attackCooldown = attackCooldown;
  }

  public canAttack(): boolean {
    return Date.now() - this.lastAttackTime >= this.attackCooldown;
  }

  public attack(target: Entity): void {
    if (!this.canAttack()) return;

    const position = this.entity?.getPosition();
    const targetPosition = target.getPosition();

    if (position) {
      const distance = Phaser.Math.Distance.Between(
        position.x,
        position.y,
        targetPosition.x,
        targetPosition.y
      );

      if (distance <= this.attackRange) {
        const targetHealth = target.getComponent<HealthComponent>("health");
        if (targetHealth) {
          targetHealth.takeDamage(this.attackDamage);
          this.lastAttackTime = Date.now();
        }
      }
    }
  }

  public update(): void {
    // Combat updates are event-driven
  }
}
