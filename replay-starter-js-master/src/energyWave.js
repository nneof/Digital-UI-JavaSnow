import { makeSprite, t } from "@replay/core";

export const energyWidth = 50;
export const energyHeight = 30;

export const EnergyWave = makeSprite({
  render() {
    return [
      t.image({
        fileName: "kamehameha.png",
        width: energyWidth,
        height: energyHeight,
        targetHit: 0,
      }),
    ];
  },
});