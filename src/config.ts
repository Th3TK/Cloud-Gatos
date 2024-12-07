import { MinMax } from "./types/common.types";

export const PLAYER_ACCELERATION = 1;
export const PLAYER_MAX_HORIZONTAL_VELOCITY = 8;
export const PLAYER_MAX_VERTICAL_VELOCITY = 8;
export const UPDATES_PER_SECOND = 60;

export const PLAYER_WIDTH = 100;
export const CLOUD_WIDTH = 200;

export const MAX_HEIGHT_CLOUDS = 100;
export const MIN_HEIGHT_CLOUDS = 0;

export const TILES_TO_NEW_GATO_HORIZONTAL: MinMax = {
    min: 5,
    max: 5,
}

export const TILES_TO_NEW_GATO_VERTICAL: MinMax = {
    min: 5,
    max: 5,
}

export const GATO_ACCELERATION = 0.5;
export const GATO_MAX_SPEED = 10;

export const PICK_UP_COOLDOWN = 1000;

export const getPointerRadius = () => window.innerHeight / 2 - 250; 