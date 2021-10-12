title = "RINGOUT";

description = `
[Tap] Punch
[Hold] Block
`;

characters = [
`
   ll
   ll
 llrrr
l b   
 b b
b  b
`,
`
  ll
l ll
llcc
 b  c
b b
b  b
`,
`
  ll
  ll
lll
l bLL
 b b
 b  b
`,
`
ll L
llL
 ll bb
l  b
l   b
   b
`,
`
  rr
  rr
  
  bb
  
  bb
`,
`
 ll
 ll
rrrll
   p l
  p p
  p  p
`,
`
  ll  
  ll l
  ccll
 c  p
   p p
  p  p
`,
`
  ll
  ll
   lll
 LLp l
  p p
 p  p
`,
`
  L ll
   Lll
pp ll
  p  l
 p   l
  p
`,
//char j
`
  ll
  ll
 ll
l bL
l bbL
 b b
`,
//char k
`
  ll
  ll
   ll
  Lp l
 Lpp l
  p p`
];

options = {
  viewSize: { x: 80, y: 50 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 18,
};

const S = {
  BLOCK_PRESS_THRESHOLD: 10,
  PUNCH_DURATION: 15,
  BLOCKED_FLINCH_DURATION: 1,
  PUNCHED_FLINCH_DURATION: 10,
  FLINCH_MOVE_SPEED: 1,
  BLOCK_MOVE_DISTANCE: 1,
  PUNCH_MOVE_DISTANCE: 2,
  WALK_SPEED: 0.1,
  LEFT_BOUND: 14,
  RIGHT_BOUND: 64,
  PUNCH_COOLDOWN: 15,
}

const AI = {
  PUNCH_WEIGHT: 2,
  BLOCK_WEIGHT: 1,
  BLOCK_MIN_TIME: 10,
  BLOCK_MAX_TIME: 60,
  IDLE_MIN_TIME: 10,
  IDLE_MAX_TIME: 30,
  FIGHT_DISTANCE: 8,
}

/**
 * @typedef {{
  * pos: Vector,
  * anims: string[],
  * currAnim: number,
  * animTimer: number
  * state: string
  * moveDir: number
  * }} Fighter
  */
 
 /**
  * @type { Fighter }
  */
 let player;

 /**
  * @type { Fighter }
  */
 let enemy;

 /**
  * @type { Fighter }
  */
 let currFighter;

let ex;
let enemyTimer;
let leftGoalPos;
let rightGoalPos;
let px;
let playerStep;
let enemyStep;
let playerSpawn;
let enemySpawn;

let currAnim = "c";
let animTimer;
let pState;
let respawns;

let pressDuration;

function update() {
  if (!ticks) {
    Initialize();
    
  }
  color("light_black");
  rect(leftGoalPos.x, 36, rightGoalPos.x - leftGoalPos.x +2, 20);
  color("black");
  char("e", leftGoalPos);
  char("e", rightGoalPos);

  currFighter = enemy;
  MoveEnemy();
  /**if((enemy.currAnim == 2) && (enemyStep > 15))**/ char(enemy.anims[enemy.currAnim], enemy.pos);
  //else if (enemy.currAnim == 2) char("k", enemy.pos);

  currFighter = player;
  MovePlayer();
  let collision = char(player.anims[player.currAnim], player.pos);
  //if((player.currAnim == 2) && (playerStep < 15)) collision = char(player.anims[player.currAnim], player.pos);
  //else if(player.currAnim == 2) collision = char("k", player.pos)
  
  if (collision.isColliding.char.g){
    player.state = pMachine.transition('punch', 'isblocked');
    enemy.pos.x += S.BLOCKED_FLINCH_DURATION;
  }
  else if (collision.isColliding.char.h){
    if (player.state == 'punch'){
      currFighter = enemy;
      enemy.state = eMachine.transition('idle', 'startflinch');
      currFighter = player;
    }
  }
  else if (collision.isColliding.char.f){
    if (player.state == 'idle'){
      player.state = pMachine.transition('idle', 'startflinch');
    } else {
      currFighter = enemy;
      enemy.state = eMachine.transition('punch', 'isblocked');
    }
    if (player.state == 'punch'){
      currFighter = player;
      player.state = pMachine.transition('punch', 'isblocked');
    } else if (player.state == 'block'){

    }
  }

  if(player.pos.x < leftGoalPos.x + 4){
    play("lucky");
    end();
  }

  // Player kills enemy
  if(enemy.pos.x > rightGoalPos.x){
    addScore(100);
    play("coin");
    color("red");
    particle(rightGoalPos.x, rightGoalPos.y-2, 16, 1.5, 0, 2*PI);
    color("black");
    
    
    if (respawns <= 10){
      respawns++;
      enemySpawn -= 1;
      playerSpawn += 1;
      
      leftGoalPos.x += 1;
      rightGoalPos.x -= 1;
    }

    enemy.pos.x = enemySpawn;
    player.pos.x = playerSpawn;
  }
}

function Initialize(){
  playerSpawn = 20;
  enemySpawn = 58;
  player = {
    pos: vec(playerSpawn, 33),
    anims: ["a", "b", "c", "d", "j"],
    currAnim: 2,
    animTimer: 0,
    state: "idle",
    moveDir: 1,
  };
  currFighter = player;
  player.state = pMachine.value;

  enemy = {
    pos: vec(enemySpawn, 33),
    anims: ["f", "g", "h", "i", "k"],
    currAnim: 2,
    animTimer: 0,
    state: "idle",
    moveDir: -1,
  };
  currFighter = enemy;
  enemy.state = eMachine.value;

  playerStep = 15;
  enemyStep = 15;

  respawns = 0;
  
  leftGoalPos = vec(S.LEFT_BOUND, 32);
  rightGoalPos = vec(S.RIGHT_BOUND-2, 32);
  enemyTimer = 0;


  //pState = machine.value
  //console.log(`current state: ${pState}`)
  //pState = machine.transition(pState, 'startblock')
  //console.log(`current state: ${pState}`)
  //pState = machine.transition(pState, 'stoppunch')
  //console.log(`current state: ${pState}`)
}

function MovePlayer(){
  player.animTimer--;
  
  // disable all input if mid-punch
  if (player.state == 'punch'){
    //player.animTimer--;
    if (player.animTimer<= 0){
      player.state = pMachine.transition(player.state, 'startidle');
      player.animTimer = S.PUNCH_COOLDOWN;
    }
    return;
  }

  // disable input if player is flinching
  if (player.state == 'flinch'){
    //player.animTimer--;
    player.pos.x -= S.FLINCH_MOVE_SPEED;
    if (player.animTimer<= 0){
      player.state = pMachine.transition(player.state, 'startidle');
    }
    return;
  }

  if (player.state == 'idle'){
    playerStep--;
    if(playerStep <= 0){
      //player.currAnim = 9;
      playerStep = 15;
    }
    color("transparent");
    let coll = box(player.pos.x + 3, player.pos.y, 1);
    if (!(coll.isColliding.char.f || coll.isColliding.char.g || coll.isColliding.char.h)){
      player.pos.x += S.WALK_SPEED;
    }
    color("black");
  }

  // Reset press duration upon button press
  if (input.isJustPressed){
    pressDuration = 0;
  } 
  
  // Decide whether the button press is a punch or a block
  if (input.isPressed){
    pressDuration++;
    if (player.state == "idle" && pressDuration > S.BLOCK_PRESS_THRESHOLD){
      player.state = pMachine.transition(player.state, 'startblock');
    }
  }

  // Decide whether the button release should start a punch
  // or should stop blocking
  if (input.isJustReleased){
    if (pressDuration <= S.BLOCK_PRESS_THRESHOLD){
      if (player.animTimer <= 0){
        player.state = pMachine.transition(player.state, 'startpunch');
      }
    }
    else if (player.state == 'block'){
      player.state = pMachine.transition(player.state, 'startidle');
    } 
    pressDuration = 0;
  }
}


function MoveEnemy(){
  // TO-DO: Add enemy AI

  if (enemy.state == 'punch'){
    enemy.animTimer--;
    if (enemy.animTimer<= 0){
      enemy.state = eMachine.transition(enemy.state, 'startidle');
    }
    return;
  }

  // disable input if player is flinching
  if (enemy.state == 'flinch'){
    enemy.animTimer--;
    enemy.pos.x += S.FLINCH_MOVE_SPEED;
    if (enemy.animTimer<= 0){
      enemy.state = eMachine.transition(enemy.state, 'startidle');
    }
    return;
  }

  if (enemy.pos.x-player.pos.x > AI.FIGHT_DISTANCE){
    if (enemy.state != 'idle'){
      enemy.state = eMachine.transition(enemy.state, 'startidle');
    }
    
  }

  if (enemy.state == 'idle'){
    enemyStep--;
    if(enemyStep <= 0){
      //enemy.currAnim = 10;
      enemyStep = 15;
    }
    color("transparent");
    let coll = box(enemy.pos.x - 2, enemy.pos.y, 2, 3);
    if (!(coll.isColliding.char.a || coll.isColliding.char.b || coll.isColliding.char.c)){
      enemy.pos.x -= S.WALK_SPEED;
    }
    color("black");
  }

  enemyTimer--;

  if (enemyTimer <= 0){
    if (enemy.state != 'idle'){
      enemy.state = eMachine.transition(enemy.state, 'startidle');
      enemyTimer = rndi(AI.IDLE_MIN_TIME, AI.IDLE_MAX_TIME);
    }
    else {
      let rand = rndi(0, AI.PUNCH_WEIGHT + AI.BLOCK_WEIGHT);
      if (rand < AI.PUNCH_WEIGHT){
        enemy.state = eMachine.transition('idle', 'startpunch');
        enemyTimer = S.PUNCH_DURATION;
      } else {
        enemy.state = eMachine.transition('idle', 'startblock');
        enemyTimer = rndi(AI.BLOCK_MIN_TIME, AI.BLOCK_MAX_TIME)
      }
    }
  }

    
  


  //console.log(enemy.state);
  //if (enemy.state == "idle") enemy.state = eMachine.transition(enemy.state, 'startblock');
  return;

}

function createMachine(stateMachineDefinition) {
  const machine = {
    value: stateMachineDefinition.initialState,
    transition(currentState, event) {
      const currentStateDefinition = stateMachineDefinition[currentState]
      const destinationTransition = currentStateDefinition.transitions[event]
      if (!destinationTransition) {
        return 
      }
      const destinationState = destinationTransition.target
      const destinationStateDefinition =
        stateMachineDefinition[destinationState]

      destinationTransition.action()
      currentStateDefinition.actions.onExit()
      destinationStateDefinition.actions.onEnter()

      machine.value = destinationState

      return machine.value
    },
  }
  return machine
}


// FSM Setup: Creating states, transitions, and actions
// actions: onEnter() called when a state is entered
//          onExit() called when a state is exited
//          transition actions can be unique for each transition. 
//
// FSM will update whoever the currFighter variable is 
// set to, enabling multi-character management.


const pMachine = createMachine({
  initialState: 'idle',
  idle: {
    actions: {
      onEnter() {
        playerStep = 15;
        currFighter.currAnim = 2;
        //currAnim = "c";
        //console.log('idle: onEnter')
      },
      onExit() {
        // console.log('idle: onExit')
      },
    },
    transitions: {
      startpunch: {
        target: 'punch',
        action() {
          currFighter.animTimer = S.PUNCH_DURATION;
          // console.log('transition action for "startpunch" from idle')
        },
      },
      startblock: {
        target: 'block',
        action() {
          
          //currAnim = "b";
          // console.log('transition action for "startblock" from idle')
        },
      },
      startflinch: {
        target: 'flinch',
        action() {
          addScore(-10);
          currFighter.animTimer = S.PUNCHED_FLINCH_DURATION;
          color("red");
          particle(player.pos.x, player.pos.y-2, 4, 1.5, PI, PI/3);
          color("black");
          play("explosion");
          // console.log('transition action for "startflinch" from idle')
        },
      },
    },
  },
  punch: {
    actions: {
      onEnter() {
        if (enemy.pos.x-player.pos.x > 4){
          currFighter.pos.x++;
        }
        currFighter.currAnim = 0;
        //currFighter.pos.x += S.PUNCH_MOVE_DISTANCE * currFighter.moveDir;
        //currAnim = "a";
        // console.log('punch: onEnter')
      },
      onExit() {
        // console.log('punch: onExit')
      },
    },
    transitions: {
      startidle: {
        target: 'idle',
        action() {
          // console.log('transition action for "stoppunch" from punch')
        },
      },
      isblocked: {
        target: 'flinch',
        action() {
          currFighter.animTimer = S.BLOCKED_FLINCH_DURATION;
          play("select");
          // console.log('transition action for "isblocked" from punch')
        },
      },
    },
  },
  block: {
    actions: {
      onEnter() {
        currFighter.currAnim = 1;
        // console.log('block: onEnter')
      },
      onExit() {
        // console.log('block: onExit')
      },
    },
    transitions: {
      startidle: {
        target: 'idle',
        action() {
          
          // console.log('transition action for "stopblock" from block')
        },
      },
    },
  },
  flinch: {
    actions: {
      onEnter() {
        currFighter.currAnim = 3;
        // console.log('flinch: onEnter')
      },
      onExit() {
        // console.log('flinch: onExit')
      },
    },
    transitions: {
      startidle: {
        target: 'idle',
        action() {
          // console.log('transition action for "stopflinch" from flinch')
        },
      },
    },
  },
})

// Enemy FSM

const eMachine = createMachine({
  initialState: 'idle',
  idle: {
    actions: {
      onEnter() {
        currFighter.currAnim = 2;
        enemyStep = 15;
        //currAnim = "c";
        // console.log('idle: onEnter')
      },
      onExit() {
        // console.log('idle: onExit')
      },
    },
    transitions: {
      startpunch: {
        target: 'punch',
        action() {
          currFighter.animTimer = S.PUNCH_DURATION;
          // console.log('transition action for "startpunch" from idle')
        },
      },
      startblock: {
        target: 'block',
        action() {
          
          //currAnim = "b";
          // console.log('transition action for "startblock" from idle')
        },
      },
      startflinch: {
        target: 'flinch',
        action() {
          currFighter.animTimer = S.PUNCHED_FLINCH_DURATION;
          addScore(10);
          color("red");
          particle(enemy.pos.x+4, enemy.pos.y-2, 4, 1.5, 0, PI/3);
          color("black");
          play("explosion");
          // console.log('transition action for "startflinch" from idle')
        },
      },
    },
  },
  punch: {
    actions: {
      onEnter() {
        if (enemy.pos.x-player.pos.x > 4){
          currFighter.pos.x--;
        }
        currFighter.currAnim = 0;
        //currFighter.pos.x += S.PUNCH_MOVE_DISTANCE * currFighter.moveDir;
        //currAnim = "a";
        // console.log('punch: onEnter')
      },
      onExit() {
        // console.log('punch: onExit')
      },
    },
    transitions: {
      startidle: {
        target: 'idle',
        action() {
          // console.log('transition action for "stoppunch" from punch')
        },
      },
      isblocked: {
        target: 'flinch',
        action() {
          currFighter.animTimer = S.BLOCKED_FLINCH_DURATION;
          play("select");
          // console.log('transition action for "isblocked" from punch')
        },
      },
    },
  },
  block: {
    actions: {
      onEnter() {
        currFighter.currAnim = 1;
        // console.log('block: onEnter')
      },
      onExit() {
        // console.log('block: onExit')
      },
    },
    transitions: {
      startidle: {
        target: 'idle',
        action() {
          
          // console.log('transition action for "stopblock" from block')
        },
      },
    },
  },
  flinch: {
    actions: {
      onEnter() {
        currFighter.currAnim = 3;
        // console.log('flinch: onEnter')
      },
      onExit() {
        // console.log('flinch: onExit')
      },
    },
    transitions: {
      startidle: {
        target: 'idle',
        action() {
          // console.log('transition action for "stopflinch" from flinch')
        },
      },
    },
  },
})