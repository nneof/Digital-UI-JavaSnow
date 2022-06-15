import { makeSprite, t } from "@replay/core";
 
export const playerWidth = 100;
export const playerHeight = 50;

export const Player = makeSprite({
  render() {
    return [
      t.image({
        testId: "goku",
        fileName: "goku.png",
        width: playerWidth,
        height: 50,
      }),
    ];
  },
});
