import { Socket } from "socket.io-client";

export interface PlayerInfo {
  id: string;
  x: number;
  y: number;
  health: number;
}

export interface SkeletonInfo {
  id: string;
  x: number;
  y: number;
  health: number;
}

export interface AttackInfo {
  x: number;
  y: number;
}

export class NetworkManager {
  private socket: Socket;
  private handlers: {
    onCurrentPlayers: (players: PlayerInfo[]) => void;
    onPlayerJoined: (player: PlayerInfo) => void;
    onPlayerLeft: (playerId: string) => void;
    onPlayerMoved: (playerInfo: PlayerInfo) => void;
    onSkeletonSpawned: (skeleton: SkeletonInfo) => void;
    onSkeletonHit: (data: { id: string; health: number }) => void;
    onPlayerAttacked: (attackInfo: AttackInfo) => void;
  };

  constructor(handlers: typeof NetworkManager.prototype.handlers) {
    this.socket = io();
    this.handlers = handlers;
    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    this.socket.on("currentPlayers", this.handlers.onCurrentPlayers);
    this.socket.on("playerJoined", this.handlers.onPlayerJoined);
    this.socket.on("playerLeft", this.handlers.onPlayerLeft);
    this.socket.on("playerMoved", this.handlers.onPlayerMoved);
    this.socket.on("skeletonSpawned", this.handlers.onSkeletonSpawned);
    this.socket.on("skeletonHit", this.handlers.onSkeletonHit);
    this.socket.on("playerAttacked", this.handlers.onPlayerAttacked);
  }

  get id(): string {
    return this.socket.id;
  }

  emitPlayerMove(position: { x: number; y: number }) {
    this.socket.emit("playerMove", position);
  }

  emitPlayerAttack(attackData: AttackInfo) {
    this.socket.emit("playerAttack", attackData);
  }

  emitAttackSkeleton(skeletonId: string) {
    this.socket.emit("attackSkeleton", { id: skeletonId });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
