import { Scene } from "phaser";
import { TextureManager } from "../utils/TextureManager";
import { NetworkHandler } from "../utils/NetworkHandler";
import { Skeleton } from "../entities/Skeleton";

declare global {
  interface Window {
    MainScene: typeof MainScene;
  }
}

export class MainScene extends Scene {
  private textureManager!: TextureManager;
  private networkHandler!: NetworkHandler;

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
  }

  update(time: number, delta: number) {
    const localPlayer = this.networkHandler.getLocalPlayer();
    if (localPlayer) {
      localPlayer.update(delta);
    }

    // Update all skeletons
    const skeletons = this.networkHandler.getSkeletons();
    skeletons.forEach((skeleton: Skeleton) => {
      skeleton.update(delta);
    });
  }
}

window.MainScene = MainScene;
