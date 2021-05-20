class Menu extends Phaser.Scene {
    
    constructor() {
        super("menuScene");
    }

    preload() {

    }

    create(){
        // Config for Play Button
        let PLAYConfig = {
            fontFamily: 'Courier',
            fontSize: '56px',
            color: '#faf5c8',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            }
        }

        // Add Play Button to the Screen
        this.lvl1 = this.add.text(game.config.width/2 , game.config.height/2, "Level 1", PLAYConfig).setOrigin(0.5, 0.5);
        this.lvl1.setInteractive();
        this.lvl1.on('pointerover', () => { enterButtonHoverState(this.lvl1); });
        this.lvl1.on('pointerout', () => { enterButtonRestState(this.lvl1); });
        this.lvl1.on('pointerdown', () => { 
            this.scene.start("level1"); 
        });

        // Add Play Button to the Screen
        this.lvl2 = this.add.text(game.config.width/2 , 3* game.config.height/4, "Level 2", PLAYConfig).setOrigin(0.5, 0.5);
        this.lvl2.setInteractive();
        this.lvl2.on('pointerover', () => { enterButtonHoverState(this.lvl2); });
        this.lvl2.on('pointerout', () => { enterButtonRestState(this.lvl2); });
        this.lvl2.on('pointerdown', () => { 
            this.scene.start("level2"); 
        });
    }

}