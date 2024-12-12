import { Component } from "./BaseComponent";
import { NetworkComponent } from "./NetworkComponent";
import { PhysicsComponent } from "./PhysicsComponent";
import { Entity } from "./Entity";
import { NetworkHandler } from "../utils/NetworkHandler";

export class InputComponent extends Component {
  public readonly name = "input";
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private attackKey: Phaser.Input.Keyboard.Key;
  private speed: number;
  private lastDirection: "left" | "right" | "up" | "down" = "right";
  private readonly ATTACK_RANGE = 200;

  constructor(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    attackKey: Phaser.Input.Keyboard.Key,
    speed: number = 200
  ) {
    super();
    this.cursors = cursors;
    this.attackKey = attackKey;
    this.speed = speed;
  }

  public update(): void {
    if (!this.entity) return;

    const physics = this.entity.getComponent<PhysicsComponent>("physics");
    if (!physics) return;

    let moved = false;
    let velocityX = 0;
    let velocityY = 0;

    // Movement
    if (this.cursors.left.isDown) {
      velocityX = -this.speed;
      this.entity["sprite"].setFlipX(true);
      this.lastDirection = "left";
      moved = true;
    } else if (this.cursors.right.isDown) {
      velocityX = this.speed;
      this.entity["sprite"].setFlipX(false);
      this.lastDirection = "right";
      moved = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.speed;
      this.lastDirection = "up";
      moved = true;
    } else if (this.cursors.down.isDown) {
      velocityY = this.speed;
      this.lastDirection = "down";
      moved = true;
    }

    // Apply movement
    physics.setVelocity(velocityX, velocityY);

    // Attack
    if (this.attackKey && Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.handleAttack();
    }

    // Network update on movement
    if (moved) {
      const network = this.entity.getComponent<NetworkComponent>("network");
      if (network) {
        const position = this.entity.getPosition();
        network.networkManager.emitPlayerMove(position);
      }
    }
  }

  private handleAttack(): void {
    if (!this.entity) return;

    const playerPos = this.entity.getPosition();
    let attackX = playerPos.x;
    let attackY = playerPos.y;
    const SPRITE_SIZE = 32;

    // Position the attack based on direction
    switch (this.lastDirection) {
      case "left":
        attackX -= SPRITE_SIZE / 2;
        break;
      case "right":
        attackX += SPRITE_SIZE / 2;
        break;
      case "up":
        attackY -= SPRITE_SIZE / 2;
        break;
      case "down":
        attackY += SPRITE_SIZE / 2;
        break;
    }

    // Get NetworkHandler from scene registry to check skeleton hits
    const networkHandler = this.entity["scene"].game.registry.get(
      "networkHandler"
    ) as NetworkHandler;
    if (networkHandler) {
      networkHandler.checkSkeletonHits(attackX, attackY);
    }

    // Network update for attack
    const network = this.entity.getComponent<NetworkComponent>("network");
    if (network) {
      network.networkManager.emitPlayerAttack({
        x: attackX,
        y: attackY,
        direction: this.lastDirection,
      });
    }

    // Show attack effect
    this.showAttackEffect(attackX, attackY);

    // No screen shake on attack - only on damage
  }

  private showAttackEffect(x: number, y: number): void {
    if (!this.entity) return;

    try {
      const slash = this.entity["scene"].add.sprite(x, y, "slash0");

      switch (this.lastDirection) {
        case "left":
          slash.setOrigin(1, 0.5);
          slash.setAngle(0);
          slash.setFlipX(true);
          break;
        case "right":
          slash.setOrigin(0, 0.5);
          slash.setAngle(0);
          break;
        case "up":
          slash.setOrigin(0.5, 1);
          slash.setAngle(-90);
          break;
        case "down":
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

  public getLastDirection(): "left" | "right" | "up" | "down" {
    return this.lastDirection;
  }
}
