import { MinMax } from "./types/common.types";

export const HORIZONTAL_VELOCITY = 2;
export const VERTICAL_VELOCITY = 1;
export const UPDATES_PER_SECOND = 144;

export const PLAYER_WIDTH = 100;
export const CLOUD_WIDTH = 200;

export const CHANCE_FOR_CLOUD = 0.75; // <0, 1>
export const MAX_HEIGHT_CLOUDS = 50;
export const MIN_HEIGHT_CLOUDS = 0;


export const TILES_TO_NEW_GATO_HORIZONTAL: MinMax = {
    min: 10,
    max: 15,
}

export const TILES_TO_NEW_GATO_VERTICAL: MinMax = {
    min: 5,
    max: 10,
}