class Enemy extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setOrigin(0.5, 1);
        this.body.allowGravity = false;
        this.body.setSize(48, 48, 16, 0);
        
        const enterPlatePlayer = (_this, _player) => {
            _player.scene.scene.restart();    // restart current scene
        };

        scene.physics.add.overlap(
            this, 
            scene.player,
            enterPlatePlayer,
            null,
            this
        );


    }
}