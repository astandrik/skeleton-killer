import { Entity } from "../core/Entity";
import { Scene } from "phaser";
import { HealthComponent } from "../core/Component";

export class Skeleton extends Entity {
  constructor(scene: Scene, id: string, x: number, y: number) {
    super(scene, id, x, y, "skeleton");
    this.setupComponents();
  }

  private setupComponents(): void {
    // Add health component with default skeleton health
    this.addComponent(new HealthComponent(50));
  }

  public takeDamage(): void {
    const healthComponent = this.getComponent<HealthComponent>("health");
    if (healthComponent) {
      healthComponent.takeDamage(10);
    }

    // Visual feedback
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
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
