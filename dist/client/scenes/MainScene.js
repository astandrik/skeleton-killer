import { BaseScene } from "./BaseScene";
import { NetworkManager, } from "../utils/NetworkManager";
import { Player } from "../entities/Player";
import { Skeleton } from "../entities/Skeleton";
export class MainScene extends BaseScene {
    constructor() {
        super("MainScene");
        this.ATTACK_RANGE = 50;
        this.otherPlayers = new Map();
        this.skeletons = new Map();
    }
    preload() {
        super.initializeInput();
        console.log("MainScene preload started");
    }
    create() {
        console.log("MainScene create started");
        // Create colored rectangle textures
        this.createTextures();
        // Initialize network after creating textures
        this.initializeNetwork();
    }
    createTextures() {
        // Create player texture (green rectangle)
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0x00ff00);
        playerGraphics.fillRect(0, 0, 32, 32);
        playerGraphics.generateTexture("player", 32, 32);
        playerGraphics.destroy();
        // Create skeleton texture (gray rectangle)
        const skeletonGraphics = this.add.graphics();
        skeletonGraphics.fillStyle(0x808080);
        skeletonGraphics.fillRect(0, 0, 32, 32);
        skeletonGraphics.generateTexture("skeleton", 32, 32);
        skeletonGraphics.destroy();
        // Create sword slash texture (white rectangle)
        const slashGraphics = this.add.graphics();
        slashGraphics.fillStyle(0xffffff);
        slashGraphics.fillRect(0, 0, 32, 32);
        slashGraphics.generateTexture("swordSlash", 32, 32);
        slashGraphics.destroy();
        // Create animation frames
        for (let i = 0; i < 3; i++) {
            const frameGraphics = this.add.graphics();
            frameGraphics.fillStyle(0xffffff);
            frameGraphics.fillRect(0, 0, 32, 32);
            frameGraphics.generateTexture(`slash${i}`, 32, 32);
            frameGraphics.destroy();
        }
        // Create slash animation
        this.anims.create({
            key: "slash",
            frames: [{ key: "slash0" }, { key: "slash1" }, { key: "slash2" }],
            frameRate: 15,
            repeat: 0,
        });
    }
    initializeNetwork() {
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
    handleCurrentPlayers(players) {
        players.forEach((player) => {
            if (player.id === this.networkManager.id) {
                console.log("Creating local player");
                this.localPlayer = new Player(this, player.x, player.y, this.networkManager, true);
            }
            else {
                console.log("Creating remote player");
                this.otherPlayers.set(player.id, new Player(this, player.x, player.y, this.networkManager));
            }
        });
    }
    handlePlayerJoined(player) {
        this.otherPlayers.set(player.id, new Player(this, player.x, player.y, this.networkManager));
    }
    handlePlayerLeft(playerId) {
        const player = this.otherPlayers.get(playerId);
        if (player) {
            player.destroy();
            this.otherPlayers.delete(playerId);
        }
    }
    handlePlayerMoved(playerInfo) {
        const player = this.otherPlayers.get(playerInfo.id);
        if (player) {
            player.setPosition(playerInfo.x, playerInfo.y);
        }
    }
    handleSkeletonSpawned(skeleton) {
        console.log("Creating skeleton");
        this.skeletons.set(skeleton.id, new Skeleton(this, skeleton.id, skeleton.x, skeleton.y));
    }
    handleSkeletonHit(data) {
        const skeleton = this.skeletons.get(data.id);
        if (skeleton) {
            if (data.health <= 0) {
                skeleton.destroy();
                this.skeletons.delete(data.id);
            }
            else {
                skeleton.takeDamage();
            }
        }
    }
    handlePlayerAttacked(attackInfo) {
        try {
            console.log("Creating attack effect");
            const slash = this.add.sprite(attackInfo.x, attackInfo.y, "swordSlash");
            slash.play("slash");
            slash.once("animationcomplete", () => {
                slash.destroy();
            });
        }
        catch (error) {
            console.error("Error creating attack effect:", error);
        }
    }
    checkSkeletonHits(attackX, attackY) {
        this.skeletons.forEach((skeleton, id) => {
            if (skeleton.isInRange(attackX, attackY, this.ATTACK_RANGE)) {
                this.networkManager.emitAttackSkeleton(id);
            }
        });
    }
    update() {
        if (this.localPlayer) {
            this.localPlayer.update(this.cursors, this.attackKey);
        }
    }
}
window.MainScene = MainScene;
