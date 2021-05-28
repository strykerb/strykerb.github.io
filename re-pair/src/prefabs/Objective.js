class Objective extends Phaser.GameObjects.Sprite {
    

    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        this.scene = scene;
        // add obejct to the existing scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setOrigin(0.5, 0.5);
        this.body.allowGravity = false;
        
    }

    update(){
        
    }
    
}