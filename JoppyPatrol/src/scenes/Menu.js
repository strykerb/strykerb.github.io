class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }

    preload() {
        // load audio
        this.load.audio('sfx_select', './JoppyPatrol/assets/click.wav');
        this.load.audio('sfx_explosion', './JoppyPatrol/assets/collision.wav');
        this.load.audio('sfx_rocket', './JoppyPatrol/assets/launch.wav');
        this.load.image('menuScreen', './JoppyPatrol/assets/menu.png');
    }

    create() {
        // menu text configuration
        let menuConfig = {
            fontFamily: 'Garamond',
            fontSize: '28px',
            backgroundColor: '#0b2e01',
            color: '#ffffff',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
        }

        // show menu
        var menu = this.add.sprite(game.config.width/2, game.config.height/2, 'menuScreen');

        // define keys
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    }

    update(){
        if (Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            // easy mode
            game.settings = {
              spaceshipSpeed: 3,
              gameTimer: 60000
            }
            this.sound.play('sfx_select');
            this.scene.start('playScene');
        }
        if (Phaser.Input.Keyboard.JustDown(keyRIGHT)) {
            // hard mode
            game.settings = {
                spaceshipSpeed: 4,
                gameTimer: 45000
            }
            this.sound.play('sfx_select');
            this.scene.start('playScene');
        }
    }
}
