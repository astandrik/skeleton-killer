export class BaseScene extends Phaser.Scene {
    constructor(key) {
        super({ key });
    }
    initializeInput() {
        if (!this.input || !this.input.keyboard) {
            throw new Error("Input system not initialized");
        }
        this.cursors = this.input.keyboard.createCursorKeys();
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
}
