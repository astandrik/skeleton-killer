import { Entity } from "../core/Entity";
import { Scene } from "phaser";
import {
  HealthComponent,
  PhysicsComponent,
  FollowComponent,
} from "../core/Component";

export class Skeleton extends Entity {
  constructor(scene: Scene, id: string, x: number, y: number) {
    super(scene, id, x, y, "skeleton");
    this.sprite.setData("entityType", "skeleton");
    this.sprite.setData("entity", this);
    this.setupComponents();
  }

  private setupComponents(): void {
    // Add physics component for movement
    this.addComponent(new PhysicsComponent());

    // Add follow component with slow movement speed
    this.addComponent(new FollowComponent(40, 30)); // Speed: 40, minDistance: 30

    // Add health component with default skeleton health
    this.addComponent(new HealthComponent(50));
  }

  public setTarget(target: Entity): void {
    const followComponent = this.getComponent<FollowComponent>("follow");
    if (followComponent) {
      followComponent.setTarget(target);
    }
  }

  public takeDamage(): void {
    const healthComponent = this.getComponent<HealthComponent>("health");
    if (healthComponent) {
      healthComponent.takeDamage(10);
    }

    // Set red tint
    this.sprite.setTint(0xff0000);

    // Shake animation
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.sprite.x + 5,
      duration: 50,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        // Reset position and tint after shake
        this.sprite.setTint(0xffffff);
        this.sprite.x = this.getPosition().x;
      },
    });
  }

  public isInRange(x: number, y: number, range: number): boolean {
    const position = this.getPosition();
    const distance = Phaser.Math.Distance.Between(x, y, position.x, position.y);
    return distance <= range;
  }

  public update(delta: number): void {
    // Update all components
    this.components.forEach((component) => {
      component.update(delta);
    });
  }
}
