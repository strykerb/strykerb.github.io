// Protype Scene for testing feasibility of the project

class Level1 extends Phaser.Scene {
    
    constructor() {
        super("level1");

        this.LETTER_TIMER = 10;		// # ms each letter takes to "type" onscreen
        this.NEXT_TEXT = '[ENTER]';	// text to display for next prompt
        this.NEXT_X = 2500;			// next text prompt x-position
        this.NEXT_Y = 1200;			// next text prompt y-position
        this.dialogIndex = 0;
        this.prevSpeaker = 1;
        this.dialogueTweenDuration = 500;
    }

    preload() {
        // map made with Tiled in JSON format
        this.load.tilemapTiledJSON('tilemap1', './assets/tiles/Level1Redo.json');
        // tiles in spritesheet 
        this.load.spritesheet('tiles', './assets/tiles/TilesR.png', {frameWidth: 70, frameHeight: 70});

        this.load.image('coin', './assets/sprites/coinGold.png');
        
    }
     
    create() {
        this.Dialogue = [{speaker: 1, time: 2000, text: "Fancy seeing you here."},
            {speaker: 0, time: 2000, text: "Wait... You’re… Me."},
            {speaker: 1, time: 5000, text: "Yes and no. The important thing is, your portal is broken, and you need to fix it in order to go further back in time."},
            {speaker: 0, time: 2000, text: "How are you here?"},
            {speaker: 1, time: 7000, text: "I’m you, from the future. Sort of. Anyways, the piece that will get your portal up and running again is just ahead, but it’s too high for you to reach alone."},
            {speaker: 0, time: 2000, text: "So you’re gonna help me?"},
            {speaker: 1, time: 3000, text: "No, you’re gonna help yourself. In the future."},
            {speaker: 0, time: 1500, text: "You're not making any sense."}, 
            {speaker: 1, time: 6000, text: "See this Energy hotspot in front of me? That’s the time rift that shows up wherever you were a couple of seconds ago."}, 
            {speaker: 1, time: 9000, text: "When you see yourself charged with energy, all you need to do is activate your Time Warp, and you’ll be transported back to that spot, across space and time."}, 
            {speaker: 0, time: 3000, text: "So how does going backwards help me get up there?"}, 
            {speaker: 1, time: 6000, text: "When you Time Warp, you can interact with your past-self from an alternate timeline. A time clone, if you will."}, 
            {speaker: 1, time: 9000, text: "All you gotta do is stand in the right spot, Time Warp, and then jump on your time clone’s head. That should give you the boost you need to get up there."}, 
            {speaker: 0, time: 2000, text: "Sounds easy enough."}, 
            {speaker: 1, time: 4000, text: "Don’t give up. You know she wouldn’t give up on you."}, 
        ];

        if (!soundEffects["music"].isPlaying){
            soundEffects["music"].play();
        }
        
        // Create the Background
        this.background = this.add.tileSprite(game.config.width/2, game.config.height/2, this.textures.get('backdrop').width, this.textures.get('backdrop').height, 'backdrop').setOrigin(0.5, 0.5);
        this.background.setScrollFactor(0);
        this.background.scaleX = 1.1;
        this.background.setDepth(-4);

        // load the map 
        map = this.make.tilemap({key: 'tilemap1'});

        this.coolDownBarWidth = 300;
        
        // tiles for the ground layer
        var groundTiles = map.addTilesetImage('TilesR','tiles', 70, 70, 0, 0);
        // create the ground layer
        groundLayer = map.createLayer('Ground', groundTiles, 0, 0);
        groundLayer.setDepth(-2);
        // the player will collide with this layer
        groundLayer.setCollisionByExclusion([-1]);

        // load bg tileset
        bgLayer = map.createLayer("Background", groundTiles, 0, 0);
        bgLayer.setDepth(-3);
        map.createLayer("Acc", groundTiles, 0, 0);
     
        // set the boundaries of our game world
        this.physics.world.bounds.width = groundLayer.width;
        this.physics.world.bounds.height = groundLayer.height;

        this.particleManager = this.add.particles('particle');

        // Instantiate the Player Class  
        this.player = new Player(this, 467, 1266, 'player');
        // this.player = new Player(this, 2000, 1200, 'player');

        //player.setBounce(0.2); // our player will bounce from items
        this.player.body.setCollideWorldBounds(true); // don't go out of the map
        	
        // Add collision with the ground
        this.physics.add.collider(groundLayer, this.player);

        this.doors = [];

        this.plates = [];

        this.enemies = [];
        
        this.enemyEmitters = [];

        // Adding keyboard input
        // Create key bindings
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        keyENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        //cursors = this.input.keyboard.createCursorKeys();

        // set bounds so the camera won't go outside the game world
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // make the camera follow the player
        this.cameras.main.startFollow(this.player);
        
        // set background color, so the sky is not black    
        this.cameras.main.setBackgroundColor('#ccccff'); 

        // Create ability cooldown bar
        //this.coolDownBar = this.makeBar(game.config.width/2 - this.coolDownBarWidth/2, 20, 0x2ecc71);
        // this.setValue(this.coolDownBar, 0);
        //this.coolDownBar.setScrollFactor(0, 0);

        // Load Sound
        this.teleportSound = this.sound.add("teleportSound", {loop: false, volume: 0.7});

        this.scoreConfig = {
            fontFamily: 'cyberfunk',
            fontSize: '30px',
            color: '#faf5c8',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            }
        }

