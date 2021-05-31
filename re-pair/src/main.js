var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 980},
            debug: false,
            TILE_BIAS: 70
        },
        
    },
    pixelArt: true,
    roundPixels: true,
    scene: [Menu, Level1, Level2, Level3, Level4, Level5],
    fps: {
        target: 60,
        forceSetTimeOut: true
    },
};
 
var game = new Phaser.Game(config);
//game.scene.start("Prototype");

var map;
var player;
var cursors;
let keyLEFT, keyRIGHT, keyUP, keySPACE;
var groundLayer, coinLayer, bgLayer;
var text;
var winbox;
var win;
var labDoor;
var progress;

function enterButtonHoverState(index) {
    game.scene.scenes[0].levels[index].scaleX = 1.5;
    game.scene.scenes[0].levels[index].scaleY = 1.5;
  }

function enterButtonRestState(index) {
    game.scene.scenes[0].levels[index].scaleX = 1;
    game.scene.scenes[0].levels[index].scaleY = 1;
}