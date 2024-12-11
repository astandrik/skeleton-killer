export class TextureManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createGameTextures() {
    this.createKnightTexture();
    this.createSkeletonTexture();
    this.createSlashTextures();
    this.createSlashAnimation();
  }

  private createKnightTexture() {
    const graphics = this.scene.add.graphics();

    // Body
    graphics.lineStyle(2, 0x4444ff);
    graphics.fillStyle(0x6666ff);
    graphics.beginPath();
    graphics.arc(16, 16, 12, 0, Math.PI * 2);
    graphics.closePath();
    graphics.strokePath();
    graphics.fillPath();

    // Sword
    graphics.lineStyle(2, 0xcccccc);
    graphics.beginPath();
    graphics.moveTo(24, 8);
    graphics.lineTo(28, 4);
    graphics.strokePath();

    graphics.generateTexture("knight", 32, 32);
    graphics.destroy();
  }

  private createSkeletonTexture() {
    const graphics = this.scene.add.graphics();

    // Body
    graphics.lineStyle(2, 0xcccccc);
    graphics.fillStyle(0xdddddd);
    graphics.beginPath();
    graphics.arc(16, 16, 12, 0, Math.PI * 2);
    graphics.closePath();
    graphics.strokePath();
    graphics.fillPath();

    // Eyes
    graphics.fillStyle(0xff0000);
    graphics.fillCircle(12, 14, 2);
    graphics.fillCircle(20, 14, 2);

    graphics.generateTexture("skeleton", 32, 32);
    graphics.destroy();
  }

  private createSlashTextures() {
    for (let i = 0; i < 5; i++) {
      const graphics = this.scene.add.graphics();
      const progress = i / 4; // 0 to 1
      const startAngle = -Math.PI / 4;
      const endAngle = startAngle + (Math.PI / 2) * progress;

      graphics.lineStyle(3, 0xffffff);
      graphics.beginPath();
      graphics.arc(16, 16, 16, startAngle, endAngle);
      graphics.strokePath();

      graphics.generateTexture(`slash${i}`, 32, 32);
      graphics.destroy();
    }
  }

  private createSlashAnimation() {
    this.scene.anims.create({
      key: "slash",
      frames: [
        { key: "slash0" },
        { key: "slash1" },
        { key: "slash2" },
        { key: "slash3" },
        { key: "slash4" },
      ],
      frameRate: 30,
      repeat: 0,
    });
  }
}
