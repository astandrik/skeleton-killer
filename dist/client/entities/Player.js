export class Player {
    constructor(scene, x, y, networkManager, isLocalPlayer = false) {
        this.speed = 200;
        this.scene = scene;
        this.networkManager = networkManager;
        this.isLocalPlayer = isLocalPlayer;
        try {
            this.sprite = scene.add.sprite(x, y, "player");
            if (!isLocalPlayer) {
                this.sprite.setTint(0x0000ff);
            }
            if (isLocalPlayer) {
                scene.physics.add.existing(this.sprite);
            }
        }
        catch (error) {
            console.error("Error creating player sprite:", error);
            throw error;
        }
    }
    update(cursors, attackKey) {
        if (!this.isLocalPlayer)
            return;
        let moved = false;
        const velocity = this.sprite.body.velocity;
        // Movement
        if (cursors.left.isDown) {
            velocity.x = -this.speed;
            this.sprite.setFlipX(true);
            moved = true;
        }
        else if (cursors.right.isDown) {
            velocity.x = this.speed;
            this.sprite.setFlipX(false);
            moved = true;
        }
        else {
            velocity.x = 0;
        }
        if (cursors.up.isDown) {
            velocity.y = -this.speed;
            moved = true;
        }
        else if (cursors.down.isDown) {
            velocity.y = this.speed;
            moved = true;
        }
        else {
            velocity.y = 0;
        }
        // Attack
        if (attackKey && Phaser.Input.Keyboard.JustDown(attackKey)) {
            this.attack();
        }
        // Emit movement
        if (moved) {
            this.networkManager.emitPlayerMove({
                x: this.sprite.x,
                y: this.sprite.y,
            });
        }
    }
    attack() {
        const attackX = this.sprite.x + (this.sprite.flipX ? -40 : 40);
        const attackY = this.sprite.y;
        this.networkManager.emitPlayerAttack({
            x: attackX,
            y: attackY,
        });
        this.showAttackEffect(attackX, attackY);
    }
    showAttackEffect(x, y) {
        try {
            // Create the sprite with the base texture
            const slash = this.scene.add.sprite(x, y, "swordSlash");
            // Play the animation
            slash.play("slash");
            // Clean up after animation completes
            slash.once("animationcomplete", () => {
                slash.destroy();
            });
        }
        catch (error) {
            console.error("Error showing attack effect:", error);
        }
    }
    setPosition(x, y) {
        this.sprite.x = x;
        this.sprite.y = y;
    }
    getPosition() {
        return {
            x: this.sprite.x,
            y: this.sprite.y,
        };
    }
    destroy() {
        this.sprite.destroy();
    }
}
