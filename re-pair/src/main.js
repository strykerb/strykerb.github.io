var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 980},
            debug: false
        }
        //debug: true
    },
    scene: [Menu, Level1, Level2],
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
var groundLayer, coinLayer;
var text;
var winbox;
var win;
var labDoor;

function enterButtonHoverState(button) {
    button.setStyle({ color: '#525e4a'});
  }

function enterButtonRestState(button) {
    button.setStyle({ color: '#faf5c8' });
}