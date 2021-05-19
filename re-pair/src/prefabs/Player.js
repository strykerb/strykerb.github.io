// Player Prefab

class Player extends Phaser.GameObjects.Sprite {
    TIME_JUMP = 400;
    MOVE_SPEED = 300;
    JUMP_HEIGHT = 590;
    ATTATCH_OFFSET = 6;
    curr_scene;
    past_pos;
    cloned = false;
    count = 1;
    
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        // add obejct to the existing scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5, 0);
        
        // Setup Walk Animation
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNames('player', { prefix: 'run', start: 1, end: 12 }),
            frameRate: 30,
            repeat: -1
        });
        // idle with only one frame, so repeat is not neaded
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('player', { prefix: 'idle', start: 1, end: 4 }),
            frameRate: 10,
        });

        this.jsonObj = [];
        this.jsonObj.push({"count": 1});
        this.curr_scene = scene;
        this.past_pos = {"posX":this.x, "posY":this.y};

        this.attatched = false;
        this.TELEPORT_TIME = 3000;
        this.teleporting = false;
        this.cloned = false;
        this.collidingPlate = null;

    }

    update(){
        // Check if player should no longer be attatched to the clone
        let netVelocity = 0;

        // block player input during teleport
        if (this.teleporting){
            return;
        }
        
        if(this.attatched){
            //console.log("check: " + this.y + " < " + (this.clone.y - this.height - this.ATTATCH_OFFSET));
            if (this.x < this.clone.x - this.width/2 || this.x > this.clone.x + this.width/2){
                this.attatched = false;
            }
            if (this.y < this.clone.y - this.height - this.ATTATCH_OFFSET){
                this.attatched = false;
            }
            if(this.attatched){
                netVelocity = this.clone.body.velocity.x;
                this.body.setVelocityY(this.clone.body.velocity.y);
                if (this.y > this.clone.y - this.height){
                    this.y = this.clone.y - this.height;
                }
            }
        }
        
        if (keyLEFT.isDown)
        {
            this.body.setVelocityX(netVelocity - this.MOVE_SPEED); // move left
            this.anims.play('run', true); // play walk animation
            this.flipX= true; // flip the sprite to the left
        }
        else if (keyRIGHT.isDown)
        {
            this.body.setVelocityX(netVelocity + this.MOVE_SPEED); // move right
            this.anims.play('run', true); // play walk animation
            this.flipX = false; // use the original sprite looking to the right
        } else {
            this.body.setVelocityX(netVelocity);
            this.anims.play('idle', true);
        }  
        if (keyUP.isDown  && (this.body.onFloor() || this.attatched))
        {
            this.body.setVelocityY(-this.JUMP_HEIGHT); // jump up
        }
        if (keySPACE.isDown && this.jsonObj.length >= this.TIME_JUMP-1){
            this.makeClone();
        }

        // Store Position and keyboard input, if a clone doen't currently exist
        if (!this.cloned && !this.teleporting){
            this.addTimeStamp();
        }
        
        // Decide whether clone should expire, and process accordingly
        this.processClone();
    }

    // Appends position and input at the current moment to jsonObj
    addTimeStamp(){
        let item = {};
        item ["posX"] = this.x;
        item ["posY"] = this.y;
        item ["moveLeft"] = keyLEFT.isDown;
        item ["moveRight"] = keyRIGHT.isDown;
        item ["moveJump"] = keyUP.isDown;
        
        // If we are exceeding the maximum recorded actions, remove the first elem of jsonObj
        if (this.jsonObj.push(item) >= this.TIME_JUMP){
            this.past_pos = this.jsonObj.shift();
        }
    }

    // Creates a child clone, and passes it the jsonObj
    makeClone(){
        this.teleporting = true;
        console.log(this.x + ", " + this.y);
        
        this.setVisible(false);
        
        // Disable Input
        //this.scene.input.keyboard.enabled = false;
        
        // Play teleport sound
        this.scene.teleportSound.play();

        const cam = this.scene.cameras.main;
        cam.pan(this.past_pos["posX"], this.past_pos["posY"], this.TELEPORT_TIME, 'Elastic');

        this.clock = this.scene.time.delayedCall(this.TELEPORT_TIME, () => {
            this.teleporting = false;
            this.cloned = true;
            this.setVisible(true);

            // Move Player
            this.x = this.past_pos["posX"];
            this.y = this.past_pos["posY"];

            // Spawn clone instance
            //this.clone = new Clone(this.curr_scene, this.past_pos["posX"], this.past_pos["posY"], 'player', 0, this.jsonObj);
            this.clone = new Clone(this.curr_scene, this.x, this.y, 'player', 0, this.jsonObj);
            this.clone.body.setCollideWorldBounds(true); // don't go out of the map
            this.curr_scene.physics.add.collider(groundLayer, this.clone);

            //this.scene.input.keyboard.enabled = true;

            // Reset action list
            this.jsonObj = [];
            this.past_pos = [];
            
        }, null, this);

    }

    // Decide whether clone has expired or not
    processClone(){
        if (this.cloned){
            this.count++;
            if (this.count >= this.TIME_JUMP){
                this.clone.destroy();
                this.attatched = false;
                this.cloned = false;
                this.count = 1;
                return;
            }
            this.clone.update();
        }
    }

    attatchToClone(clone){
        this.attatched = true;
    }
}