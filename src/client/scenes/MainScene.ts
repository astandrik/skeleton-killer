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
  private readonly DAMAGE_COOLDOWN: number = 500;
  private readonly SKELETON_DAMAGE: number = 10;
  private assetsLoaded: boolean = false;

  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    console.log("MainScene preload started");

    // Create and store TextureManager in game registry
    this.textureManager = new TextureManager(this);
    this.game.registry.set("textureManager", this.textureManager);

    // Show loading progress
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);

    this.load.on("progress", (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });

    this.load.on("complete", () => {
      console.log("All assets loaded");
      progressBar.destroy();
      progressBox.destroy();
      this.assetsLoaded = true;
      this.initializeGame();
    });

    // Start loading assets
    this.textureManager.loadTextures();
  }

  private initializeGame() {
    console.log("Initializing game...");

    // Create textures and animations
    this.textureManager.createGameTextures();

    // Enable physics
    this.physics.world.setBounds(0, 0, 800, 600);

    // Initialize network and store in registry
    this.networkHandler = new NetworkHandler(this);
    this.game.registry.set("networkHandler", this.networkHandler);

    console.log("Game initialization complete");
  }

  create() {
    console.log("MainScene create started");
    if (!this.assetsLoaded) {
      console.log("Waiting for assets to load...");
    }
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
    if (!this.assetsLoaded) return;

    const localPlayer = this.networkHandler?.getLocalPlayer();
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
    const skeletons = this.networkHandler?.getSkeletons() || new Map();
    skeletons.forEach((skeleton: Skeleton) => {
      skeleton.update(delta);
    });
  }
}

window.MainScene = MainScene;
