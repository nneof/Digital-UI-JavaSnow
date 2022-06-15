/* eslint-disable prettier/prettier */
import { makeSprite, t } from "@replay/core";
import { Player } from "./player";

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
    
    const { inputs } = getInputs();
    let { player1 } = state;

    return {
      ...state,
      loaded: true,
      player1,
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
      t.rectangle({
        height: device.size.height,
        x: -230,
        width: 1,
        color: "black",
      }),
    ];
  },
});
