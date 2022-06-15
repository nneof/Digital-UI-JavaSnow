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

export const options = {
  dimensions: "scale-up",
};

export const gameProps = {
  id: "Game",
  size: {
    landscape: {
      width: 850,
      height: 400,
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
      x: -350,
      y: 0,
      lifeHit: false,
    },
    {
      id: 2,
      x: -350,
      y: -50,
      lifeHit: false,
    },
    {
      id: 3,
      x: -350,
      y: -100,
      lifeHit: false,
    },
    {
      id: 4,
      x: -350,
      y: -150,
      lifeHit: false,
    },
  ],
  player1: {
    id: "Player1",
    x: -250,
    y: 0,
    score: 0
  },
  isGameOver: false
};

export const Game = makeSprite({
  init({ updateState, preloadFiles }) {
    preloadFiles({
      audioFileNames: ["boop.wav", "dbz-1.mp3", "naruto-kokuten.mp3"],
      imageFileNames: ["goku.png", "playerLife.png", "Namek.png", "playerLife.png"],
    }).then(() => {
      updateState((state) => ({ ...state, loaded: true }));
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

    enemy = spawnEnemy(enemies);
    if (enemy != undefined)
      enemies = [...enemies, enemy];
    if(enemies.length > 0){
      for(i = 0; i < enemies.length; i++){
        if(i == 0){
        enemies[0].x += -1;
        }
        if(i > 0 && enemies[i-1].x < 250 ){
          enemies[i].x += -1;
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
    didWaveHitTarget(energyWaves,enemies);

    if (inputs.keysJustPressed[" "]){
      device.audio("boop.wav").play();
      energyWave = createEnergyWave(player1,energyWaves);
    }
    if(energyWave != undefined){
      energyWaves = [...energyWaves,energyWave];
    }
    if(energyWaves.length>0){
      energyWaves[0].x += 5;
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
        //isGameOver = true;
      }
      playerLifes = [...playerLifes.filter(
        (life) => life.lifeHit === false
        ),
      ];
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
          text: "Loading...",
          color: "black",
        }),
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
    if(enemies[i].x === -222){
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
  if(energyWaves.length === 0)
    return {x: -205, y: player1.y-5, id: wavesCount-1, targetHit: false, enemyHitWall: false};
}

function spawnEnemy(enemies) {
  const max = 150;
  const min = -150;
  const enemiesLength = enemies.length;
  enemiesCount++;
  if (enemies.length == 0) { // add first enemy
    return {x: 400, y: Math.random() * (max - min) + min, id: enemiesCount-1, targetHit: false, enemyHitWall: false};
  }
  if(enemiesLength > 0 && enemies[enemiesLength-1].x < 250){
    if (enemiesCount % 2 != 0) { // lower 
      return {x: 400, y: Math.random() * 150 * -1, id: enemiesCount-1, targetHit: false, enemyHitWall: false};
    } else {// upper
      return {x: 400, y: Math.random() * 140, id: enemiesCount-1, targetHit: false, enemyHitWall: false};
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

function didWaveHitTarget(energyWaves, enemies){
  if(energyWaves.length > 0) {
    let energyX = energyWaves[0].x;
    let energyTop = energyWaves[0].y + energyHeight/2;
    let energyBottom = energyWaves[0].y - energyHeight/2;
    let i = 0;
    for(i = 0; i < enemies.length; i++){
      let enemyTop = enemies[i].y + enemyHeight/2;
      let enemyBottom = enemies[i].y - enemyHeight/2;
      if(energyX > enemies[i].x && ((energyBottom < enemyTop && energyBottom > enemyBottom-10 ) || (energyTop > enemyBottom && energyTop < enemyTop))){ //&& energyY > enemyBottom && energyY < enemyTop){
        energyWaves[0].targetHit = true;
        enemies[i].targetHit = true;
        activateNumber(Math.trunc(Math.random() * 10));        
      }
    }
  }
  
}
