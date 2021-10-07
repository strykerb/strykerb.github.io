title = "AVALANCHE";

description = `
avoid the

stones.
`;

characters = [
`
 yy
 yy
CCC
CCC
CCC
L L
`,`
 bb
bbbb
 bb
`
];

const G = {
	WIDTH: 60,
  HEIGHT: 150,
  JUMP_HEIGHT: 1,
  JUMP_DURATION: 25,
  BLOCK_SIZE: 12,
  MOVE_SPEED: 1,
  ROCK_SPEED: 1,
  ROCK_SPAWN_START: 100,
  MAX_SPAWN_RATE: 70,
  GEM_SPAWN_RATE: 400,
  SCROLL_AMOUNT: 5,
  DIFFICULTY_MULT: 0.35,
}

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  seed: 19,
  //seed: rndi(1, 20),
  isPlayingBgm: true,
  isReplayEnabled: true,
  theme: "shapeDark",
  // isCapturing: true,
  // isCapturingGameCanvasOnly: true,
};

/**
 * @typedef {{
  * pos: Vector,
  * isJumping: boolean
  * jumpTick: number
  * }} Player
  */
 
 /**
  * @type { Player }
  */
 let player;

 /**
 * @typedef {{
  * pos: Vector
  * }} Rock
  */
 
 /**
  * @type { Rock[] }
  */
 let fRocks;
 
 /**
  * @type { Rock[] }
  */
 let gRocks;

 /**
* @typedef { object } bRock - A decorative floating object in the background
* @property { Vector } pos - The current position of the object
* @property { number } speed - The downwards floating speed of this object
*/

/**
* @type  { bRock [] }
*/
let backgroundRocksSmall;
let backgroundRocksLarge;

 let rockTimer;
 let rockSpawn;
 let spawnCount;
 let moveFlag;
 let gem;
 let gemTextCount;
 let gemTextPos;

function update() {
  if (!ticks) {
    Initialize();
  }

  if (ticks % rockSpawn == 0){
    const posX = rndi(0, G.WIDTH/G.BLOCK_SIZE) * G.BLOCK_SIZE + G.BLOCK_SIZE*0.5;
    fRocks.push({
      pos: vec(posX, 0),
    });
    if (rockSpawn > G.MAX_SPAWN_RATE){
      rockSpawn -= 1;
    }
    spawnCount++;
    if (spawnCount == G.SCROLL_AMOUNT){
      spawnCount = 0;
      gRocks.forEach(rock => {
        rock.pos.y += G.BLOCK_SIZE;
      });
      
  
      remove(gRocks, (rock) => {
        return (rock.pos.y > G.HEIGHT-G.BLOCK_SIZE);
      });
    }
  }

  if (ticks % G.GEM_SPAWN_RATE == 0){
    const posX = rnd(0, G.WIDTH);
    gem = {pos: vec(posX, 0)};
  }

  color ("black");
  box(G.WIDTH*0.5, G.HEIGHT-G.BLOCK_SIZE*0.5, G.WIDTH, G.BLOCK_SIZE);
  gRocks.forEach(rock => {
    box(rock.pos, G.BLOCK_SIZE);
  });
  
  color ("red");
  remove(fRocks, (rock) => {
    rock.pos.y += G.ROCK_SPEED + G.DIFFICULTY_MULT * difficulty;
    const isColliding = box(rock.pos, G.BLOCK_SIZE, ).isColliding.rect.black;

    if (isColliding){
      let height = Math.floor((G.HEIGHT - rock.pos.y)/G.BLOCK_SIZE)
      rock.pos.y = G.HEIGHT - (height+0.5) * G.BLOCK_SIZE;
      gRocks.push(rock);
      particle(rock.pos.x, rock.pos.y + G.BLOCK_SIZE*0.5, 15, 5, -PI/2, PI);
      play("explosion");
      addScore(10);
    }
    
    return (isColliding);
  });

  color ("black");
  
  if (!player.isJumping){
    if (input.isJustPressed){
      play("jump");
      player.jumpTick = 0;
      player.isJumping = true;
      player.pos.y -= 1;
    }
    
  }

  player.pos = CalcPosition();
  player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
  color ("black");
  if (char("a", player.pos).isColliding.rect.red){
    end();
  }

  if (gem){
    gem.pos.y += 1;
    if (char("b", gem.pos).isColliding.char.a){
      gemTextPos = vec(gem.pos.x-10, gem.pos.y-10);
      gemTextPos.clamp(2, G.WIDTH-21, 20, G.HEIGHT-20);
      gem = null;
      addScore(100);
      gemTextCount = 30;
      play("coin");
    }
    if (gem.pos.y > G.HEIGHT){
      gem = null;
    }
  }

  if(gemTextCount > 0){
    text("+100", gemTextPos, {color: "blue"});
    gemTextCount--;
  } 

  
  backgroundRocksLarge.forEach((s) => {
    // Move the star downwards
    s.pos.y += s.speed;
    // Bring the star back to top once it's past the bottom of the screen
    s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

    // Choose a color to draw
    color("light_red");
    // Draw the star as a square of size 1
    box(s.pos, 2);
  });
  

  backgroundRocksSmall.forEach((s) => {
    // Move the star downwards
    s.pos.y += s.speed;
    // Bring the star back to top once it's past the bottom of the screen
    s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

    // Choose a color to draw
    color("light_black");
    // Draw the star as a square of size 1
    box(s.pos, 1);
  });
  color ("black");

}

