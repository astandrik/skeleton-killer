import { NetworkManager } from "../utils/NetworkManager";

export class Player {
  private sprite: Phaser.GameObjects.Sprite;
  private scene: Phaser.Scene;
  private networkManager: NetworkManager;
  private speed: number = 200;
  private isLocalPlayer: boolean;
  private lastDirection: "left" | "right" | "up" | "down" = "right";
  private readonly ATTACK_OFFSET = 32; // Full player sprite size for proper extension
  private readonly SPRITE_SIZE = 32; // Player sprite size

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    networkManager: NetworkManager,
    isLocalPlayer: boolean = false
  ) {
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
    } catch (error) {
      console.error("Error creating player sprite:", error);
      throw error;
    }
  }

  update(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    attackKey: Phaser.Input.Keyboard.Key
  ) {
    if (!this.isLocalPlayer) return;

    let moved = false;
    const velocity = (this.sprite.body as Phaser.Physics.Arcade.Body).velocity;

    // Movement
    if (cursors.left.isDown) {
      velocity.x = -this.speed;
      this.sprite.setFlipX(true);
      this.lastDirection = "left";
      moved = true;
    } else if (cursors.right.isDown) {
      velocity.x = this.speed;
      this.sprite.setFlipX(false);
      this.lastDirection = "right";
      moved = true;
    } else {
      velocity.x = 0;
    }

    if (cursors.up.isDown) {
      velocity.y = -this.speed;
      this.lastDirection = "up";
      moved = true;
    } else if (cursors.down.isDown) {
      velocity.y = this.speed;
      this.lastDirection = "down";
      moved = true;
    } else {
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
    let attackX = this.sprite.x;
    let attackY = this.sprite.y;

    // Position the attack based on direction with consistent offset
    switch (this.lastDirection) {
      case "left":
        attackX -= this.SPRITE_SIZE / 2; // Position at player's left edge
        break;
      case "right":
        attackX += this.SPRITE_SIZE / 2; // Position at player's right edge
        break;
      case "up":
        attackY -= this.SPRITE_SIZE / 2; // Position at player's top edge
        break;
      case "down":
        attackY += this.SPRITE_SIZE / 2; // Position at player's bottom edge
        break;
    }

    const attackInfo = {
      x: attackX,
      y: attackY,
      direction: this.lastDirection,
    };

    this.networkManager.emitPlayerAttack(attackInfo);
    this.showAttackEffect(attackX, attackY);
  }

  private showAttackEffect(x: number, y: number) {
    try {
      const slash = this.scene.add.sprite(x, y, "slash0");

      // Set origin and rotation based on direction
      switch (this.lastDirection) {
        case "left":
          // For left attack, position at the player's left edge and extend leftward
          slash.setOrigin(1, 0.5); // Set origin to right edge so it extends left
          slash.setAngle(0);
          slash.setFlipX(true);
          break;
        case "right":
          // For right attack, position at the player's right edge and extend rightward
          slash.setOrigin(0, 0.5);
          slash.setAngle(0);
          break;
        case "up":
          // For upward attack, position at the player's top edge and extend upward
          slash.setOrigin(0.5, 1);
          slash.setAngle(-90);
          break;
        case "down":
          // For downward attack, position at the player's bottom edge and extend downward
          slash.setOrigin(0.5, 0);
          slash.setAngle(90);
          break;
      }

      slash.play("slash");
      slash.once("animationcomplete", () => {
        slash.destroy();
      });
    } catch (error) {
      console.error("Error showing attack effect:", error);
    }
  }

  setPosition(x: number, y: number) {
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
