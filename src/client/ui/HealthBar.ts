import { Scene } from "phaser";
import { Player } from "../entities/Player";
import { HealthComponent } from "../core/HealthComponent";

export class HealthBar {
  private scene: Scene;
  private container: Phaser.GameObjects.Container;
  private bar: Phaser.GameObjects.Graphics;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private player: Player;

  constructor(
    scene: Scene,
    player: Player,
    x: number = 20,
    y: number = 20,
    width: number = 200,
    height: number = 20
  ) {
    this.scene = scene;
    this.player = player;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    // Create container for UI elements
    this.container = scene.add.container(0, 0);

    // Create the health bar graphics
    this.bar = scene.add.graphics();

    // Add elements to container
    this.container.add([this.bar]);

    // Make container fixed to camera
    this.container.setScrollFactor(0);
    this.container.setDepth(1000);

    // Initial draw
    this.draw();
  }

  draw() {
    const healthComponent = this.player.getComponent(
      "health"
    ) as HealthComponent;
    if (!healthComponent) return;

    const health = healthComponent.getHealth();
    const healthPercentage = health / 100;

    this.bar.clear();

    // Draw health bar (red)
    this.bar.fillStyle(0xff0000);
    this.bar.fillRect(
      this.x,
      this.y,
      this.width * healthPercentage,
      this.height
    );
  }

  update() {
    this.draw();
  }

  destroy() {
    this.container.destroy();
  }
}
