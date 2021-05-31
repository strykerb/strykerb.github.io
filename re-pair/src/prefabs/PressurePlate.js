class PressurePlate extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, texture, frame, idx) {
        super(scene, x, y, texture, frame);

        // add obejct to the existing scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setImmovable(true);
        this.setOrigin(0.5, 1);
        this.body.allowGravity = false;
        this.idx = idx;
        
        const enterPlatePlayer = () => {
            this.steppedOn = true;
            if (!scene.player.collidingPlate) {
                scene.player.collidingPlate = this;
                //scene.doors[this.idx].open();
              
            }
        };

        scene.physics.add.overlap(
            this, 
            scene.player,
            enterPlatePlayer,
            null,
            this
        );


        // Set up some variables
        this.cloneCollisionSetup = false;
        this.steppedOn = false;

    }

    enterPlateClone(){
        this.steppedOn = true;
        if (!this.scene.player.clone.collidingPlate) {
            this.scene.player.clone.collidingPlate = this;
            //this.scene.doors[this.idx].open();
          
        }
    }


    enterPlate (char) {
        console.log("plate collision");
        if (!char.collidingPlate) {
            console.log("plate entered");
            char.collidingPlate = this;
            //this.doorway.open();
          
        }
    }

    exitPlate(char){
        char.collidingPlate = null;
        console.log("plate exited by " + char);
        //this.scene.doors[this.idx].close();
    }

    update(delta){
        if (this.steppedOn){
            this.scene.doors[this.idx].open(delta);
            this.setFrame(1);
        } else {
            this.scene.doors[this.idx].close(delta);
            this.setFrame(0);
        }
        
        // if (this.scene.player.collidingPlate && !this.steppedOn) {
        //     this.scene.doors[this.idx].close(delta);
        //     //this.exitPlate(this.scene.player);
        // }

        if (!this.cloneCollisionSetup && this.scene.player.cloned){
            this.cloneCollisionSetup = true;
            this.scene.physics.add.overlap(
                this, 
                this.scene.player.clone,
                this.enterPlateClone,
                null,
                this
            );
        }

        if (!this.scene.player.cloned){
            this.cloneCollisionSetup = false;
        } 
        // else 
        // {
        //     if (this.scene.player.clone.collidingPlate && !this.steppedOn) {
        //         this.exitPlate(this.scene.player.clone);
        //     }
        // }
        

        // Reset collision flag
        this.steppedOn = false;
    }

    // function(_plate, _player){
    //     if (_plate.body.touching.up && _player.body.touching.down){
    //         //doorway.open();
    //     }
    // }
    
}