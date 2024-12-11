import { Component } from "./BaseComponent";

export class HealthComponent extends Component {
  public readonly name = "health";
  private currentHealth: number;
  private maxHealth: number;

  constructor(maxHealth: number) {
    super();
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
  }

  public takeDamage(amount: number): void {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    if (this.currentHealth === 0) {
      // Emit death event or handle directly
      this.entity?.destroy();
    }
  }

  public heal(amount: number): void {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  }

  public getHealth(): number {
    return this.currentHealth;
  }

  public update(): void {
    // Health updates are event-driven
  }
}
