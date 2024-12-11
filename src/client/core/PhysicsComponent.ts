import { Component } from "./BaseComponent";
import { Entity } from "./Entity";

export class PhysicsComponent extends Component {
  public readonly name = "physics";
  private body: Phaser.Physics.Arcade.Body | null = null;

  public initialize(entity: Entity): void {
    super.initialize(entity);
    if (entity["scene"] && entity["scene"].physics && entity["sprite"]) {
      entity["scene"].physics.add.existing(entity["sprite"]);
      this.body = entity["sprite"].body as Phaser.Physics.Arcade.Body;
    }
  }

  public setVelocity(x: number, y: number): void {
    if (this.body) {
      this.body.setVelocity(x, y);
    }
  }

  public update(): void {
    // Physics updates are handled by Phaser's physics system
  }
}
