// Protype Scene for testing feasibility of the project

class Level5 extends Phaser.Scene {
    
    constructor() {
        super("level5");

        this.LETTER_TIMER = 10;		// # ms each letter takes to "type" onscreen
        this.NEXT_TEXT = '[ENTER]';	// text to display for next prompt
        this.NEXT_X = 2800;			// next text prompt x-position
        this.NEXT_Y = 1430;			// next text prompt y-position
        this.dialogIndex = 0;
        this.prevSpeaker = 1;
        this.dialogueTweenDuration = 500;
    }

    preload() {
        // map made with Tiled in JSON format
        this.load.tilemapTiledJSON('tilemap5', './assets/tiles/Level5.json');
    }
     
    create() {
        this.Dialogue = [
            {speaker: 0, text: "Hello Again."},
            {speaker: 1,  text: "I’m never going to get used to that."},
            {speaker: 0,  text: "There’s something I haven’t fully explained to you. "},
            {speaker: 1,  text: "Actually, you have a lot of explaining to do. Isn’t there some paradox about meeting yourself in the past?"},
            {speaker: 0,  text: "Never mind that. Your time clone doesn’t just follow in your steps, it repeats your actions."},
            {speaker: 1,  text: "What do you mean?"},
            {speaker: 0,  text: "Say for instance you’re running straight into a wall. If you time warp and remove that wall, your clone will run straight through where that wall once stood."},
            {speaker: 0,  text: "In other words, your clone will attempt to reenact your original actions, but changing the environment can affect the outcome of those actions."}, 
            {speaker: 0,  text: "Your time clone can reach a place you didn’t originally go yourself if you clear a path for her."}, 
            {speaker: 1,  text: "I’m guessing I’m going to need to do that in order to get past these doors?"}, 
            {speaker: 0,  text: "That's how I got through."}, 
        ];
        
        // Create the Background
        this.background = this.add.tileSprite(game.config.width/2, game.config.height/2, this.textures.get('backdrop').width, this.textures.get('backdrop').height, 'backdrop').setOrigin(0.5, 0.5);
        this.background.setScrollFactor(0);
        this.background.scaleX = 1.1;
        this.background.setDepth(-4);

        if (!soundEffects["music"].isPlaying){
            soundEffects["music"].play();
        }

        this.playerSpawnX = 382;
        this.playerSpawnY = 2316;

        // load the map 
        map = this.make.tilemap({key: 'tilemap5'});

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
        this.player = new Player(this, this.playerSpawnX, this.playerSpawnY, 'player');
        // this.player = new Player(this, 2270, 1330, 'player');

        // Instantiate a doorway
        this.doors = [new Doorway(this, 2205, 1330, 'door'), new Doorway(this, 2415, 1190, 'door'), new Doorway(this, 945, 980, 'door'),];

        // Instantiate a Pressure Plate
        this.plates = [new PressurePlate(this, 2417, 1336, 'button', 0, 0), new PressurePlate(this, 2140, 1336, 'button', 0, 1), new PressurePlate(this, 1224, 986, 'button', 0, 2)];

        this.enemyEmitters = [];
        this.enemies = [new Enemy(this, 884, 980, 'robot', 0, 0), new Enemy(this, 1996, 2170, 'robot', 0, 1), new Enemy(this, 1511, 2170, 'robot', 0, 2), new Enemy(this, 2491, 2380, 'robot', 0, 3), new Enemy(this, 2806, 2380, 'robot', 0, 4)];
        
        this.player.body.setCollideWorldBounds(true); // don't go out of the map
        	
        // Add collision with the ground
        this.physics.add.collider(groundLayer, this.player);
        this.physics.add.collider(groundLayer, this.enemies);

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
        // this.coolDownBar = this.makeBar(game.config.width/2 - this.coolDownBarWidth/2, 20, 0x2ecc71);
        // this.coolDownBar.setScrollFactor(0, 0);

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
        // this.instructions = this.add.text(400 , 680, "Press Space to Reverse Time", this.scoreConfig).setOrigin(0, 0);
        // this.instructions.setScrollFactor(0, 0);
        // this.instructions.alpha = 0;

        winbox = new Objective(this, 736, 876, 'wrench');
        
        this.finishLevel = () => {
            progress = 5;
            soundEffects["footsteps"].stop();
            this.scene.start("lab");
        }
        
        this.reachedObjective = () => {
            winbox.visible = false;
            this.physics.world.removeCollider(this.overlapCollider);
            win = true;
            labDoor = this.physics.add.sprite(this.playerSpawnX, this.playerSpawnY);
            labDoor.setOrigin(0.5, 0.5);
            labDoor.body.allowGravity = false;
            this.overlapCollider = this.physics.add.overlap(labDoor, this.player, this.finishLevel);
            this.instructions2 = this.add.text(400, 1066, "Return to the Lab", this.hintConfig).setOrigin(0, 0);
            this.clock = this.time.delayedCall(3000, () => {
                this.instructions2.alpha = 0;
            }, null, this);
        }
        
        this.overlapCollider = this.physics.add.overlap(winbox, this.player, this.reachedObjective);

        if (this.dialogIndex == 0){
            this.tutorialTrigger = this.physics.add.sprite(2546, 1200, "coin");
            this.tutorialTrigger.setOrigin(0.5, 0.5);
            this.tutorialTrigger.body.allowGravity = false;
            this.tutorialTrigger.alpha = 0;
            this.tutorialCollider = this.physics.add.overlap(this.tutorialTrigger, this.player, () => {
                this.player.startTutorial();
                this.physics.world.removeCollider(this.tutorialCollider);
                this.Tutorial();
            });
        }
        

    }
     
    update(time, delta) {
        this.plates.forEach(plate => {
            plate.update(delta);
        });
        this.doors.forEach(door => {
            door.update(delta);
        });
        
        this.player.update();

        if(this.player.tutorialActive && keyENTER.isDown && !this.dialogTyping && this.box) {
            // trigger dialog
            this.engageDialogue(++this.dialogIndex);
        }
        
    }

    engageDialogue(idx){
        let x = 2000;
        let y = 1350;
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
            this.clock = this.time.delayedCall(400, () => {
                this.futureSelf.destroy();
                this.player.endTutorial();
                this.tutorialComplete = true;
            }, null, this);
            return;
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
        this.futureSelf = new FutureClone(this, 2300, 800, "player");
        this.futureSelf.flipX = false;
        this.currDialogue = this.add.text(0 , 0, "", this.dialogueConfig).setOrigin(0, 0).setDepth(4);
        
        this.clock = this.time.delayedCall(2000, () => {
            this.bg = this.add.tileSprite(game.config.width/2, game.config.height/2, this.textures.get('dialoguebg').width, this.textures.get('dialoguebg').height, 'dialoguebg').setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(1);
            this.character1 = this.add.tileSprite(game.config.width + 300, 3*game.config.height/4, this.textures.get('character').width, this.textures.get('character').height, 'character').setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(2);
            this.character1.scaleX = 0.5;
            this.character1.scaleY = 0.5;
            this.character2 = this.add.tileSprite(-300, 3*game.config.height/4, this.textures.get('character').width, this.textures.get('character').height, 'character').setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(2);
            this.character2.scaleX = 0.5;
            this.character2.scaleY = 0.5;
            this.character2.flipX = true;
            this.character2.tint = 0x52f6ff;
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
        if (percentage >= 0.99){
            text.alpha = 1;
        } else {
            text.alpha = 0;
        }
    }
}
