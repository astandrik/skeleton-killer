import { AssetManager } from "./AssetManager";
import { EntityType } from "../config/assets";

export class TextureManager {
  private scene: Phaser.Scene;
  private assetManager: AssetManager;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.assetManager = new AssetManager(scene);
  }

  loadTextures() {
    console.log("Loading textures...");

    // Load assets for all entity types
    this.assetManager.loadEntityAssets("knight");
    this.assetManager.loadEntityAssets("skeleton");
  }

  createGameTextures() {
    console.log("Creating game textures and animations...");

    // Create default textures (skeleton, slash effects)
    this.assetManager.createDefaultTextures();

    // Create animations for all entities
    this.assetManager.createEntityAnimations("knight");
    this.assetManager.createEntityAnimations("skeleton");

    console.log("Game textures and animations created");
  }

  getEntityConfig(entityType: EntityType) {
    return this.assetManager.getEntityConfig(entityType);
  }

  isEntityLoaded(entityType: EntityType) {
    return this.assetManager.isEntityLoaded(entityType);
  }
}
