import "phaser";

const WORLD_DIMENSIONS = { x: 3200, y: 600 };
export default class Demo extends Phaser.Scene {
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private stars: Phaser.Physics.Arcade.Group;
  private bombs: Phaser.Physics.Arcade.Group;
  private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private score = 0;
  private scoreText: Phaser.GameObjects.Text;

  private gameOver = false;

  constructor() {
    super({
      key: "demo",
    });
  }

  preload() {
    this.load.image("sky", "sky.png");
    this.load.image("ground", "platform.png");
    this.load.image("star", "star.png");
    this.load.image("bomb", "bomb.png");
    this.load.spritesheet("dude", "dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    this.initWorld();
    this.initCameras();
    this.initBackground();
    this.initStars();
    this.initPlatforms();

    this.player = this.physics.add.sprite(100, 450, "dude");

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(300);

    this.cameras.main.startFollow(this.player, false, 0.2, 0.2);

    this.physics.add.collider(this.player, this.platforms);

    this.cursors = this.input.keyboard.createCursorKeys();

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

    this.stars = this.physics.add.group({
      key: "star",
      repeat: 32,
      setXY: { x: 12, y: 0, stepX: 100 },
    });

    this.stars.children.iterate(function (child) {
      child.body.gameObject.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(
      this.player,
      this.stars,
      (player, star) => {
        //collectStar

        star.body.gameObject.disableBody(true, true);

        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);

        if (this.stars.countActive(true) === 0) {
          this.stars.children.iterate(
            (child: Phaser.GameObjects.GameObject) => {
              child.body.gameObject.enableBody(
                true,
                child.body.position.x + 12,
                0,
                true,
                true
              );
            }
          );

          var x =
            player.body.x < 400
              ? Phaser.Math.Between(400, 800)
              : Phaser.Math.Between(0, 400);

          const bomb = this.bombs.create(x, 16, "bomb");
          bomb.setBounce(1);
          bomb.setCollideWorldBounds(true);
          bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
      },
      null,
      this
    );

    this.scoreText = this.add.text(16, 16, "score: 0", {
      fontSize: "32px",
      color: "#000",
    });

    this.createBombs();
  }

  update(_time: number, _delta: number): void {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);

      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);

      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);

      this.player.anims.play("turn");
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }
  }

  private initWorld(): void {
    this.physics.world.setBounds(0, 0, WORLD_DIMENSIONS.x, WORLD_DIMENSIONS.y);
  }

  private initCameras(): void {
    this.cameras.main.setBounds(0, 0, WORLD_DIMENSIONS.x, WORLD_DIMENSIONS.y);
  }

  private initBackground(): void {
    const backgroundImage = this.add.image(400, 300, "sky");

    backgroundImage.setScale(WORLD_DIMENSIONS.x / 400, 1);
  }

  private initPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();

    const basePlatform: Phaser.Physics.Arcade.Sprite = this.platforms.create(
      WORLD_DIMENSIONS.x / 2,
      584,
      "ground"
    );

    basePlatform.setScale(WORLD_DIMENSIONS.x / 400, 1).refreshBody();

    this.platforms.create(50, 250, "ground");
    this.platforms.create(600, 400, "ground");
    this.platforms.create(750, 220, "ground");
    this.platforms.create(1000, 220, "ground");
    this.platforms.create(1200, 400, "ground");
    this.platforms.create(1500, 250, "ground");
    this.platforms.create(2000, 400, "ground");
    this.platforms.create(2500, 250, "ground");
    this.platforms.create(2800, 400, "ground");
  }

  private initStars(): void {
    // this.add.image(400, 300, "star");
  }

  private createBombs(): void {
    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.bombs, this.platforms);

    this.physics.add.collider(
      this.player,
      this.bombs,
      (player, _bomb) => {
        this.physics.pause();

        player.body.gameObject.setTint(0xff0000);
        player.body.gameObject.anims.play("turn");

        this.gameOver = true;
      },
      null,
      this
    );
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#125555",
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        x: 0,
        y: 300,
      },
      enableSleeping: true,
    },
  },
  scene: Demo,
};

const game = new Phaser.Game(config);
