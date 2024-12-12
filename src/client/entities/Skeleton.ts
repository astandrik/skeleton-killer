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

    // Play idle animation by default
    this.sprite.play("skeleton_idle");

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

  public takeDamage(amount: number = 25): void {
    const healthComponent = this.getComponent<HealthComponent>("health");
    if (healthComponent) {
      // Force set health to match server state
      const newHealth = healthComponent.getHealth() - amount;
      healthComponent.setHealth(newHealth);
      console.log("Skeleton took damage! Health:", newHealth);

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
      if (newHealth <= 0) {
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

    // Get physics body to check movement
    if (this.sprite.body) {
      const velocity = this.sprite.body.velocity;

      // Switch animations based on movement
      if (Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1) {
        if (
          !this.sprite.anims.isPlaying ||
          this.sprite.anims.currentAnim?.key !== "skeleton_walk"
        ) {
          this.sprite.play("skeleton_walk");
        }
        // Flip sprite based on movement direction
        if (velocity.x !== 0) {
          this.sprite.setFlipX(velocity.x < 0);
        }
      } else {
        if (
          !this.sprite.anims.isPlaying ||
          this.sprite.anims.currentAnim?.key !== "skeleton_idle"
        ) {
          this.sprite.play("skeleton_idle");
        }
      }
    }
  }
}
