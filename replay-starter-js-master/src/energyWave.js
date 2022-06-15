import { makeSprite, t } from "@replay/core";

export const energyWidth = 50;
export const energyHeight = 15;

export const EnergyWave = makeSprite({
  render() {
    return [
      t.rectangle({
        color: "blue",
        width: energyWidth,
        height: energyHeight,
        targetHit: 0,
      }),
    ];
  },
});