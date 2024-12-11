import { Component } from "./BaseComponent";
import { Entity } from "./Entity";
import { PhysicsComponent } from "./PhysicsComponent";

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
