import { Scene } from "phaser";
import { Component } from "./BaseComponent";

export abstract class Entity {
  protected sprite: Phaser.GameObjects.Sprite;
  protected scene: Scene;
  protected components: Map<string, Component>;
  public readonly id: string;

  constructor(scene: Scene, id: string, x: number, y: number, texture: string) {
    this.scene = scene;
    this.id = id;
    this.components = new Map();
    this.sprite = scene.add.sprite(x, y, texture);

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
}
