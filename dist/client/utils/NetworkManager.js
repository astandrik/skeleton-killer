export class NetworkManager {
    constructor(handlers) {
        this.socket = io();
        this.handlers = handlers;
        this.initializeEventListeners();
    }
    initializeEventListeners() {
        this.socket.on("currentPlayers", this.handlers.onCurrentPlayers);
        this.socket.on("playerJoined", this.handlers.onPlayerJoined);
        this.socket.on("playerLeft", this.handlers.onPlayerLeft);
        this.socket.on("playerMoved", this.handlers.onPlayerMoved);
        this.socket.on("skeletonSpawned", this.handlers.onSkeletonSpawned);
        this.socket.on("skeletonHit", this.handlers.onSkeletonHit);
        this.socket.on("playerAttacked", this.handlers.onPlayerAttacked);
    }
    get id() {
        return this.socket.id;
    }
    emitPlayerMove(position) {
        this.socket.emit("playerMove", position);
    }
    emitPlayerAttack(attackData) {
        this.socket.emit("playerAttack", attackData);
    }
    emitAttackSkeleton(skeletonId) {
        this.socket.emit("attackSkeleton", { id: skeletonId });
    }
    disconnect() {
        this.socket.disconnect();
    }
}