        this.hintConfig = {
            fontFamily: 'cyberfunk',
            fontSize: '60px',
            color: '#faf5c8',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            }
        }

        this.dialogueConfig = {
            fontFamily: 'cyberfunk',
            fontSize: '30px',
            color: '#faf5c8',
            align: 'left', 
            wordWrap: { width: 750, useAdvancedWrap: true }
        }
        
        // Add UI Element to the screen
        this.instructions = this.add.text(500 , 280, "Press SPACE to Reverse Time", this.scoreConfig).setOrigin(0, 0);
        this.instructions.setScrollFactor(0, 0);
        this.instructions.alpha = 0;

        winbox = new Objective(this, 2628, 985.9999999999999, 'wrench');
        
        this.finishLevel = () => {
            progress = 1;
            this.scene.start("lab");
        }
        
        this.reachedObjective = () => {
            winbox.visible = false;
            this.physics.world.removeCollider(this.overlapCollider);
            win = true;
            labDoor = this.physics.add.sprite(467, 1266);
            labDoor.setOrigin(0.5, 0.5);
            labDoor.body.allowGravity = false;
            this.overlapCollider = this.physics.add.overlap(labDoor, this.player, this.finishLevel);
            this.instructions2 = this.add.text(1850 , 900, "Return to the Lab", this.hintConfig).setOrigin(0, 0);
            this.clock = this.time.delayedCall(3000, () => {
                this.instructions2.alpha = 0;
            }, null, this);
        }
        
        this.overlapCollider = this.physics.add.overlap(winbox, this.player, this.reachedObjective);

        this.tutorialTrigger = this.physics.add.sprite(2062, 1000, "coin");
        this.tutorialTrigger.setOrigin(0.5, 0.5);
        this.tutorialTrigger.body.allowGravity = false;
        this.tutorialTrigger.scaleY = 13;
        this.tutorialTrigger.alpha = 0;
        this.tutorialCollider = this.physics.add.overlap(this.tutorialTrigger, this.player, () => {
            this.player.startTutorial();
            this.physics.world.removeCollider(this.tutorialCollider);
            this.Tutorial();
            
        });

        win = false;
        this.tutorialComplete = false;

    }
     
    update(time, delta) {
        
        this.player.update();

        this.setValue(this.instructions, this.player.jsonObj.length/this.player.TIME_JUMP);

        if(this.player.tutorialActive && keyENTER.isDown && !this.dialogTyping) {
            // trigger dialog
            this.engageDialogue(++this.dialogIndex);
        }
        
    }

    engageDialogue(idx){
        
        let x = 1700;
        let y = 1125;
        this.dialogTyping = true;
        this.currDialogue.text = "";
        if (this.nextText){
            this.nextText.destroy();
        }
        if (idx >= this.Dialogue.length){
            this.futureSelf.jump();
            this.currDialogue.text = "";
            this.bg.destroy();
            this.box.destroy();
            this.character2.destroy();
            this.character1.destroy();
            this.nextText.destroy();
            this.clock = this.time.delayedCall(1000, () => {
                this.futureSelf.destroy();
                this.player.endTutorial();
                this.tutorialComplete = true;
            }, null, this);
            return;
        }

        if (idx == 8){
            this.futureSelf.setupEmitter();
        }

        if (idx == 0){
            this.prevSpeaker = 1;
        } else {
            this.prevSpeaker = this.Dialogue[idx-1]['speaker'];
        }
        
        if (this.Dialogue[idx]['speaker'] == 0 && this.prevSpeaker == 1){
            this.tweens.add({
                targets: this.character2,
                x: game.config.width/5,
                duration: this.dialogueTweenDuration,
                ease: 'Linear'
            });
            this.tweens.add({
                targets: this.character1,
                x: game.config.width + 300,
                duration: this.dialogueTweenDuration,
                ease: 'Linear'
            });
        } else if (this.Dialogue[idx]['speaker'] == 1 && this.prevSpeaker == 0){
            this.tweens.add({
                targets: this.character2,
                x: -300,
                duration: this.dialogueTweenDuration,
                ease: 'Linear'
            });
            this.tweens.add({
                targets: this.character1,
                x: 4* game.config.width/5,
                duration: this.dialogueTweenDuration,
                ease: 'Linear'
            });
        }
        if (this.Dialogue[idx]['speaker'] == 1){
            this.box.flipX = true;
        } else {
            this.box.flipX = false;

        }

        this.currDialogue.x = x;
        this.currDialogue.y = y;
        let currentChar = 0; 
        this.textTimer = this.time.addEvent({
            delay: this.LETTER_TIMER,
            repeat: this.Dialogue[idx]['text'].length - 1,
            callback: () => { 
                // concatenate next letter from dialogLines
                this.currDialogue.text += this.Dialogue[idx]['text'][currentChar];
                // advance character position
                currentChar++;
                // check if timer has exhausted its repeats 
                // (necessary since Phaser 3 no longer seems to have an onComplete event)
                if(this.textTimer.getRepeatCount() == 0) {
                    // show prompt for more text
                    this.nextText = this.add.text(this.NEXT_X, this.NEXT_Y, this.NEXT_TEXT, this.dialogueConfig).setOrigin(0, 0).setDepth(4);
                    // un-lock input
                    this.dialogTyping = false;

                    // destroy timer
                    this.textTimer.destroy();
                }
            },
            callbackScope: this // keep Scene context
        });
    }

    Tutorial(){
        this.futureSelf = new FutureClone(this, 2268, 400, "player");
        this.currDialogue = this.add.text(0 , 0, "", this.dialogueConfig).setOrigin(0, 0).setDepth(4);
        
        this.clock = this.time.delayedCall(2000, () => {
            this.bg = this.add.tileSprite(game.config.width/2, game.config.height/2, this.textures.get('dialoguebg').width, this.textures.get('dialoguebg').height, 'dialoguebg').setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(1);
            this.character1 = this.add.tileSprite(4* game.config.width/5, 3*game.config.height/4, this.textures.get('character').width, this.textures.get('character').height, 'character').setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(2);
            this.character1.scaleX = 0.5;
            this.character1.scaleY = 0.5;
            this.character1.tint = 0x52f6ff;
            this.character2 = this.add.tileSprite(-300, 3*game.config.height/4, this.textures.get('character').width, this.textures.get('character').height, 'character').setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(2);
            this.character2.scaleX = 0.5;
            this.character2.scaleY = 0.5;
            this.character2.flipX = true;
            this.box = this.add.tileSprite(game.config.width/2, 2*game.config.height/3, this.textures.get('dialoguebox').width, this.textures.get('dialoguebox').height, 'dialoguebox').setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(3);
            this.box.flipX = true;
            // this.bg = this.physics.add.image(this, game.config.width/2, game.config.height/2, 'dialoguebg', 0).setOrigin(0.5, 0.5);
            // this.bg.setDepth(1);
            this.engageDialogue(this.dialogIndex);
        }, null, this);
    }

    makeBar(x, y, color) {
        //draw the bar
        let bar = this.add.graphics();

        //color the bar
        bar.fillStyle(color, 1);

        //fill the bar with a rectangle
        bar.fillRect(0, 0, this.coolDownBarWidth, 50);
        
        //position the bar
        bar.x = x;
        bar.y = y;

        //return the bar
        return bar;
    }
    
    setValue(text, percentage) {
        //scale the bar
        //bar.scaleX = percentage;
        if (percentage >= 0.99 && this.tutorialComplete){
            text.alpha = 1;
        } else {
            text.alpha = 0;
        }
    }
}
