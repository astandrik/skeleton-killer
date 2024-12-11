export class TextureManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createGameTextures() {
    this.createPlayerTexture();
    this.createSkeletonTexture();
    this.createSlashTextures();
    this.createSlashAnimation();
  }

  private createPlayerTexture() {
    const playerGraphics = this.scene.add.graphics();
    playerGraphics.fillStyle(0x00ff00);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture("player", 32, 32);
    playerGraphics.destroy();
  }

  private createSkeletonTexture() {
    const skeletonGraphics = this.scene.add.graphics();
    skeletonGraphics.fillStyle(0x808080);
    skeletonGraphics.fillRect(0, 0, 32, 32);
    skeletonGraphics.generateTexture("skeleton", 32, 32);
    skeletonGraphics.destroy();
  }

  private createSlashTextures() {
    // Create five frames for the slash animation
    for (let i = 0; i < 5; i++) {
      const frameGraphics = this.scene.add.graphics();
      frameGraphics.lineStyle(2, 0xffffff); // Thin white line

      // All slashes start from center-left (player position)
      const startX = 0;
      const startY = 16;
      const length = 32;

      // Calculate angle for each frame (from -45° to +45°)
      const startAngle = -45;
      const angleStep = 22.5; // 90° total range divided into 4 steps
      const currentAngle = startAngle + angleStep * i;

      // Convert angle to radians and calculate end point
      const angleRad = (currentAngle * Math.PI) / 180;
      const endX = startX + length * Math.cos(angleRad);
      const endY = startY + length * Math.sin(angleRad);

      // Draw the slash
      frameGraphics.beginPath();
      frameGraphics.moveTo(startX, startY);
      frameGraphics.lineTo(endX, endY);
      frameGraphics.strokePath();

      frameGraphics.generateTexture(`slash${i}`, 32, 32);
      frameGraphics.destroy();
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
      frameRate: 45, // Fast animation for smooth arc
      repeat: 0,
    });
  }
}
