/* eslint-disable prettier/prettier */
import { makeSprite, t } from "@replay/core";
import { Player } from "./player";
import { PlayerLife } from "./playerLife";
import { Enemy, enemyHeight, enemyWidth} from "./enemy";
import { EnergyWave, energyHeight, energyWidth } from "./energyWave";

let musicStarted = false;
let enemiesCount = 0;
const audioArray = ["dbz-1.mp3", "naruto-kokuten.mp3"];
let audioPlayingCounter=0;
let wavesCount = 0;
let muted = false;
let playerLifesCounter = 4;
let difficulty = 2;
let wavesAvailable = -1;
createButton();
createTimer();

export const options = {
  dimensions: "scale-up",
};

export const gameProps = {
  id: "Game",
  size: {
    landscape: {
      width: 850,
      height: 340,
      maxWidthMargin: 150,
    },
    portrait: {
      width: 400,
      height: 600,
      maxHeightMargin: 150,
    },
  },
  defaultFont: {
    family: "Courier",
    size: 30,
  },
};
const initialState = {
  enemies: [],
  energyWaves: [],
  playerLifes: 
  [
    {
      id: 1,
      x: -395,
      y: 70,
      lifeHit: false,
    },
    {
      id: 2,
      x: -360,
      y: 70,
      lifeHit: false,
    },
    {
      id: 3,
      x: -325,
      y: 70,
      lifeHit: false,
    },
    {
      id: 4,
      x: -290,
      y: 70,
      lifeHit: false,
    },
  ],
  player1: {
    id: "Player1",
    x: -250,
    y: 0,
    score: 0,
    timer: 40
  },
  isGameOver: false
};

