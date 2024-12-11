import { Entity } from "../core/Entity";
import { Scene } from "phaser";
import { NetworkManager } from "../utils/NetworkManager";
import { PhysicsComponent } from "../core/PhysicsComponent";
import { NetworkComponent } from "../core/NetworkComponent";
import { HealthComponent } from "../core/HealthComponent";
import { CombatComponent } from "../core/CombatComponent";
import { InputComponent } from "../core/InputComponent";
import { EntityType } from "../config/assets";

export class Player extends Entity {
  private isLocalPlayer: boolean;
  private isMoving: boolean = false;
  private currentAnimation: string | null = null;

  constructor(
    scene: Scene,
    id: string,
    x: number,
    y: number,
    networkManager: NetworkManager,
    isLocalPlayer: boolean = false
  ) {
    super(scene, id, x, y, "knight");
    this.isLocalPlayer = isLocalPlayer;

    // Set player tint for remote players
    if (!isLocalPlayer) {
      this.sprite.setTint(0x4444ff);
    }

    // Add components first
    this.setupComponents(scene, networkManager);

    // Delay initial animation to ensure textures are loaded
    scene.time.delayedCall(100, () => {
      this.playAnimation("knight_idle");
    });
  }

  private playAnimation(key: string) {
    if (this.currentAnimation === key) return; // Don't replay the same animation

    try {
      // Check if animation exists
      if (!this.scene.anims.exists(key)) {
        console.warn(`Animation '${key}' not found`);
        return;
      }

      // Check if all required textures for this animation exist
      const anim = this.scene.anims.get(key);
      const allTexturesExist = anim.frames.every((frame) =>
        this.scene.textures.exists(frame.textureKey)
      );

      if (!allTexturesExist) {
        console.warn(`Not all textures loaded for animation '${key}'`);
        return;
      }

      // Play the animation
      this.sprite.play(key);
      this.currentAnimation = key;
      console.log(`Playing animation: ${key}`);
    } catch (error) {
      console.error(`Error playing animation '${key}':`, error);
    }
  }

  private setupComponents(scene: Scene, networkManager: NetworkManager): void {
    // Add network component for all players
    this.addComponent(new NetworkComponent(networkManager));

    // Add components only for local player
    if (this.isLocalPlayer && scene.input.keyboard) {
      // Add physics component
      const physics = new PhysicsComponent();
      this.addComponent(physics);

      // Add input component with controls
      const cursors = scene.input.keyboard.createCursorKeys();
      const attackKey = scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
      this.addComponent(new InputComponent(cursors, attackKey));
    }

    // Add health component for all players
    this.addComponent(new HealthComponent(100));

    // Add combat component for all players
    // Parameters: attackRange: 50, attackDamage: 10, attackCooldown: 500ms
    this.addComponent(new CombatComponent(50, 10, 500));
  }

  public update(delta: number): void {
    // Update all components
    this.components.forEach((component) => {
      component.update(delta);
    });

    // Update animations based on movement
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (body) {
      const isCurrentlyMoving =
        Math.abs(body.velocity.x) > 0 || Math.abs(body.velocity.y) > 0;

      // Handle animation changes
      if (isCurrentlyMoving && !this.isMoving) {
        this.playAnimation("knight_walk");
        this.isMoving = true;
      } else if (!isCurrentlyMoving && this.isMoving) {
        this.playAnimation("knight_idle");
        this.isMoving = false;
      }

      // Handle sprite flipping based on movement direction
      if (body.velocity.x !== 0) {
        this.sprite.setFlipX(body.velocity.x < 0);
      }
    }
  }

  public isLocal(): boolean {
    return this.isLocalPlayer;
  }
}
