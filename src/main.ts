import "./style.css";
import * as Phaser from "phaser";

const preload: Phaser.Types.Scenes.ScenePreloadCallback = function (
  this: Phaser.Scene
) {
  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/platform.png");
  this.load.image("star", "assets/star.png");
  this.load.image("bomb", "assets/bomb.png");
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
};

let platforms: Phaser.Physics.Arcade.StaticGroup;
let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let stars: Phaser.Physics.Arcade.Group;
let bombs: Phaser.Physics.Arcade.Group;

let score = 0;
let scoreText: Phaser.GameObjects.Text;
let gameOver = false;

const collectStar: ArcadePhysicsCallback = function (
  this: Phaser.Scene,
  _player,
  star
) {
  if (star instanceof Phaser.Physics.Arcade.Sprite) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText("Score: " + score);

    if (stars.countActive(true) === 0) {
      stars.children.iterate(function (child) {
        if (child instanceof Phaser.Physics.Arcade.Sprite)
          child.enableBody(true, child.x, 0, true, true);
      });

      const x =
        player.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      const bomb = bombs.create(x, 16, "bomb");
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }
};

const hitBomb: ArcadePhysicsCallback = function hitBomb(
  this: Phaser.Scene,
  player,
  _bomb
) {
  this.physics.pause();

  if (player instanceof Phaser.Physics.Arcade.Sprite) {
    player.setTint(0xff0000);
    player.anims.play("turn");
  }

  gameOver = true;
};

const create: Phaser.Types.Scenes.SceneCreateCallback = function (
  this: Phaser.Scene
) {
  // background
  this.add.image(400, 300, "sky");
  scoreText = this.add.text(16, 16, "score: 0", {
    fontSize: "32px",
    color: "#000",
  });

  // platforms
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, "ground").setScale(2).refreshBody();
  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  // player
  player = this.physics.add.sprite(100, 450, "dude");

  player.setBounce(0.2);
  player.setGravityY(1);
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  stars = this.physics.add.group({
    key: "star",
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 },
  });

  stars.children.iterate(function (child) {
    if (child instanceof Phaser.Physics.Arcade.Sprite) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    }
  });

  // bombs
  bombs = this.physics.add.group();

  this.physics.add.collider(bombs, platforms);

  this.physics.add.collider(player, bombs, hitBomb, undefined, this);

  // colliders
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(player, stars, collectStar, undefined, this);
};

let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
const update: Phaser.Types.Scenes.SceneUpdateCallback = function () {
  if (gameOver) return;

  cursors = this.input.keyboard.createCursorKeys();

  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }
};

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);
