class Menu extends Phaser.Scene {
    
    constructor() {
        super("menuScene");
    }

    preload() {
        this.load.image('particle', './assets/sprites/5x5_white.png');
        this.load.image('backdrop', './assets/tiles/repairsky.png');
        this.load.image('coin', './assets/sprites/coinGold.png');
        this.load.image('robot', './assets/sprites/bipedal-unit1.png')

        // player animations
        this.load.atlas('player', './assets/anims/player.png', './assets/anims/player.json');
        this.load.atlas('button', './assets/sprites/button.png', './assets/sprites/button.json');
        this.load.atlas('timeAnim', './assets/anims/timeAnim.png', './assets/anims/timeAnim.json');

        this.load.audio("teleportSound", ["./assets/sounds/timeReverseSound.wav"]);

        // tiles in spritesheet 
        this.load.spritesheet('tiles', './assets/tiles/Tiles70x70.png', {frameWidth: 70, frameHeight: 70});
        
        this.load.image('door', './assets/sprites/pillar3.png');
        // this.load.image('plate', './assets/sprites/pillar2.png');

    }

    create(){
        // Config for Play Button
        let LOCKEDConfig = {
            fontFamily: 'Courier',
            fontSize: '45px',
            color: '#2e2e2e',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            }
        }

        let PREVIOUSConfig = {
            fontFamily: 'Courier',
            fontSize: '30px',
            color: '#faf5c8',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            }
        }

        let NEXTConfig = {
            fontFamily: 'Courier',
            fontSize: '45px',
            color: '#820101',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            }
        }

        if (!progress){
            progress = 3;
        }

        let i;
        this.levels = [];
        for (i = 0; i < 5; i++){
            let levelName = "level" + (i+1);
            let year = 2052-i;
            if (progress != i){
                this.levels[i] = this.add.text((i+1)*game.config.width/6 , game.config.height/2, year, LOCKEDConfig).setOrigin(0.5, 0.5);
            } else{
                this.levels[i] = this.add.text((i+1)*game.config.width/6 , game.config.height/2, year, NEXTConfig).setOrigin(0.5, 0.5);
                this.levels[i].setInteractive();
            } 

            let index = i;

            this.levels[i].on('pointerover', () => {
                enterButtonHoverState(index);
            });
            this.levels[i].on('pointerout', () => {
                enterButtonRestState(index);
            });
            this.levels[i].on('pointerdown', () => { 
                this.scene.start(levelName); 
            });
        }

        this.controls = this.add.text(game.config.width/2, 3*game.config.height/4, "Controls: Arrow Keys for Player Movement", PREVIOUSConfig).setOrigin(0.5, 0.5);
    }

}