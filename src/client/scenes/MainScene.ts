import { BaseScene } from "./BaseScene";
import { TextureManager } from "../utils/TextureManager";
import { NetworkHandler } from "../utils/NetworkHandler";

declare global {
  interface Window {
    MainScene: typeof MainScene;
  }
}

export class MainScene extends BaseScene {
  private textureManager!: TextureManager;
  private networkHandler!: NetworkHandler;
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected attackKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super("MainScene");
  }

  preload() {
    super.initializeInput();
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

  update() {
    const localPlayer = this.networkHandler.getLocalPlayer();
    if (localPlayer) {
      localPlayer.update(this.cursors, this.attackKey);
    }
  }
}

window.MainScene = MainScene;
