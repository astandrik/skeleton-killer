import { Entity } from "../core/Entity";
import { Scene } from "phaser";
import { NetworkManager } from "../utils/NetworkManager";
import { PhysicsComponent } from "../core/PhysicsComponent";
import { NetworkComponent } from "../core/NetworkComponent";
import { HealthComponent } from "../core/HealthComponent";
import { CombatComponent } from "../core/CombatComponent";
import { InputComponent } from "../core/InputComponent";

export class Player extends Entity {
  private isLocalPlayer: boolean;

  constructor(
    scene: Scene,
    id: string,
    x: number,
    y: number,
    networkManager: NetworkManager,
    isLocalPlayer: boolean = false
  ) {
    super(scene, id, x, y, "knight");
    this.isLocalPlayer = isLocalPlayer;

    // Set player tint for remote players
    if (!isLocalPlayer) {
      this.sprite.setTint(0x4444ff);
    }

    // Add components
    this.setupComponents(scene, networkManager);
  }

  private setupComponents(scene: Scene, networkManager: NetworkManager): void {
    // Add network component for all players
    this.addComponent(new NetworkComponent(networkManager));

    // Add components only for local player
    if (this.isLocalPlayer && scene.input.keyboard) {
      // Add physics component
      this.addComponent(new PhysicsComponent());

      // Add input component with controls
      const cursors = scene.input.keyboard.createCursorKeys();
      const attackKey = scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
      this.addComponent(new InputComponent(cursors, attackKey));
    }

    // Add health component for all players
    this.addComponent(new HealthComponent(100));

    // Add combat component for all players
    // Parameters: attackRange: 50, attackDamage: 10, attackCooldown: 500ms
    this.addComponent(new CombatComponent(50, 10, 500));
  }

  public update(delta: number): void {
    // Update all components
    this.components.forEach((component) => {
      component.update(delta);
    });
  }

  public isLocal(): boolean {
    return this.isLocalPlayer;
  }
}
