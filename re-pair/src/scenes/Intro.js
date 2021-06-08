// Protype Scene for testing feasibility of the project

class Intro extends Phaser.Scene {
    
    constructor() {
        super("introScene");

        this.LETTER_TIMER = 10;		// # ms each letter takes to "type" onscreen
        this.NEXT_TEXT = '[ENTER]';	// text to display for next prompt
        this.NEXT_X = 1000;			// next text prompt x-position
        this.NEXT_Y = 600;			// next text prompt y-position
        this.dialogIndex = 0;
    }

    preload() {
        
    }
     
    create() {
        this.Dialogue = [
            {text: "You and your girlfriend are sitting together at the Magnet Rail station."},
            {text: "You stand up to go to a vending machine, and hear an explosion combined with some strange high frequency sound."},
            {text: "You run back to where your girlfriend was sitting, but you see nothing but smoke and flames."},
            {text: "You pick up her broken glasses from the ground."},
            {text: "5 Years Go By........"},
            {text: "You still have your girlfriend's broken glasses on your work desk. You haven't repaired them."},
            {text: "Instead, you've been developing a giant portal. And you've finally finished it."}
        ];
        
        
        keyENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        
        this.cameras.main.setBackgroundColor('#000000'); 

        this.dialogueConfig = {
            fontFamily: 'cyberfunk',
            fontSize: '30px',
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
        let y = 300;
        this.dialogTyping = true;
        this.currDialogue.text = "";
        if (this.nextText){
            this.nextText.destroy();
        }
        if (idx >= this.Dialogue.length){
            this.currDialogue.text = "";
            progress = 0;
            this.scene.start("lab");
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
