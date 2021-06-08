var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 980},
            debug: false,
            tileBias: 70,
            overlapBias: 8,
        },
        
    },
    pixelArt: true,
    roundPixels: true,
    scene: [MainMenu ,Menu, Lab, Level1, Level2, Level3, Level4, Level5, Credits],
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
let keyLEFT, keyRIGHT, keyUP, keySPACE, keyENTER;
var groundLayer, coinLayer, bgLayer;
var text;
var winbox;
var win;
var labDoor;
var progress;
var soundEffects = {};

function loadFont(name, url) {
    var newFont = new FontFace(name, `url(${url})`);
    newFont.load().then(function (loaded) {
        document.fonts.add(loaded);
    }).catch(function (error) {
        return error;
    });
}

function enterButtonHoverState(button) {
    button.scaleX = 1.5;
    button.scaleY = 1.5;
  }

function enterButtonRestState(button) {
    button.scaleX = 1;
    button.scaleY = 1;
}