export const Game = makeSprite({
  init({ updateState, preloadFiles }) {
    preloadFiles({
      audioFileNames: ["boop.wav", "dbz-1.mp3", "naruto-kokuten.mp3"],
      imageFileNames: ["goku.png", "playerLife.png", "Namek.png", "playerLife.png", "frieza.png","game-over.PNG", "kamehameha.png"],
    }).then(() => {
      if(document.getElementById("startGame").getAttribute("clicked") == "true") {
        console.log("clicked == true")
        updateState((state) => ({...state, loaded: true}));
      }else {
        updateState((state) => ({...state, loaded: false}));
      }
    });
    return initialState;
  },

  loop({ state, device, getInputs }) {
    if (!state.loaded) return state;

    let i= 0;
    let enemy,energyWave;
    const inputs  = getInputs();
    let { player1, enemies, playerLifes, energyWaves, isGameOver} = state;
    if (!state.loaded) return state;
    if (isGameOver) return;

    handleMusic(device,inputs);

    if (Math.trunc(player1.timer) == 0) {
      generateNewEquation();
      cleanElements();
      if(playerLifesCounter > 0){
        playerLifes[playerLifesCounter-1].lifeHit = true;
        playerLifesCounter--;
      }
      player1.timer = 40;
    }

    if(document.getElementById("playerTimer").getAttribute("reset") == "true"){
      player1.timer = 40;
      document.getElementById("playerTimer").setAttribute("reset", "false")
    }

    player1.timer -= 1/60;

    enemy = spawnEnemy(enemies);
    if (enemy != undefined)
      enemies = [...enemies, enemy];
    if(enemies.length > 0){
      for(i = 0; i < enemies.length; i++){
        if(difficulty >= 1){
          if(enemies[i].y >= 130){
            enemies[i].directionY = 2;
          }else if(enemies[i].y <= -130){
            enemies[i].directionY = 1;
          }
          if(enemies[i].directionY === 1){
            enemies[i].y += 1
          }else if(enemies[i].directionY === 2){
            enemies[i].y += -1;
          }
          if(difficulty === 2){
            if(i == 0){
              enemies[i].x += -1.5;
            }
            if(i > 0 && enemies[i-1].x < 250 ){
              enemies[i].x += -1.5;
            }
          }
        }
        if(difficulty <= 1){
          if(i == 0){
            enemies[i].x += -1;
          }
          if(i > 0 && enemies[i-1].x < 250 ){
            enemies[i].x += -1;
          }
        }
      }
    }
    enemies = [...enemies.filter(
      (enemy) => enemy.targetHit === false
      )
      .filter(
        (enemy) => !enemy.enemyHitWall
      ),
    ];
    enemyHitWall(enemies, playerLifes);
    didWaveHitTarget(energyWaves,enemies, player1);

    if (inputs.keysJustPressed[" "]){
      device.audio("boop.wav").play();
      energyWave = createEnergyWave(player1,energyWaves);
    }
    if(energyWave != undefined){
      energyWaves = [...energyWaves,energyWave];
    }
    if(energyWaves.length > 0){
      for(let i = 0; i < energyWaves.length; i++){
        energyWaves[i].x += 5;
      }
      
    }

    if(energyWaves.length > 0){
      energyWaves = [...energyWaves.filter(
        (energy) => energy.targetHit === false
        )
        .filter(
          (energy) => energy.x < 400
        ),
      ];
    }
    if(playerLifesCounter >= 0){
      if(playerLifesCounter === 0){
        device.audio(audioArray[audioPlayingCounter]).pause();
        isGameOver = true;
      }
      playerLifes = [...playerLifes.filter(
        (life) => life.lifeHit === false
        ),
      ];
    }

    if(inputs.keysDown["1"]){
      difficulty = 0;
    }
    if(inputs.keysDown["2"]){
      difficulty = 1;
    }
    if(inputs.keysDown["3"]){
      difficulty = 2;
    }

    if (inputs.keysDown["ArrowUp"]) {
      if (player1.y <= 150) {
        player1.y += 5;
      }
    }
    if (inputs.keysDown["ArrowDown"]) {
      if (player1.y >= -150) {
        player1.y -= 5;
      }
    }

    return {
      ...state,
      loaded: true,
      player1,
      energyWaves,
      playerLifes,
      isGameOver,
      enemies,
    };
  },

  render({ device, state }) {
    if (!state.loaded) {
      return [
        t.text({
          text: "WELCOME",
          color: "black",
        }),
      ];
    }
    if(state.isGameOver) {
      return [
        t.image({
          fileName: "game-over.PNG",
          width: device.size.width,
          height: device.size.height,
        }),
        document.getElementById("gameOver").style.display = 'block'
      ];
    }
    return [
      t.image({
        fileName: "Namek.png",
        width: device.size.width,
        height: device.size.height,
      }),
      Player({
        id: state.player1.id,
        x: state.player1.x,
        y: state.player1.y,
      }),
      t.text({
        font: { name: "Calibri", size: 12, style: "bold" },
        text: "Score:",
        color: "#000000",
        x: -device.size.width / 2 + 40,
        y: device.size.height / 2 - 20,
      }),
      t.text({
        font: { name: "Calibri", size: 12, style: "bold" },
        text: state.player1.score,
        color: "#000000",
        x: -device.size.width / 2 + 40,
        y: device.size.height / 2 - 40,
      }),
      t.text({
        font: { name: "Calibri", size: 12, style: "bold" },
        text: "Timer:",
        color: "#000000",
        x: -device.size.width / 2 + 150,
        y: device.size.height / 2 - 20,
      }),
      t.text({
        font: { name: "Calibri", size: 12, style: "bold" },
        text: Math.trunc(state.player1.timer),
        color: "#000000",
        x: -device.size.width / 2 + 150,
        y: device.size.height / 2 - 40,
      }),
      ...state.playerLifes.map(({ x, y, id }) =>
        PlayerLife({ x, y, id: "life" + id })
      ),
      ...state.enemies.map(({ x, y, id }) =>
        Enemy({ x, y, id: "enemy" + id })
      ),
      ...state.energyWaves.map(({ x, y, id}) =>
        EnergyWave({x, y, id: "kamehameha" + id})
      ),
      t.rectangle({
        height: device.size.height,
        x: -230,
        width: 1,
        color: "black",
      }),
    ];
  },
});

function enemyHitWall(enemies, playerLifes){
  let i;
  for(i = 0; i < enemies.length; i++){
    if(difficulty === 2){
      if(enemies[i].x <= -211.5){
        enemies[i].enemyHitWall = true;
        if(playerLifesCounter > 0){
          playerLifes[playerLifesCounter-1].lifeHit = true;
          playerLifesCounter--;
        }
      }
    }else if(enemies[i].x <= -211){
      enemies[i].enemyHitWall = true;
      if(playerLifesCounter > 0){
        playerLifes[playerLifesCounter-1].lifeHit = true;
        playerLifesCounter--;
      }
    }
  }
}

function createEnergyWave(player1,energyWaves){
  wavesCount++;
  if(difficulty === 0 || difficulty === 1){
    wavesAvailable = 1;
  }else{
    wavesAvailable = 2;
  }
  if(energyWaves.length < wavesAvailable)
    return {x: -215, y: player1.y-5, id: wavesCount-1, targetHit: false, enemyHitWall: false};
}

