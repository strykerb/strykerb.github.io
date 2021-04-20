// Enemy Spaceship prefab

class Spaceship extends Phaser.GameObjects.Sprite {
    constructor (scene, x, y, texture, frame, pointValue){
        super(scene, x, y, texture, frame);
        scene.add.existing(this);       // add to existing scene
        this.points = pointValue;       // store pointValue
        this.moveSpeed = game.settings.spaceshipSpeed;        // pixels per frame
    }

    update () {
        // move spaceship left
        this.x -= this.moveSpeed;

        // wrap if at the edge of the screen
        if (this.x <= 0 - this.width){
            this.reset();
        }
    }

    // reset spaceship position
    reset(){
        this.x = game.config.width;
    }
}