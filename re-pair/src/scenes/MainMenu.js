class MainMenu extends Phaser.Scene {

    constructor() {
        super("mainMenuScene");
    }

    preload () {
        if (this.play){
            return;
        }

        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBar.x = 240;
        progressBox.x = 240;
        progressBar.y = 80;
        progressBox.y = 80;
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        var width = game.config.width;
        var height = game.config.height;
        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        
        this.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

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

        this.load.image("background", "./assets/sprites/BG.png");
    }

    create() {

        this.background = this.add.image(game.config.width/2, game.config.height/2, 'background').setOrigin(0.5, 0.5);

        this.background.scaleX = 0.7;
        this.background.scaleY = 0.7;

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
        this.play = this.add.text(game.config.width/3 , 3*game.config.height/4 - 10, "PLAY", this.creditsConfig).setOrigin(0.5, 0.5);
        this.play.setInteractive();
        this.play.on('pointerover', () => { enterButtonHoverState(this.play); });
        this.play.on('pointerout', () => { enterButtonRestState(this.play); });
        this.play.on('pointerdown', () => { 
            this.scene.start("introScene"); 
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
        this.credits = this.add.text((2 * game.config.width)/3 -20, 3*game.config.height/4 - 10, "CREDITS", this.creditsConfig).setOrigin(0.5, 0.5);
        this.credits.setInteractive();
        this.credits.on('pointerover', () => { enterButtonHoverState(this.credits); });
        this.credits.on('pointerout', () => { enterButtonRestState(this.credits); });
        this.credits.on('pointerdown', () => { 
            this.scene.start("creditsScene");
        });
    }
}
