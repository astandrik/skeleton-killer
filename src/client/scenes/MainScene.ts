import { Scene } from "phaser";
import { TextureManager } from "../utils/TextureManager";
import { NetworkHandler } from "../utils/NetworkHandler";
import { Skeleton } from "../entities/Skeleton";
import { HealthBar } from "../ui/HealthBar";
import { Player } from "../entities/Player";
import { HealthComponent } from "../core/HealthComponent";

declare global {
  interface Window {
    MainScene: typeof MainScene;
  }
}

export class MainScene extends Scene {
  private textureManager!: TextureManager;
  private networkHandler!: NetworkHandler;
  private healthBar?: HealthBar;
  private lastPlayerState: boolean = false;
  private lastDamageTime: number = 0;
  private readonly DAMAGE_COOLDOWN: number = 500; // 500ms cooldown between damage
  private readonly SKELETON_DAMAGE: number = 10;

  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    console.log("MainScene preload started");
  }

  create() {
    console.log("MainScene create started");

    // Initialize managers
    this.textureManager = new TextureManager(this);
    this.networkHandler = new NetworkHandler(this);

    // Create game textures
    this.textureManager.createGameTextures();

    // Enable physics
    this.physics.world.setBounds(0, 0, 800, 600);
  }

  private handlePlayerDamage(player: Player) {
    const now = Date.now();
    if (now - this.lastDamageTime < this.DAMAGE_COOLDOWN) {
      return; // Skip if on cooldown
    }

    const healthComponent = player.getComponent<HealthComponent>("health");
    if (healthComponent) {
      healthComponent.takeDamage(this.SKELETON_DAMAGE);
      this.lastDamageTime = now;

      // Visual feedback
      this.cameras.main.shake(100, 0.005);
      player.setTint(0xff0000);
      this.time.delayedCall(100, () => {
        player.clearTint();
      });

      console.log("Player took damage! Health:", healthComponent.getHealth());
    }
  }

  update(time: number, delta: number) {
    const localPlayer = this.networkHandler.getLocalPlayer();
    const hasPlayer = !!localPlayer;

    // Handle player initialization
    if (hasPlayer && !this.lastPlayerState) {
      console.log("Player initialized, creating health bar");
      this.healthBar = new HealthBar(this, localPlayer);
    }
    this.lastPlayerState = hasPlayer;

    // Update player and health bar
    if (localPlayer) {
      localPlayer.update(delta);
      if (this.healthBar) {
        this.healthBar.update();
      }

      // Check collisions with all skeletons
      const skeletons = this.networkHandler.getSkeletons();
      skeletons.forEach((skeleton: Skeleton) => {
        const playerSprite = localPlayer.getSprite();
        const skeletonSprite = skeleton.getSprite();

        // Check if sprites exist and have physics bodies
        if (playerSprite.body && skeletonSprite.body) {
          const isOverlapping = Phaser.Geom.Intersects.RectangleToRectangle(
            playerSprite.getBounds(),
            skeletonSprite.getBounds()
          );

          if (isOverlapping) {
            this.handlePlayerDamage(localPlayer);
          }
        }
      });
    }

    // Update all skeletons
    const skeletons = this.networkHandler.getSkeletons();
    skeletons.forEach((skeleton: Skeleton) => {
      skeleton.update(delta);
    });
  }
}

window.MainScene = MainScene;
