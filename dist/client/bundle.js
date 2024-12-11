"use strict";
var Game = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/client/scenes/MainScene.ts
  var MainScene_exports = {};
  __export(MainScene_exports, {
    MainScene: () => MainScene
  });

  // src/client/scenes/BaseScene.ts
  var BaseScene = class extends Phaser.Scene {
    constructor(key) {
      super({ key });
    }
    initializeInput() {
      if (!this.input || !this.input.keyboard) {
        throw new Error("Input system not initialized");
      }
      this.cursors = this.input.keyboard.createCursorKeys();
      this.attackKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
    }
  };

  // src/client/utils/NetworkManager.ts
  var NetworkManager = class {
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
  };

  // src/client/entities/Player.ts
  var Player = class {
    constructor(scene, x, y, networkManager, isLocalPlayer = false) {
      this.speed = 200;
      this.scene = scene;
      this.networkManager = networkManager;
      this.isLocalPlayer = isLocalPlayer;
      try {
        this.sprite = scene.add.sprite(x, y, "player");
        if (!isLocalPlayer) {
          this.sprite.setTint(255);
        }
        if (isLocalPlayer) {
          scene.physics.add.existing(this.sprite);
        }
      } catch (error) {
        console.error("Error creating player sprite:", error);
        throw error;
      }
    }
    update(cursors, attackKey) {
      if (!this.isLocalPlayer)
        return;
      let moved = false;
      const velocity = this.sprite.body.velocity;
      if (cursors.left.isDown) {
        velocity.x = -this.speed;
        this.sprite.setFlipX(true);
        moved = true;
      } else if (cursors.right.isDown) {
        velocity.x = this.speed;
        this.sprite.setFlipX(false);
        moved = true;
      } else {
        velocity.x = 0;
      }
      if (cursors.up.isDown) {
        velocity.y = -this.speed;
        moved = true;
      } else if (cursors.down.isDown) {
        velocity.y = this.speed;
        moved = true;
      } else {
        velocity.y = 0;
      }
      if (attackKey && Phaser.Input.Keyboard.JustDown(attackKey)) {
        this.attack();
      }
      if (moved) {
        this.networkManager.emitPlayerMove({
          x: this.sprite.x,
          y: this.sprite.y
        });
      }
    }
    attack() {
      const attackX = this.sprite.x + (this.sprite.flipX ? -40 : 40);
      const attackY = this.sprite.y;
      this.networkManager.emitPlayerAttack({
        x: attackX,
        y: attackY
      });
      this.showAttackEffect(attackX, attackY);
    }
    showAttackEffect(x, y) {
      try {
        const slash = this.scene.add.sprite(x, y, "swordSlash");
        slash.play("slash");
        slash.once("animationcomplete", () => {
          slash.destroy();
        });
      } catch (error) {
        console.error("Error showing attack effect:", error);
      }
    }
    setPosition(x, y) {
      this.sprite.x = x;
      this.sprite.y = y;
    }
    getPosition() {
      return {
        x: this.sprite.x,
        y: this.sprite.y
      };
    }
    destroy() {
      this.sprite.destroy();
    }
  };

  // src/client/entities/Skeleton.ts
  var Skeleton = class {
    constructor(scene, id, x, y) {
      this.scene = scene;
      this.id = id;
      this.sprite = scene.add.sprite(x, y, "skeleton");
    }
    takeDamage() {
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0.5,
        duration: 100,
        yoyo: true
      });
    }
    getPosition() {
      return {
        x: this.sprite.x,
        y: this.sprite.y
      };
    }
    isInRange(x, y, range) {
      const distance = Phaser.Math.Distance.Between(
        x,
        y,
        this.sprite.x,
        this.sprite.y
      );
      return distance <= range;
    }
    destroy() {
      this.sprite.destroy();
    }
  };

  // src/client/scenes/MainScene.ts
  var MainScene = class extends BaseScene {
    constructor() {
      super("MainScene");
      this.ATTACK_RANGE = 50;
      this.otherPlayers = /* @__PURE__ */ new Map();
      this.skeletons = /* @__PURE__ */ new Map();
    }
    preload() {
      super.initializeInput();
      console.log("MainScene preload started");
    }
    create() {
      console.log("MainScene create started");
      this.createTextures();
      this.initializeNetwork();
    }
    createTextures() {
      const playerGraphics = this.add.graphics();
      playerGraphics.fillStyle(65280);
      playerGraphics.fillRect(0, 0, 32, 32);
      playerGraphics.generateTexture("player", 32, 32);
      playerGraphics.destroy();
      const skeletonGraphics = this.add.graphics();
      skeletonGraphics.fillStyle(8421504);
      skeletonGraphics.fillRect(0, 0, 32, 32);
      skeletonGraphics.generateTexture("skeleton", 32, 32);
      skeletonGraphics.destroy();
      const slashGraphics = this.add.graphics();
      slashGraphics.fillStyle(16777215);
      slashGraphics.fillRect(0, 0, 32, 32);
      slashGraphics.generateTexture("swordSlash", 32, 32);
      slashGraphics.destroy();
      for (let i = 0; i < 3; i++) {
        const frameGraphics = this.add.graphics();
        frameGraphics.fillStyle(16777215);
        frameGraphics.fillRect(0, 0, 32, 32);
        frameGraphics.generateTexture(`slash${i}`, 32, 32);
        frameGraphics.destroy();
      }
      this.anims.create({
        key: "slash",
        frames: [{ key: "slash0" }, { key: "slash1" }, { key: "slash2" }],
        frameRate: 15,
        repeat: 0
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
        onPlayerAttacked: this.handlePlayerAttacked.bind(this)
      });
    }
    handleCurrentPlayers(players) {
      players.forEach((player) => {
        if (player.id === this.networkManager.id) {
          console.log("Creating local player");
          this.localPlayer = new Player(
            this,
            player.x,
            player.y,
            this.networkManager,
            true
          );
        } else {
          console.log("Creating remote player");
          this.otherPlayers.set(
            player.id,
            new Player(this, player.x, player.y, this.networkManager)
          );
        }
      });
    }
    handlePlayerJoined(player) {
      this.otherPlayers.set(
        player.id,
        new Player(this, player.x, player.y, this.networkManager)
      );
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
      this.skeletons.set(
        skeleton.id,
        new Skeleton(this, skeleton.id, skeleton.x, skeleton.y)
      );
    }
    handleSkeletonHit(data) {
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
    handlePlayerAttacked(attackInfo) {
      try {
        console.log("Creating attack effect");
        const slash = this.add.sprite(attackInfo.x, attackInfo.y, "swordSlash");
        slash.play("slash");
        slash.once("animationcomplete", () => {
          slash.destroy();
        });
      } catch (error) {
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
  };
  window.MainScene = MainScene;
  return __toCommonJS(MainScene_exports);
})();
