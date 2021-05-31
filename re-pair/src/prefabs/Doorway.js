class Doorway extends Phaser.GameObjects.Sprite {
    
    MOVE_VECTOR_Y = 0;
    // OPEN_SPEED = 0.3;
    OPEN_SPEED = 300;
    ORIGINAL_POS_Y = 0;
    SCALE = 2.5

    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        // add obejct to the existing scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setImmovable(true);
        this.setOrigin(0.5, 1);
        this.body.allowGravity = false;
        this.scaleY = this.SCALE;
        
        scene.physics.add.collider(this, scene.player);
        scene.physics.add.collider(this, scene.player.clone);

        this.MOVE_VECTOR_Y = this.height * this.SCALE;

        this.jsonObj = [];
        this.past_pos = this.y;

        this.ORIGINAL_POS_Y = y;
        this.isOpen = false;
    }


    open (delta) {
        if (this.scene.player.teleporting){
            this.body.setVelocityY(0);
            return;
        }
        else if (this.y >= this.ORIGINAL_POS_Y + this.MOVE_VECTOR_Y){
            this.body.setVelocityY(0);
            return;
        } else {
            this.body.setVelocityY(this.OPEN_SPEED);
            // this.y += Math.round(this.OPEN_SPEED * delta);
        }
    }

    close(delta){
        if (this.scene.player.teleporting){
            this.body.setVelocityY(0);
            return;
        }
        else if (this.y <= this.ORIGINAL_POS_Y){
            this.body.setVelocityY(0);
            return;
        } else {
            this.body.setVelocityY(-this.OPEN_SPEED);
            // this.y -= Math.round(this.OPEN_SPEED * delta);
        }
        
    }

    update(delta){
        
        if (!this.scene.player.teleporting){
            this.addTimeStamp();
        }
        
    }

    addTimeStamp(){
        // If we are exceeding the maximum recorded actions, remove the first elem of jsonObj
        this.past_pos = this.jsonObj[0];
        if (this.jsonObj.push(this.y) >= this.scene.player.TIME_JUMP){
            this.jsonObj.shift();
        }
    }

    revert(){
        let tween = this.scene.tweens.add({
            targets: this,
            y: { from: this.y, to: this.past_pos },
            ease: Phaser.Math.Easing.Quadratic.InOut,       // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: this.scene.player.TELEPORT_TIME,
            repeat: 0,            // -1: infinity
            yoyo: false
        });
        
        //this.y = this.past_pos;
        console.log("reverting to " + this.past_pos);
        this.jsonObj = [];
    }
    
}