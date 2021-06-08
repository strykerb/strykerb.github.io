class Enemy extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y, texture, frame, index) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setOrigin(0.5, 1);
        this.body.allowGravity = false;
        this.body.setSize(48, 48, 16, 0);
        this.body.setVelocity(-100, 0).setBounce(1).setCollideWorldBounds(true);

        this.idx = index;
        this.initialY = y;

        this.jsonObj = [];
        this.past_pos = [];
        
        const enterPlatePlayer = (_this, _player) => {
            _player.kill();
            this.clock = this.scene.time.delayedCall(1000, () => {
                _player.scene.scene.restart();    // restart current scene
            }, null, this);
        };

        scene.physics.add.overlap(
            this, 
            scene.player,
            enterPlatePlayer,
            null,
            this
        );

        scene.doors.forEach(door => {
            scene.physics.add.collider(door, this);
        });

        this.createAnims();
        this.anims.play("walk");

        scene.enemyEmitters.push(this.scene.particleManager.createEmitter({
            x: x,
            y: y-60,
            angle: { min: 180, max: 360 }, // try adding steps: 1000 👍
            speed: { min: 50, max: 200, steps: 5000 },
            frequency: 200,
            gravityY: 980,
            lifespan: 800,
            quantity: 6,
            scale: { start: 0.1, end: 0.5 },
            tint: [ 0xff9000, 0xff0000],
            bounce: { min: 0.5, max: 0.9, steps: 5000 },
            bounds: { x: this.x-1000, y: this.y, w: 2000, h: 0 },
            collideTop: false,
            collideBottom: true,
        }));

    }

    update(){
        
        if (!this.scene.player.teleporting){
            this.addTimeStamp();
        }

        this.scene.enemyEmitters[this.idx].setPosition(this.x, this.y - 50);

        if (this.body.velocity["x"] < 0){
            this.flipX = true; 
        } else {
            this.flipX = false;
        }
        if (this.body.velocity["y"] != 0){
            this.body.setVelocityY(0);
        }
        if (this.y != this.initialY){
            this.y = this.initialY;
        }
    }

    addTimeStamp(){
        let item = {};
        item ["x"] = this.x;
        item ["forwards"] = this.body.velocity["x"] > 0;
        
        // If we are exceeding the maximum recorded actions, remove the first elem of jsonObj
        if (this.jsonObj.push(item) >= this.scene.player.TIME_JUMP){
            this.past_pos = this.jsonObj.shift();
        } else {
            this.past_pos = this.jsonObj[0];
        }
    }

    revert(){
        let tween = this.scene.tweens.add({
            targets: this,
            x: { from: this.x, to: this.past_pos["x"] },
            ease: Phaser.Math.Easing.Quadratic.InOut,       // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: this.scene.player.TELEPORT_TIME,
            repeat: 0,            // -1: infinity
            yoyo: false
        });
        if (this.past_pos['forwards']){
            this.body.setVelocity(100, 0);
        } else {
            this.body.setVelocity(-100, 0);
        }
        
        this.jsonObj = [];
    }

    createAnims(){
        // Setup Walk Animation
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('enemy', { prefix: 'walk', start: 1, end: 7 }),
            frameRate: 8,
            repeat: -1
        });
    }
}