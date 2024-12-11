import { Entity } from "../core/Entity";
import { Scene } from "phaser";
import { HealthComponent } from "../core/HealthComponent";
import { PhysicsComponent } from "../core/PhysicsComponent";
import { FollowComponent } from "../core/FollowComponent";

export class Skeleton extends Entity {
  constructor(scene: Scene, id: string, x: number, y: number) {
    super(scene, id, x, y, "skeleton");

    // Set entity type and reference for attack detection
    this.sprite.setData("entityType", "skeleton");
    this.sprite.setData("entity", this);

    this.setupComponents();
  }

  private setupComponents(): void {
    // Add physics component for movement
    const physics = new PhysicsComponent();
    this.addComponent(physics);

    // Add follow component with slow movement speed
    // Speed and distance adjusted for scaled sprites
    this.addComponent(new FollowComponent(40, 15));

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
      console.log("Skeleton took damage! Health:", healthComponent.getHealth());

      // Set red tint
      this.sprite.setTint(0xff0000);

      // Shake animation (adjusted for scaled sprite)
      this.scene.tweens.add({
        targets: this.sprite,
        x: this.sprite.x + 2.5,
        duration: 50,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          // Reset position and tint after shake
          this.sprite.setTint(0xffffff);
          this.sprite.x = this.getPosition().x;
        },
      });

      // Check if skeleton is dead
      if (healthComponent.getHealth() <= 0) {
        console.log("Skeleton died!");
        this.destroy();
      }
    }
  }

  public isInRange(x: number, y: number, range: number): boolean {
    const position = this.getPosition();
    const distance = Phaser.Math.Distance.Between(x, y, position.x, position.y);
    // Adjust range check for scaled sprites
    return distance <= range * this.sprite.scale;
  }

  public update(delta: number): void {
    // Update all components
    this.components.forEach((component) => {
      component.update(delta);
    });
  }
}
