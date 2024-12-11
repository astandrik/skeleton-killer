import {
  NetworkManager,
  PlayerInfo,
  SkeletonInfo,
  AttackInfo,
} from "./NetworkManager";
import { Player } from "../entities/Player";
import { Skeleton } from "../entities/Skeleton";

export class NetworkHandler {
  private scene: Phaser.Scene;
  private networkManager!: NetworkManager;
  private localPlayer?: Player;
  private otherPlayers: Map<string, Player>;
  private skeletons: Map<string, Skeleton>;
  private readonly ATTACK_RANGE: number = 50;

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
          player.x,
          player.y,
          this.networkManager,
          true
        );
      } else {
        console.log("Creating remote player");
        this.otherPlayers.set(
          player.id,
          new Player(this.scene, player.x, player.y, this.networkManager)
        );
      }
    });
  }

  private handlePlayerJoined(player: PlayerInfo) {
    this.otherPlayers.set(
      player.id,
      new Player(this.scene, player.x, player.y, this.networkManager)
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
    this.skeletons.set(
      skeleton.id,
      new Skeleton(this.scene, skeleton.id, skeleton.x, skeleton.y)
    );
  }

  private handleSkeletonHit(data: { id: string; health: number }) {
    const skeleton = this.skeletons.get(data.id);
    if (skeleton) {
      if (data.health <= 0) {
        skeleton.destroy();
        this.skeletons.delete(data.id);
      } else {
        skeleton.takeDamage();
      }
    }
  }

  private handlePlayerAttacked(attackInfo: AttackInfo) {
    try {
      console.log("Creating attack effect");
      const slash = this.scene.add.sprite(
        attackInfo.x,
        attackInfo.y,
        "swordSlash"
      );
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
}
