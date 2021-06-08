class Menu extends Phaser.Scene {
    
    constructor() {
        super("menuScene");
    }

    preload() {
        
    }

    create(){
        soundEffects["music"].stop();
        
        // Config for Play Button
        let LOCKEDConfig = {
            fontFamily: 'cyberfunk',
            fontSize: '45px',
            color: '#2e2e2e',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            }
        }

        let PREVIOUSConfig = {
            fontFamily: 'cyberfunk',
            fontSize: '30px',
            color: '#faf5c8',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            }
        }

        let NEXTConfig = {
            fontFamily: 'cyberfunk',
            fontSize: '45px',
            color: '#820101',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            }
        }

        if (!progress){
            progress = 2;
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
                enterButtonHoverState(this.levels[index]);
            });
            this.levels[i].on('pointerout', () => {
                enterButtonRestState(this.levels[index]);
            });
            this.levels[i].on('pointerdown', () => { 
                soundEffects["music"].play();
                this.scene.start(levelName); 
            });
        }
        
    }

}