class Credits extends Phaser.Scene {

    constructor() {
        super("creditsScene");
    }

    preload () {
        loadFont("Orbitron", "./assets/fonts/Orbitron-Bold.ttf");
    }

    create(){

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
        
        this.creditsText = this.add.text(0, 0, 'Credits', this.creditsConfig);
        this.madeByText = this.add.text(0, 0, 'Created By:', 
        { 
        fontFamily: 'Orbitron',
        fontSize: '56px',
        color: '#faf5c8', });
        
        this.peopleCredits = this.add.text(0, 0, ' \n Programmer, Level Designer and Production Manager By \n Strker Buffington \n\n Artwork By \n Lauren Nakamura \n\n Sound and Tilemap Implementation By \n Rohan Jhangiani \n\n Additional Sound Effects From \n Zapsplat - Alan Mckinney', 
        { 
        fontFamily: 'Orbitron',
        fontSize: '30px',
        color: '#faf5c8', });
        
        this.zone = this.add.zone(config.width/2, config.height/2, config.width, config.height);

        Phaser.Display.Align.In.Center(
        this.creditsText,
        this.zone
        );
        
        Phaser.Display.Align.In.Center(
        this.madeByText,
        this.zone
        );

        Phaser.Display.Align.In.Center(
        this.peopleCredits,
        this.zone
        );


        
        this.creditsText.setY(100);
        this.madeByText.setY(200);
        this.peopleCredits.setY(250);

        // Add Back Button to the Screen
        this.back = this.add.text(game.config.width/6 , game.config.height/6, "BACK", this.creditsConfig).setOrigin(0.5, 0.5);
        this.back.setInteractive();
        this.back.on('pointerover', () => { enterButtonHoverState(this.back); });
        this.back.on('pointerout', () => { enterButtonRestState(this.back); });
        this.back.on('pointerdown', () => { 
            this.scene.start("mainMenuScene"); 
        });
        
    }
}