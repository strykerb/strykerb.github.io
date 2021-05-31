// Protype Scene for testing feasibility of the project

class Level4 extends Phaser.Scene {
    
    constructor() {
        super("level4");
    }

    preload() {
        // map made with Tiled in JSON format
        this.load.tilemapTiledJSON('tilemap4', './assets/tiles/Level4.json');
    }
     
    create() {
        // Create the Background
        this.background = this.add.tileSprite(game.config.width/2, game.config.height/2, this.textures.get('backdrop').width, this.textures.get('backdrop').height, 'backdrop').setOrigin(0.5, 0.5);
        this.background.setScrollFactor(0);
        this.background.scaleX = 1.1;
        this.background.setDepth(-4);

        this.playerSpawnX = 382;
        this.playerSpawnY = 1406;

        // load the map 
        map = this.make.tilemap({key: 'tilemap4'});

        this.coolDownBarWidth = 300;
        
        // tiles for the ground layer
        var groundTiles = map.addTilesetImage('TileSetRe','tiles');
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
        // this.player = new Player(this, 2538, 706, 'player');

        // Instantiate a doorway
        this.doors = [new Doorway(this, 1647, 1406, 'door'), new Doorway(this, 970, 916, 'door')];

        // Instantiate a Pressure Plate
        this.plates = [new PressurePlate(this, 1700, 1406, 'button', 0, 0), new PressurePlate(this, 1788, 916, 'button', 0, 1)];

        this.enemies = [new Enemy(this, 1118, 1056, 'robot')];
        
        //player.setBounce(0.2); // our player will bounce from items
        this.player.body.setCollideWorldBounds(true); // don't go out of the map
        	
        // Add collision with the ground
        this.physics.add.collider(groundLayer, this.player);

        // Adding keyboard input
        // Create key bindings
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
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
            fontFamily: 'Courier',
            fontSize: '30px',
            color: '#faf5c8',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            }
        }

        this.hintConfig = {
            fontFamily: 'Courier',
            fontSize: '60px',
            color: '#faf5c8',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            }
        }
        
        // Add UI Element to the screen
        this.instructions = this.add.text(400 , 680, "Press Space to Reverse Time", this.scoreConfig).setOrigin(0, 0);
        this.instructions.setScrollFactor(0, 0);
        this.instructions.alpha = 0;

        winbox = new Objective(this, 2430, 730, 'coin');
        
        this.finishLevel = () => {
            progress = 4;
            this.scene.start("menuScene");
        }
        
        this.reachedObjective = () => {
            console.log("entered");
            winbox.visible = false;
            this.physics.world.removeCollider(this.overlapCollider);
            win = true;
            labDoor = this.physics.add.sprite(this.playerSpawnX, this.playerSpawnY);
            labDoor.setOrigin(0.5, 0.5);
            labDoor.body.allowGravity = false;
            this.overlapCollider = this.physics.add.overlap(labDoor, this.player, this.finishLevel);
            this.instructions2 = this.add.text(1800 , 500, "Return to the Lab", this.hintConfig).setOrigin(0, 0);
            this.clock = this.time.delayedCall(3000, () => {
                this.instructions2.alpha = 0;
            }, null, this);
        }
        
        this.overlapCollider = this.physics.add.overlap(winbox, this.player, this.reachedObjective);

        console.log(this.doors);

    }
     
    update(time, delta) {
        //console.log(time);
        this.plates.forEach(plate => {
            plate.update(delta);
        });
        this.doors.forEach(door => {
            door.update(delta);
        });
        
        this.player.update();

        this.setValue(this.instructions, this.player.jsonObj.length/this.player.TIME_JUMP);
        
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
