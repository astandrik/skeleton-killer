export class BaseScene extends Phaser.Scene {
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected attackKey!: Phaser.Input.Keyboard.Key;

  constructor(key: string) {
    super({ key });
  }

  protected initializeInput() {
    if (!this.input || !this.input.keyboard) {
      throw new Error("Input system not initialized");
    }
    this.cursors = this.input.keyboard.createCursorKeys();
    this.attackKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }
}
