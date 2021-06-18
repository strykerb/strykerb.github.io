// Protype Scene for testing feasibility of the project

class Ending extends Phaser.Scene {
    
    constructor() {
        super("endingScene");

        this.LETTER_TIMER = 10;		// # ms each letter takes to "type" onscreen
        this.NEXT_TEXT = '[ENTER]';	// text to display for next prompt
        this.NEXT_X = 1125;			// next text prompt x-position
        this.NEXT_Y = 675;			// next text prompt y-position
        this.dialogIndex = 0;
    }

    preload() {
        
    }
     
    create() {
        this.Dialogue = [
            {text: "As you emerge from the portal, you find yourself back at the Magnet Rail station, just before the incident occurred."},
            {text: "You watch your past self walk away from your girlfriend, then break into a sprint towards her."},
            {text: "You see each other, pause, and then embrace."},
            {text: "You activate your time warp, vanishing the both of you into thin air."},
            {text: "The time warp causes a near-by generator to explode."},
            {text: "Your past self runs back to where your girlfriend was, but sees nothing but smoke and flames. They pick up the broken glasses."}
        ];

        this.images = [];
        this.images.push(this.add.image(game.config.width/2, game.config.height/2, 'intro1').setOrigin(0.5, 0.5));
        this.images.forEach(image => {
            image.scaleX = 0.66667;
            image.scaleY = 0.66667;
            // image.alpha = 0;
        });

        this.textBox = this.add.image(game.config.width/2, game.config.height-50, 'particle').setOrigin(0.5, 0.5);
        this.textBox.scaleX = 256;
        this.textBox.scaleY = 20;
        this.textBox.tint = 0x000000;
        this.textBox.alpha = 0.5;
        
        keyENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        
        this.cameras.main.setBackgroundColor('#000000'); 

        this.dialogueConfig = {
            fontFamily: 'cyberfunk',
            fontSize: '40px',
            color: '#faf5c8',
            align: 'left', 
            wordWrap: { width: 1000, useAdvancedWrap: true }
        }

        this.endConfig = {
            fontFamily: 'cyberfunk',
            fontSize: '90px',
            color: '#faf5c8',
            align: 'left', 
            wordWrap: { width: 750, useAdvancedWrap: true }
        }

        this.currDialogue = this.add.text(0 , 0, "", this.dialogueConfig).setOrigin(0, 0);
        this.engageDialogue(0);
    }
     
    update(time, delta) {
        
        if(keyENTER.isDown && !this.dialogTyping) {
            // trigger dialog
            this.engageDialogue(++this.dialogIndex);
        }
        
    }

    engageDialogue(idx){
        let x = 100;
        let y = game.config.height-90;
        this.dialogTyping = true;
        this.currDialogue.text = "";
        if (this.nextText){
            this.nextText.destroy();
        }
        if (idx >= this.Dialogue.length){
            this.currDialogue.text = "";
            this.textBox.alpha = 0;
            progress = 0;
            this.ending = this.add.text(game.config.width/2 , game.config.height/2, "THE END", this.endConfig).setOrigin(0.5, 0.5);
            this.clock = this.time.delayedCall(5000, () => {
                this.scene.start("mainMenuScene");
            }, null, this);
            return;
        }
        
        this.currDialogue.x = x;
        this.currDialogue.y = y;
        let currentChar = 0; 
        this.textTimer = this.time.addEvent({
            delay: this.LETTER_TIMER,
            repeat: this.Dialogue[idx]['text'].length - 1,
            callback: () => { 
                // concatenate next letter from dialogLines
                this.currDialogue.text += this.Dialogue[idx]['text'][currentChar];
                // advance character position
                currentChar++;
                // check if timer has exhausted its repeats 
                // (necessary since Phaser 3 no longer seems to have an onComplete event)
                if(this.textTimer.getRepeatCount() == 0) {
                    // show prompt for more text
                    this.nextText = this.add.text(this.NEXT_X, this.NEXT_Y, this.NEXT_TEXT, this.dialogueConfig).setOrigin(0, 0).setDepth(4);
                    // un-lock input
                    this.dialogTyping = false;

                    // destroy timer
                    this.textTimer.destroy();
                }
            },
            callbackScope: this // keep Scene context
        });
    }

}
