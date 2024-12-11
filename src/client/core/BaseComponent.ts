import { Entity } from "./Entity";

export abstract class Component {
  protected entity: Entity | null = null;
  public abstract readonly name: string;

  public initialize(entity: Entity): void {
    this.entity = entity;
  }

  public abstract update(delta: number): void;

  public destroy(): void {
    this.entity = null;
  }
}
