title = "LAYERS";


description = `
Click to make a sound.
Your sounds will loop.
Use loops to make a song.
`;

characters = [`
  yy  
 yYYy 
yYyyYy
yYyyYy
 YyyY
  yy
`,`
B P pb
 pbp  
B pbp 
bpbp P
pbp   
BpbB B
`,`
  lL 
 LLlL
 lLLL
  yr
 rYly
  Ly
`,`
  rr
 r rr
rrrr rr
  YlYl
  YYYY
`,`
R    r
 r  R 
  Rr
 R  r
r    R
`,`
  ll
  ll l
llllll
l ll
  l ll
 ll  l
`,`
gG  Gg
 gGGg
G gg G
gG  Gg
 gGGg
  gg
`];

options = {
  viewSize: { x: 200, y: 100 },
  isPlayingBgm: true,
  seed: rndi(100),
  isCapturing: true,
  isCapturingGameCanvasOnly: true,
  captureCanvasScale: 2
};
 // ticks % LOOP_LENGTH  40%480  480%480 = 1st of the loop 640 % 480
const S = {
  LOOP_LENGTH: 480,    //480 ticks = 8seconds
  HOLD_BUTTON_THRESHOLD: 100,
  V_OFFSET: 12.5
}
 
 /**
  * @type { SoundEffectType[] }
  */
let sounds = [ "hit", "explosion", "coin", "laser",  "powerUp",  "jump", "select"];
let colors = [ "black", "purple", "yellow", "green"];
let charArray = ["e", "c", "a", "d", "b", "f", "g"];
/**
 * @typedef {{
  * inputs: number[]
  * }} Layer
  */

/**
  * @type { Layer[] }
  */
let layers;
let timer = S.LOOP_LENGTH;
let angle = 0;
let sequencerLength = 0;
let direction = 0.08;
let patterns = [];
let lineCount = [];
let lineHeight = 100;
let barLength = 0;
let numberOfLayers = 0;
let barList = [];
let timeStamp = 0;
let songComplete = false;


let descriptionA = [
  "chilly",
  "frigid",
  "frosty",
  "refreshing",
  "air-conditioned",
  "arctic",
  "chilling",
  "refrigerated",
  "cold",
  "sick",
]

let descriptionB = [
  "anthem",
  "ballad",
  "chant",
  "chorus",
  "hymn",
  "lullaby",
  "melody",
  "piece",
  "shanty",
  "tune",
  "verse",
  "beat",
]


let currLayer = 0;
let buttonDuration = 0;

function update() {

  if (!ticks) {
    Initialize();
  }
  
  barLength += 0.8334;

  if(barLength >= 400){
    barLength = 0;
  }

  if(sequencerLength == 0 && numberOfLayers < 7){
      console.log("layer ", numberOfLayers);
      numberOfLayers++;
      const posY = numberOfLayers * S.V_OFFSET;   //1
      barList.push({
        pos: vec(0, posY)
      });  //each loop, push a moving progress bar to the barList
      sequencerLength = 480;
  }

  sequencerLength--;  //counting layers
  
  //this will descend the list of object being drawn
  barList.forEach((b)=>{
    color("black");
    bar(0 ,b.pos.y, barLength, 1, 0);
  });

  if(input.isJustPressed){
    addKeyStrokeToLayer(barLength, numberOfLayers);
    play(sounds[currLayer]);
  }

  //this is where to draw the sprite, for each numberOfLayers
  patterns.forEach((p) => {
    color("black");
    char(charArray[p.n], p.pos);
    //this condition determine how the
    if(barLength / 2 === p.pos.x){
      console.log("barlength match!");
      // @ts-ignore
      color(colors[rndi(0,3)]);
      particle(p.pos);
    }
  });

  angle += direction;

  if (input.isPressed){
    buttonDuration++;
  } else {
    buttonDuration = 0;
  }

  // Quit game if player holds the button
  if (buttonDuration >= S.HOLD_BUTTON_THRESHOLD){
    buttonDuration = 0;
    // Randomize game over text
    end("What a " + descriptionA[rndi(descriptionA.length)] + " " + descriptionB[rndi(descriptionB.length)] + "!");
  }

  // Move to next layer if current loop is finished
  if (floor(ticks/S.LOOP_LENGTH) > currLayer){
    if (currLayer >= sounds.length){
      CompleteSong();
    } else {
      currLayer++;
      console.log("Layer " + currLayer);
    }
  }

  color("black");
  //draw the progress bar
  
  // Play previous sounds from this time stamp
  CheckPrevLayers();

  if (songComplete){
    color("red");
    rect(0, 30, 200, 30)
    color("black");
    text("Hold button to exit", 50, 40);
  }

}

function addKeyStrokeToLayer(barLength, numberOfLayers){

  layers[currLayer].inputs.push(ticks % S.LOOP_LENGTH);
  
  //insert your visual code here
  
  timeStamp = ticks % S.LOOP_LENGTH;
  
  const posX = barLength / 2;
  const posY = numberOfLayers * S.V_OFFSET;
  
  patterns.push({
    pos: vec(posX, posY),
    n: numberOfLayers - 1
  });

  direction = rnd(0.16, -0.16);
  direction *= -1;
}

function CheckPrevLayers(){
  
  let i;
  let timeStamp = ticks % S.LOOP_LENGTH;

  for(i = 0; i < layers.length; i++){
    if (layers[i].inputs[0] == timeStamp){  //when the sound is to be played
      play(sounds[i]);
      direction *= -1;
      layers[i].inputs.push(layers[i].inputs.shift());
    }
  }
}


function CompleteSong(){
  // TO-DO: Stop taking input once we reach this point
  // TO-DO: Add text saying to hold button to quit
  
  songComplete = true;
  //console.log("song done");
}

function Initialize(){
  console.log(options.seed);
  
  // Initialize 2D Array of timestamps
  layers = times(sounds.length, () => {
    return {
        inputs: []
    };
  });
  console.log(layers);
}

function DrawAndStay(){
    color("yellow");
    bar(50, 50, 10, 3, angle);
    angle++;    
}