import { makeSprite, t } from "@replay/core";

export const PlayerLife = makeSprite({
  render() {
    return [
      t.image({
        fileName: "playerLife.png",
        height: 40,
        width: 40,
      }),
    ];
  },
});
