// Future Clone Prefab

class FutureClone extends Phaser.GameObjects.Sprite {
    // Variable that stores previous player actions
    
    constructor(scene, x, y, texture, frame){
        super(scene, x, y, texture, frame);

        // add obejct to the existing scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.createAnims();
        scene.physics.add.collider(this, groundLayer, function(_self, _ground){
            if (_self.falling){
                console.log("collision");
                _self.landing = true;
                _self.falling = false;
            }
        });
        // this.body.setImmovable(true);
        this.setOrigin(0.5, 0);
        
        this.tint = 0x52f6ff;
        // this.tint = 0xc382ff;
        this.flipX= true;
        this.falling = true;
        this.anims.play("fall");

    }

    update(){
        if (this.landing){
            console.log("land");
            this.anims.play("land");
            this.landing = false;
        }
    }

    jump(){
        this.anims.play("jump");
        this.body.setVelocityY(-1500);
        if (this.scene.futureEmitter){
            this.scene.futureEmitter.pause();
            this.scene.futureEmitter.killAll();
        }
    }

    createAnims(){
        // Setup Walk Animation
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNames('player', { prefix: 'run', start: 1, end: 12 }),
            frameRate: 30,
            //repeat: -1
        });
        // idle with only one frame, so repeat is not neaded
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('player', { prefix: 'idle', start: 1, end: 6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNames('player', { prefix: 'jump', start: 1, end: 7 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'fall',
            frames: this.anims.generateFrameNames('player', { prefix: 'fall', start: 1, end: 3 }),
            frameRate: 5,
        });
        this.anims.create({
            key: 'land',
            frames: this.anims.generateFrameNames('player', { prefix: 'land', start: 1, end: 5 }),
            frameRate: 30
        });

        this.on('animationcomplete', this.animComplete, this);

    }

    animComplete(animation, frame)
    {
        if (animation.key == "land"){
            this.landing = false;
            this.anims.play("idle");
        }
    }

    setupEmitter(){
        // create line for particle emitter source
        
        this.scene.futureEmitter = this.scene.particleManager.createEmitter({
            x: this.x - 100,
            y: this.y + 64,
            gravityY: -100,
            lifespan: { min: 500, max: 1000, steps: 1000 },
            scale: { start: 1, end: 0.1 },
            tint: [ 0x00ffff, 0x0000ff ],
            angle: { min: 0, max: 360 },
        });
    }


    
}
