import { Scene } from "phaser";
import { Component } from "./BaseComponent";
import { EntityType } from "../config/assets";
import { TextureManager } from "../utils/TextureManager";

export abstract class Entity {
  protected sprite: Phaser.GameObjects.Sprite;
  protected scene: Scene;
  protected components: Map<string, Component>;
  public readonly id: string;
  protected entityType: EntityType;

  constructor(
    scene: Scene,
    id: string,
    x: number,
    y: number,
    entityType: EntityType
  ) {
    this.scene = scene;
    this.id = id;
    this.entityType = entityType;
    this.components = new Map();

    // Get texture configuration
    const textureManager = scene.game.registry.get(
      "textureManager"
    ) as TextureManager;
    const config = textureManager.getEntityConfig(entityType);

    // Create sprite with default texture
    const textureKey = (config?.defaultTexture || entityType).toString();
    this.sprite = scene.add.sprite(x, y, textureKey);

    // Apply scale from config
    if (config?.scale) {
      this.sprite.setScale(config.scale);
    }

    // Set entity reference on sprite for collision detection
    this.sprite.setData("entity", this);
  }

  public addComponent(component: Component): void {
    this.components.set(component.name, component);
    component.initialize(this);
  }

  public getComponent<T extends Component>(name: string): T | undefined {
    return this.components.get(name) as T;
  }

  public hasComponent(name: string): boolean {
    return this.components.has(name);
  }

  public abstract update(delta: number): void;

  public getPosition(): { x: number; y: number } {
    return {
      x: this.sprite.x,
      y: this.sprite.y,
    };
  }

  public setPosition(x: number, y: number): void {
    this.sprite.x = x;
    this.sprite.y = y;
  }

  public getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }

  public setTint(color: number): void {
    this.sprite.setTint(color);
  }

  public clearTint(): void {
    this.sprite.clearTint();
  }

  public destroy(): void {
    this.components.forEach((component) => component.destroy());
    this.components.clear();
    this.sprite.destroy();
  }

  public getEntityType(): EntityType {
    return this.entityType;
  }
}
