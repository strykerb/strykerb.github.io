class MainMenu extends Phaser.Scene {

    constructor() {
        super("mainMenuScene");
    }

    preload () {
        this.load.image('particle', './assets/sprites/5x5_white.png');
        this.load.image('backdrop', './assets/tiles/repairsky.png');
        this.load.image('robot', './assets/sprites/bipedal-unit1.png')
        this.load.image('dialoguebg', './assets/sprites/dialoguebg.png')
        this.load.image('dialoguebox', './assets/sprites/dialoguebox.png')
        this.load.image('character', './assets/sprites/TempGirl.png')

        loadFont("cyberfunk", "./assets/fonts/Cyberfunk.ttf");
        loadFont("Orbitron", "./assets/fonts/Orbitron-Bold.ttf");

        // player animations
        this.load.atlas('player', './assets/anims/player.png', './assets/anims/player.json');
        this.load.atlas('enemy', './assets/anims/enemyWalk.png', './assets/anims/enemyWalk.json');
        this.load.atlas('button', './assets/sprites/button.png', './assets/sprites/button.json');
        this.load.atlas('timeAnim', './assets/anims/timeAnim.png', './assets/anims/timeAnim.json');
        this.load.atlas('timeWarp', './assets/anims/timewarpSS.png', './assets/anims/timewarp.json');
        this.load.atlas('wrench', './assets/anims/wrenchSS.png', './assets/anims/wrench.json');
        this.load.atlas('portal', './assets/anims/portalSS.png', './assets/anims/portal.json');

        this.load.audio("teleportSound", ["./assets/sounds/timeReverseSound.wav"]);
        this.load.audio("music", ["./assets/sounds/music.wav"]);
        this.load.audio("jumpSound", ["./assets/sounds/jumpSound.mp3"]);
        this.load.audio("footsteps", ["./assets/sounds/footsteps.mp3"]);

        // tiles in spritesheet 
        this.load.spritesheet('tiles', './assets/tiles/TilesR.png', {frameWidth: 70, frameHeight: 70});
        
        this.load.image('door', './assets/sprites/door.png');
    }

    create() {

        this.creditsConfig = {
            fontFamily: 'Orbitron',
            fontSize: '56px',
            color: '#faf5c8',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            }
        }

        // Add Play Button to the Screen
        this.play = this.add.text(game.config.width/3 , 3*game.config.height/4, "PLAY", this.creditsConfig).setOrigin(0.5, 0.5);
        this.play.setInteractive();
        this.play.on('pointerover', () => { enterButtonHoverState(this.play); });
        this.play.on('pointerout', () => { enterButtonRestState(this.play); });
        this.play.on('pointerdown', () => { 
            this.scene.start("lab"); 
        });

        // Add Tutorial Button to the Screen
        // this.tutorial = this.add.text(game.config.width/3 , 3*game.config.height/4, "TUTORIAL", CREDITSConfig).setOrigin(0.5, 0.5);
        // this.tutorial.setInteractive();
        // this.tutorial.on('pointerover', () => { enterButtonHoverState(this.tutorial); });
        // this.tutorial.on('pointerout', () => { enterButtonRestState(this.tutorial); });
        // this.tutorial.on('pointerdown', () => { 
        //     this.UISound.play();
        //     this.scene.start("tutorialScene"); 
        // });

        // Add Credits Button to the Screen
        this.credits = this.add.text((2 * game.config.width)/3 -20, 3*game.config.height/4, "CREDITS", this.creditsConfig).setOrigin(0.5, 0.5);
        this.credits.setInteractive();
        this.credits.on('pointerover', () => { enterButtonHoverState(this.credits); });
        this.credits.on('pointerout', () => { enterButtonRestState(this.credits); });
        this.credits.on('pointerdown', () => { 
            this.scene.start("creditsScene");
        });
    }
}