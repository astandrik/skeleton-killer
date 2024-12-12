import { ASSETS_CONFIG, EntityAssetConfig, EntityType } from "../config/assets";

export class AssetManager {
  private scene: Phaser.Scene;
  private loadedAssets: Set<EntityType> = new Set();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  loadEntityAssets(entityType: EntityType): void {
    const config = ASSETS_CONFIG[entityType];
    if (!config || this.loadedAssets.has(entityType)) return;

    console.log(`Loading assets for entity: ${entityType}`);

    // Load animation frames
    config.animations.forEach((anim) => {
      for (let i = 1; i <= anim.frames; i++) {
        const key = `${anim.key}${i}`;
        const path = `${anim.prefix}${i}.png`;
        console.log(`Loading texture: ${key} from ${path}`);
        this.scene.load.image(key, path);
      }
    });

    this.loadedAssets.add(entityType);
  }

  createEntityAnimations(entityType: EntityType): void {
    const config = ASSETS_CONFIG[entityType];
    if (!config) return;

    console.log(`Creating animations for entity: ${entityType}`);

    config.animations.forEach((anim) => {
      try {
        // Verify all textures are loaded
        const allTexturesLoaded = Array.from({ length: anim.frames }, (_, i) =>
          this.scene.textures.exists(`${anim.key}${i + 1}`)
        ).every((exists) => exists);

        if (!allTexturesLoaded) {
          console.warn(`Not all textures loaded for animation: ${anim.key}`);
          return;
        }

        // Create the animation
        this.scene.anims.create({
          key: anim.key,
          frames: Array.from({ length: anim.frames }, (_, i) => ({
            key: `${anim.key}${i + 1}`,
          })),
          frameRate: anim.frameRate,
          repeat: anim.repeat,
        });

        console.log(`Created animation: ${anim.key}`);
      } catch (error) {
        console.error(`Error creating animation ${anim.key}:`, error);
      }
    });
  }

  createDefaultTextures(): void {
    // Create slash textures
    for (let i = 0; i < 5; i++) {
      const graphics = this.scene.add.graphics();
      const progress = i / 4;
      const startAngle = -Math.PI / 4;
      const endAngle = startAngle + (Math.PI / 2) * progress;
      graphics.lineStyle(3, 0xffffff);
      graphics.beginPath();
      graphics.arc(16, 16, 16, startAngle, endAngle);
      graphics.strokePath();
      graphics.generateTexture(`slash${i.toString()}`, 32, 32);
      graphics.destroy();
    }

    // Create slash animation
    this.scene.anims.create({
      key: "slash",
      frames: Array.from({ length: 5 }, (_, i) => ({
        key: `slash${i.toString()}`,
      })),
      frameRate: 30,
      repeat: 0,
    });
  }

  getEntityConfig(entityType: EntityType): EntityAssetConfig | undefined {
    return ASSETS_CONFIG[entityType];
  }

  isEntityLoaded(entityType: EntityType): boolean {
    return this.loadedAssets.has(entityType);
  }
}