function spawnEnemy(enemies) {
  const max = 150;
  const min = -150;
  const enemiesLength = enemies.length;
  const initialY = Math.random() * (max - min) + min;
  let direction;
  if(initialY < 0){
    direction = 1;
  }else{
    direction = 2;
  }
  enemiesCount++;
  if (enemies.length == 0) { // add first enemy
    return {x: 400, y: initialY, id: enemiesCount-1, targetHit: false, enemyHitWall: false, directionY: direction};
  }
  if(enemiesLength > 0 && enemies[enemiesLength-1].x < 250){
    if (enemiesCount % 2 != 0) { // lower 
      return {x: 400, y: Math.random() * 150 * -1, id: enemiesCount-1, targetHit: false, enemyHitWall: false, directionY: 1};
    } else {// upper
      return {x: 400, y: Math.random() * 140, id: enemiesCount-1, targetHit: false, enemyHitWall: false, directionY: 2};
    }
  }

};

function handleMusic(device, inputs){
  if(device.audio(audioArray[audioPlayingCounter]).getStatus()!=="playing" && !musicStarted){
    device.audio(audioArray[audioPlayingCounter]).play();
    musicStarted = true;
  }/*else if(device.audio(audioArray[audioPlayingCounter]).getPosition() === device.audio(audioArray[audioPlayingCounter]).getDuration()){
    if(audioPlayingCounter < audioArray.length){
      audioPlayingCounter++;
    }
  }*/
  if(inputs.keysJustPressed["+"]){
    device.audio(audioArray[audioPlayingCounter]).pause();
    audioPlayingCounter++;
    device.audio(audioArray[audioPlayingCounter]).play();
  }
  if(inputs.keysJustPressed["-"]){
    device.audio(audioArray[audioPlayingCounter]).pause();
    audioPlayingCounter--;
    device.audio(audioArray[audioPlayingCounter]).play();
  }
  if(!muted && inputs.keysJustPressed["m"]){
    device.audio(audioArray[audioPlayingCounter]).pause();
    muted = true;
  }else if(muted && inputs.keysJustPressed["m"]){
    device.audio(audioArray[audioPlayingCounter]).play();
    muted = false;
  }
}

function createButton(){
  let btn = document.createElement("button");
  btn.innerHTML = "Play Again";
  btn.style.background = 'red';
  btn.style.display = 'none';
  btn.style.color = 'white';
  btn.id = "gameOver";
  btn.onclick = function () {
    location.reload();
  }
  document.body.appendChild(btn);

  let startGame = document.createElement("button");
  startGame.innerHTML = "Start";
  startGame.style.background = 'red';
  startGame.style.display = 'block';
  startGame.style.color = 'white';
  startGame.id = "startGame";
  startGame.setAttribute("clicked", "false");
  startGame.onclick = function () {
    document.getElementById("startGame").style.display = 'none';
    document.getElementById("startGame").setAttribute("clicked", "true");
  }
  document.body.appendChild(startGame);
}

function createTimer(){
  let playerTimer = document.createElement("playerTimer");
  playerTimer.id = "playerTimer";
  playerTimer.setAttribute("reset", "false");
  document.body.appendChild(playerTimer);
}

function didWaveHitTarget(energyWaves, enemies, player1){
  if(energyWaves.length > 0) {
    for(let j = 0; j < energyWaves.length; j++){
      let energyX = energyWaves[j].x;
      let energyTop = energyWaves[j].y + energyHeight/2;
      let energyBottom = energyWaves[j].y - energyHeight/2;
      let i = 0;
      for(i = 0; i < enemies.length; i++){
        let enemyTop = enemies[i].y + enemyHeight/2;
        let enemyBottom = enemies[i].y - enemyHeight/2;
        if((energyX + energyWidth/2 >= enemies[i].x && energyX - energyWidth/2 <= enemies[i].x)  && ((energyBottom < enemyTop - 9 && energyBottom > enemyBottom-10 ) || (energyTop > enemyBottom + 5 && energyTop < enemyTop))){ //&& energyY > enemyBottom && energyY < enemyTop){
          energyWaves[0].targetHit = true;
          enemies[i].targetHit = true;
          activateNumber(Math.trunc(Math.random() * 10));
          player1.score++;        
        }
      }
    }
  }
  
}
