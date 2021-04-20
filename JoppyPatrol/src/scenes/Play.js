class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        // load images/tile sprites
        this.load.image('rocket', './JoppyPatrol/assets/player.png');
        this.load.image('spaceship', './JoppyPatrol/assets/ErrorShip.png');
        this.load.image('backdrop', './JoppyPatrol/assets/backdrop.png');

        // load music
        this.load.audio("music", ["./JoppyPatrol/assets/music.mp3"]);

        // load spritesheet
        this.load.spritesheet('explosion', './JoppyPatrol/assets/explosion2.png', {
            frameWidth: 64,
            frameHeight: 64,
            startFrame: 0,
            endFrame: 15
        });
    }

    create() {
        // place scrolling backdrop
        this.starfield = this.add.tileSprite(0, 0, game.config.width,
            game.config.height, 'backdrop').setOrigin(0, 0);

        // white borders
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xb5b5b5).setOrigin(0, 0);
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width,
            borderUISize, 0xb5b5b5).setOrigin(0,0);
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xb5b5b5).setOrigin(0,0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize,
            game.config.height, 0xb5b5b5).setOrigin(0, 0);

        // add rocket (player 1)
        this.p1Rocket = new Rocket(this, game.config.width/2, game.config.height
             - borderUISize - borderPadding, 'rocket').setOrigin(0.5, 0);

        // add spaceship (x3)
        this.ship01 = new Spaceship(this, game.config.width + borderUISize*6,
            borderUISize*4, 'spaceship', 0, 30).setOrigin(0, 0);
        this.ship02 = new Spaceship(this, game.config.width + borderUISize*3,
            borderUISize*5 + borderPadding*2, 'spaceship', 0, 20).setOrigin(0, 0);
        this.ship03 = new Spaceship(this, game.config.width, borderUISize*6 +
            borderPadding*4, 'spaceship', 0, 10).setOrigin(0, 0);

        // define keys
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        // animation config
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', {
                start: 0,
                end: 15,
                first: 0
            }),
            frameRate: 30
        });

        // Music config
        this.music = this.sound.add("music", {volume: 0.5, loop: true});
        this.music.play();

        // initialize score
        this.p1Score = 0;
         // display score
        this.scoreConfig = {
            fontFamily: 'Garamond',
            fontSize: '28px',
            backgroundColor: '#0b2e01',
            color: '#ffffff',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, this.p1Score, this.scoreConfig);

        // GAME OVER flag
        this.gameOver = false;

        // 60-second play clock
        this.scoreConfig.fixedWidth = 0;
        this.endTime = this.time.now + game.settings.gameTimer;
        this.timeRemaining = game.settings.gameTimer;

        // Add UI that states time remaining
        this.timer = this.add.text(game.config.width - 3*borderUISize - 2*borderPadding, borderUISize + borderPadding*2, Math.round(this.timeRemaining/1000)+"s", this.scoreConfig);

    }

    update() {
        // Check if game is over
        if (this.timeRemaining <= 0){
            this.endScreen();
            this.gameOver = true;
        } else {
            this.timeRemaining = this.endTime - this.time.now;
            this.timer.text = Math.round(this.timeRemaining/1000)+"s";
        }

        // check key input for restart
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.scene.restart();
        }
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.music.stop();
            this.scene.start("menuScene");
        }

        this.starfield.tilePositionX -= starSpeed;

        if (!this.gameOver) {
            this.p1Rocket.update();         // update rocket sprite
            this.ship01.update();           // update spaceships (x3)
            this.ship02.update();
            this.ship03.update();
        }

        // check collisions
        if (this.checkCollision(this.p1Rocket, this.ship01)){
            this.p1Rocket.reset();
            this.shipExplode(this.ship01);
        }
        if (this.checkCollision(this.p1Rocket, this.ship02)){
            this.p1Rocket.reset();
            this.shipExplode(this.ship02);
        }
        if (this.checkCollision(this.p1Rocket, this.ship03)){
            this.p1Rocket.reset();
            this.shipExplode(this.ship03);
        }
    }

    // Add t milliseconds to the game end timer
    addTime (t){
        this.endTime += t;
        //console.log(this.endTime);
    }

    endScreen(){
        this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', this.scoreConfig).setOrigin(0.5);
        this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart or ← for Menu', this.scoreConfig).setOrigin(0.5);
    }

    checkCollision(rocket, ship){
        // AABB collision detection
        if(rocket.x < ship.x + ship.width &&
            rocket.x + rocket.width > ship.x &&
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship.y){
                return true;
        } else {
            return false;
        }
    }

    shipExplode(ship) {
        // hide ship
        ship.alpha = 0;
        // create explosion sprite
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');
        boom.on('animationcomplete', () => {
            ship.reset();
            ship.alpha = 1;
            boom.destroy();
        })
        // score add and repaint
        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score;

        // Play explosion sound
        this.sound.play('sfx_explosion');

        // Add half a second to end time if furthest ship was hit
        if (ship == this.ship01){
            this.addTime(500);
        }

    }
}
