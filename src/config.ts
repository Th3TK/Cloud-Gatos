import { MinMax } from "./types/common.types";

export const HORIZONTAL_VELOCITY = 3;
export const VERTICAL_VELOCITY = 3;
export const UPDATES_PER_SECOND = 144;

export const PLAYER_WIDTH = 100;
export const CLOUD_WIDTH = 200;

export const CHANCE_FOR_CLOUD = 0.75; // <0, 1>
export const MAX_HEIGHT_CLOUDS = 100;
export const MIN_HEIGHT_CLOUDS = 0;

export const TILES_TO_NEW_GATO_HORIZONTAL: MinMax = {
    min: 2,
    max: 4,
}

export const TILES_TO_NEW_GATO_VERTICAL: MinMax = {
    min: 2,
    max: 2,
}

export const GATO_ACCELERATION = 0.25;
export const GATO_MAX_SPEED = 5;