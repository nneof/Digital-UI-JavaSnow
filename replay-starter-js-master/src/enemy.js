import { makeSprite, t } from "@replay/core";

export const enemyWidth = 100;
export const enemyHeight = 50;

export const Enemy = makeSprite({
  render() {
    return [
      t.image({
        testId: "icon",
        fileName: "goku.png",
        width: enemyWidth,
        height: enemyHeight,
      }),
    ];
  },
});
