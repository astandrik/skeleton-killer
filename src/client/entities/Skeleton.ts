export class Skeleton {
  private sprite: Phaser.GameObjects.Sprite;
  private scene: Phaser.Scene;
  readonly id: string;

  constructor(scene: Phaser.Scene, id: string, x: number, y: number) {
    this.scene = scene;
    this.id = id;
    this.sprite = scene.add.sprite(x, y, "skeleton");
  }

  takeDamage() {
    // Flash red when hit
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
    });
  }

  getPosition() {
    return {
      x: this.sprite.x,
      y: this.sprite.y,
    };
  }

  isInRange(x: number, y: number, range: number): boolean {
    const distance = Phaser.Math.Distance.Between(
      x,
      y,
      this.sprite.x,
      this.sprite.y
    );
    return distance <= range;
  }

  destroy() {
    this.sprite.destroy();
  }
}