function CalcPosition(){
  color ("transparent");
  var posX = player.pos.x;
  var posY = player.pos.y;

  // X position
  if (input.isPressed){
    if (input.pos.x > posX + 1){
      if (!box(posX+3, posY-1, 1, 6).isColliding.rect.black){
        posX += G.MOVE_SPEED;
      }
    } else if (input.pos.x < posX - 1){
      if (!box(posX-1, posY-1, 1, 6).isColliding.rect.black){
        
        posX -= G.MOVE_SPEED;
      }
    } 
  }
  // Y position
  if (char("a", player.pos).isColliding.rect.black){
      player.isJumping = false;
      player.jumpTick = G.JUMP_DURATION;
  } else {
    player.isJumping = true;
    if (!input.isPressed) {
      player.jumpTick = G.JUMP_DURATION+1;
    } else {
      player.jumpTick++;
    }
    if (player.jumpTick > G.JUMP_DURATION){
      // Check horizontal block
      posY += G.JUMP_HEIGHT;
      
    } else {
      posY -= G.JUMP_HEIGHT;
    }
  }
  

  return vec(posX, posY);
}

function Initialize(){
  gRocks = [];
  fRocks = [];
  backgroundRocksSmall = [];
  backgroundRocksLarge = [];
  rockSpawn = G.ROCK_SPAWN_START;
  spawnCount = 0;
  gemTextCount = 0;
  
  player = {
    pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.8),
    isJumping: true,
    jumpTick: G.JUMP_DURATION
  };

  backgroundRocksLarge = times(5, () => {
    // Random number generator function
    // rnd( min, max )
    const posX = rnd(0, G.WIDTH);
    const posY = rnd(0, G.HEIGHT);
    // An object of type Star with appropriate properties
    return {
      // Creates a Vector
        pos: vec(posX, posY),
        // More RNG
        speed: rnd(0.5, 1.0)
    };
  });
  backgroundRocksSmall = times(5, () => {
    // Random number generator function
    // rnd( min, max )
    const posX = rnd(0, G.WIDTH);
    const posY = rnd(0, G.HEIGHT);
    // An object of type Star with appropriate properties
    return {
      // Creates a Vector
        pos: vec(posX, posY),
        // More RNG
        speed: rnd(1.0, 1.5)
    };
  });

  console.log(options.seed);
}
