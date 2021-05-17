// Clone Prefab

class Clone extends Phaser.GameObjects.Sprite {
    // Variable that stores previous player actions
    actionsList = [];
    
    constructor(scene, x, y, texture, frame, actions){
        super(scene, x, y, texture, frame);

        // add obejct to the existing scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setImmovable(true);
        this.setOrigin(0.5, 0);

        scene.physics.add.collider(
            this, 
            scene.player,
            function(_clone, _player){
                if (_clone.body.touching.up && _player.body.touching.down){
                    scene.player.attatchToClone(this.body);
                }
            }
        );

        this.JUMP_HEIGHT = scene.player.JUMP_HEIGHT;
        this.MOVE_SPEED = scene.player.MOVE_SPEED;
        
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
            repeat: -1
        });

        // Assign actions based on param from Player
        this.actionsList = actions;
    }

    update(){
        this.takeAction();
    }

    // Updates movement the exact same as Player.js does, but reads from 
    // the first elem of actionList instead of keyboard input. 
    takeAction(){
        if (this.actionsList.length == 0){
            //console.log("action list empty. returning.");
            return;
        }
        let action = this.actionsList.shift();
        if (action["moveLeft"])
        {
            this.body.setVelocityX(-this.MOVE_SPEED); // move left
            this.anims.play('run', true); // play walk animation
            this.flipX= true; // flip the sprite to the left
        }
        else if (action["moveRight"])
        {
            this.body.setVelocityX(this.MOVE_SPEED); // move right
            this.anims.play('run', true); // play walk animatio
            this.flipX = false; // use the original sprite looking to the right
        } else {
            this.body.setVelocityX(0);
            this.anims.play('idle', true);
        }  
        if (action["moveJump"]  && this.body.onFloor())
        {
            this.body.setVelocityY(-this.JUMP_HEIGHT); // jump up
        }
    }
}
