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
    size: 10,
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
      audioFileNames: ["boop.wav"],
      imageFileNames: ["Namek.png", "goku.png", "playerLife.png"],
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
    let { player1, enemies} = state;

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

    return {
      ...state,
      loaded: true,
      player1,
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
      ...state.enemies.map(({ x, y, id }) =>
        Enemy({ x, y, id: "enemy" + id })
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
