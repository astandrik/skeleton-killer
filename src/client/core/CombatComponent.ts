import { Component } from "./BaseComponent";
import { Entity } from "./Entity";
import { HealthComponent } from "./HealthComponent";

export class CombatComponent extends Component {
  public readonly name = "combat";
  private attackRange: number;
  private attackDamage: number;
  private lastAttackTime: number = 0;
  private attackCooldown: number;

  constructor(
    attackRange: number,
    attackDamage: number,
    attackCooldown: number = 500
  ) {
    super();
    this.attackRange = attackRange;
    this.attackDamage = attackDamage;
    this.attackCooldown = attackCooldown;
  }

  public canAttack(): boolean {
    return Date.now() - this.lastAttackTime >= this.attackCooldown;
  }

  public attack(target: Entity): void {
    if (!this.canAttack()) return;

    const position = this.entity?.getPosition();
    const targetPosition = target.getPosition();

    if (position) {
      const distance = Phaser.Math.Distance.Between(
        position.x,
        position.y,
        targetPosition.x,
        targetPosition.y
      );

      if (distance <= this.attackRange) {
        const targetHealth = target.getComponent<HealthComponent>("health");
        if (targetHealth) {
          targetHealth.takeDamage(this.attackDamage);
          this.lastAttackTime = Date.now();
        }
      }
    }
  }

  public update(): void {
    // Combat updates are event-driven
  }
}
