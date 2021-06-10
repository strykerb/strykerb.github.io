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

        this.background = this.add.image(game.config.width/2, game.config.height/2, 'backdrop').setOrigin(0.5, 0.5);
        this.background.scaleX = 1.1;
        this.background.scaleY = 1.1;

        
        //this.creditsText = this.add.text(0, 0, 'Credits', this.creditsConfig);
        this.madeByText = this.add.text(0, 0, 'Created By:', 
        { 
        fontFamily: 'Orbitron',
        fontSize: '56px',
        color: '#faf5c8', });
        
        this.peopleCredits = this.add.text(0, 0, '\nStryker Buffington\n   Gameplay Programmer, Level Designer and Production Manager\n\nLauren Nakamura\n   Visual Design, Game Art and Animation\n\nRohan Jhangiani\n   Sound Design, Tilemap Implementation, and Supporting Programmer\n \n Additional Sound Effects From \n Zapsplat - Alan Mckinney', 
        { 
        fontFamily: 'Orbitron',
        fontSize: '30px',
        color: '#faf5c8', 
        align: "center"});
        
        this.zone = this.add.zone(game.config.width/2, game.config.height/2, game.config.width, game.config.height);

        // Phaser.Display.Align.In.Center(
        // this.creditsText,
        // this.zone
        // );
        
        Phaser.Display.Align.In.Center(
        this.madeByText,
        this.zone
        );

        Phaser.Display.Align.In.Center(
        this.peopleCredits,
        this.zone
        );


        
        // this.creditsText.setY(100);
        this.madeByText.setY(150);
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