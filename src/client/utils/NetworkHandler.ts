import {
  NetworkManager,
  PlayerInfo,
  SkeletonInfo,
  AttackInfo,
} from "./NetworkManager";
import { Player } from "../entities/Player";
import { Skeleton } from "../entities/Skeleton";
import { HealthComponent } from "../core/HealthComponent";

export class NetworkHandler {
  private scene: Phaser.Scene;
  private networkManager!: NetworkManager;
  private localPlayer?: Player;
  private otherPlayers: Map<string, Player>;
  private skeletons: Map<string, Skeleton>;
  private readonly ATTACK_RANGE: number = 200;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.otherPlayers = new Map();
    this.skeletons = new Map();
    this.initializeNetwork();
  }

  private initializeNetwork() {
    console.log("Initializing network");
    this.networkManager = new NetworkManager({
      onCurrentPlayers: this.handleCurrentPlayers.bind(this),
      onPlayerJoined: this.handlePlayerJoined.bind(this),
      onPlayerLeft: this.handlePlayerLeft.bind(this),
      onPlayerMoved: this.handlePlayerMoved.bind(this),
      onSkeletonSpawned: this.handleSkeletonSpawned.bind(this),
      onSkeletonHit: this.handleSkeletonHit.bind(this),
      onPlayerAttacked: this.handlePlayerAttacked.bind(this),
    });
  }

  private handleCurrentPlayers(players: PlayerInfo[]) {
    players.forEach((player) => {
      if (player.id === this.networkManager.id) {
        console.log("Creating local player");
        this.localPlayer = new Player(
          this.scene,
          player.id,
          player.x,
          player.y,
          this.networkManager,
          true
        );
      } else {
        console.log("Creating remote player");
        this.otherPlayers.set(
          player.id,
          new Player(
            this.scene,
            player.id,
            player.x,
            player.y,
            this.networkManager
          )
        );
      }
    });
  }

  private handlePlayerJoined(player: PlayerInfo) {
    this.otherPlayers.set(
      player.id,
      new Player(this.scene, player.id, player.x, player.y, this.networkManager)
    );
  }

  private handlePlayerLeft(playerId: string) {
    const player = this.otherPlayers.get(playerId);
    if (player) {
      player.destroy();
      this.otherPlayers.delete(playerId);
    }
  }

  private handlePlayerMoved(playerInfo: PlayerInfo) {
    const player = this.otherPlayers.get(playerInfo.id);
    if (player) {
      player.setPosition(playerInfo.x, playerInfo.y);
    }
  }

  private handleSkeletonSpawned(skeleton: SkeletonInfo) {
    console.log("Creating skeleton");
    const newSkeleton = new Skeleton(
      this.scene,
      skeleton.id,
      skeleton.x,
      skeleton.y
    );

    // Set local player as target if available
    if (this.localPlayer) {
      newSkeleton.setTarget(this.localPlayer);
    }

    this.skeletons.set(skeleton.id, newSkeleton);
  }

  private handleSkeletonHit(data: { id: string; health: number }) {
    const skeleton = this.skeletons.get(data.id);
    if (skeleton) {
      if (data.health <= 0) {
        skeleton.destroy();
        this.skeletons.delete(data.id);
      } else {
        // Calculate damage based on health difference
        const currentHealth =
          skeleton.getComponent<HealthComponent>("health")?.getHealth() || 100;
        const damage = currentHealth - data.health;
        skeleton.takeDamage(damage);
      }
    }
  }

  private handlePlayerAttacked(attackInfo: AttackInfo) {
    try {
      console.log("Creating attack effect");
      const slash = this.scene.add.sprite(attackInfo.x, attackInfo.y, "slash0");

      switch (attackInfo.direction) {
        case "left":
          slash.setOrigin(0, 0.5);
          slash.setAngle(0);
          slash.setFlipX(true);
          break;
        case "right":
          slash.setOrigin(0, 0.5);
          slash.setAngle(0);
          break;
        case "up":
          slash.setOrigin(0.5, 1);
          slash.setAngle(-90);
          break;
        case "down":
          slash.setOrigin(0.5, 0);
          slash.setAngle(90);
          break;
      }

      slash.play("slash");
      slash.once("animationcomplete", () => {
        slash.destroy();
      });
    } catch (error) {
      console.error("Error creating attack effect:", error);
    }
  }

  checkSkeletonHits(attackX: number, attackY: number) {
    this.skeletons.forEach((skeleton, id) => {
      if (skeleton.isInRange(attackX, attackY, this.ATTACK_RANGE)) {
        this.networkManager.emitAttackSkeleton(id);
      }
    });
  }

  getLocalPlayer(): Player | undefined {
    return this.localPlayer;
  }

  getNetworkManager(): NetworkManager {
    return this.networkManager;
  }

  getSkeletons(): Map<string, Skeleton> {
    return this.skeletons;
  }
}
