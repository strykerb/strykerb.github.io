class Portal extends Phaser.GameObjects.Sprite {
    

    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        this.scene = scene;
        // add obejct to the existing scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setOrigin(0.5, 0);
        this.body.allowGravity = false;
        this.body.setSize(8, 64, 16, 0);
        this.createAnims();
        this.anims.play('on');

    }

    createAnims(){
        this.anims.create({
            key: 'on',
            frames: this.anims.generateFrameNames('portal', { prefix: 'sprite', start: 1, end: 12 }),
            frameRate: 15,
            repeat: -1
        });
    }

    update(){
        
    }
    
}