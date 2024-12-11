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
    const slashGraphics = this.scene.add.graphics();
    slashGraphics.fillStyle(0xffffff);
    slashGraphics.fillRect(0, 0, 32, 32);
    slashGraphics.generateTexture("swordSlash", 32, 32);
    slashGraphics.destroy();

    for (let i = 0; i < 3; i++) {
      const frameGraphics = this.scene.add.graphics();
      frameGraphics.fillStyle(0xffffff);
      frameGraphics.fillRect(0, 0, 32, 32);
      frameGraphics.generateTexture(`slash${i}`, 32, 32);
      frameGraphics.destroy();
    }
  }

  private createSlashAnimation() {
    this.scene.anims.create({
      key: "slash",
      frames: [{ key: "slash0" }, { key: "slash1" }, { key: "slash2" }],
      frameRate: 15,
      repeat: 0,
    });
  }
}
