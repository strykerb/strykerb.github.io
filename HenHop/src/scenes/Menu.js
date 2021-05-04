class Menu extends Phaser.Scene {

    constructor() {
        super("menuScene");
    }

    preload(){
        // Check if we have already loaded the assets
        if (this.background){
            return;
        }
        // Load Images
        this.load.image('obstacle1', './HenHop/assets/pillar1.png');
        this.load.image('obstacle2', './HenHop/assets/pillar2.png');
        this.load.image('obstacle3', './HenHop/assets/pillar3.png');
        this.load.image('backLayer1', './HenHop/assets/hill2.png');
        this.load.image('backLayer2', './HenHop/assets/hill1.png');
        this.load.image('backLayer3', './HenHop/assets/tree4.png');
        this.load.image('backLayer4', './HenHop/assets/tree3.png');
        this.load.image('backLayer5', './HenHop/assets/tree2.png');
        this.load.image('backLayer6', './HenHop/assets/tree1.png');
        this.load.image('backLayer7', './HenHop/assets/cloudsandmountains.png');
        this.load.image('sun', './HenHop/assets/sun.png');
        this.load.image('background', './HenHop/assets/menuTitle.png');
        this.load.image('deathScreen', './HenHop/assets/Endscreen.png');
        
        // Load spritesheet with player animations
        this.load.atlas('spriteSheet', './HenHop/assets/spritesheet.png', 'assets/spritesheet.json');

        // Load Audio Files
        this.load.audio("music", ["./HenHop/assets/sounds/music.wav"]);
        this.load.audio("jump", ["./HenHop/assets/sounds/jumpSound.wav"]);
        this.load.audio("bock", ["./HenHop/assets/sounds/chickenSound.mp3"]);
        
        // Call function that loads game font
        loadFont("chuck", "./HenHop/assets/fonts/Chuck_W01_Regular.ttf");

        console.log(this.textures);
    }

    create(){
        this.background = this.add.image(game.config.width/2, game.config.height/2, 'background').setOrigin(0.5, 0.5);
        this.background.scaleX = 0.7;
        this.background.scaleY = 0.7;

        // Create Score UI
        let PLAYConfig = {
            fontFamily: 'chuck',
            fontSize: '56px',
            color: '#faf5c8',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            }
        }

        // Create Score UI
        let CREDITSConfig = {
            fontFamily: 'chuck',
            fontSize: '40px',
            color: '#faf5c8',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            }
        }
        
        // Add Play Button to the Screen
        this.play = this.add.text(game.config.width/2 , 3*game.config.height/4, "PLAY", PLAYConfig).setOrigin(0.5, 0.5);
        this.play.setInteractive();
        this.play.on('pointerover', () => { enterButtonHoverState(this.play); });
        this.play.on('pointerout', () => { enterButtonRestState(this.play); });
        this.play.on('pointerdown', () => { this.scene.start("playScene"); });

        // Add Credits Button to the Screen
        this.credits = this.add.text(game.config.width/2 , 3*game.config.height/4 +50, "CREDITS", CREDITSConfig).setOrigin(0.5, 0.5);
        this.credits.setInteractive();
        this.credits.on('pointerover', () => { enterButtonHoverState(this.credits); });
        this.credits.on('pointerout', () => { enterButtonRestState(this.credits); });
        this.credits.on('pointerdown', () => { this.scene.start("creditsScene"); });
        
    }

    
    
}