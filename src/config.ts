import { MinMax } from "./types/common.types";

/* Game */
export const UPDATES_PER_SECOND = 60;
export const MAX_RENDER_DISTANCE = 10;
export const DISTANCE_FOR_GAME_LOST = 1500;

/* Player */
export const PLAYER_ACCELERATION = 1;
export const PLAYER_MAX_HORIZONTAL_VELOCITY = 8;
export const PLAYER_MAX_VERTICAL_VELOCITY = 8;

export const PLAYER_WIDTH = 100;

/* Board and clouds */
export const BOARD_TILE_WIDTH = 250;    // cloud width
export const BOARD_TILE_HEIGHT = 120;   // cloud height
export const HEIGHT_LIMIT = 55          // ! y tile coordinate
export const MAX_HEIGHT_CLOUDS = 50;    // ! y tile coordinate 
export const MIN_HEIGHT_CLOUDS = 0;     // ! y tile coordinate 
export const WATER_LEVEL = 300;         // y coordinate

/* Gato & Pick ups */

export const PICK_UP_COOLDOWN = 1000;

/* Pointer */
export const getPointerRadius = () => window.innerHeight / 2 - 250; 

/* Enemies - Ravens */
export const PATHFINDING_GRID_RANGE = 10; // range from player (in the center), so when 25 the grid is 51x51
export const RAVEN_SPEED = 7;
export const RAVEN_SPEED_WITH_GATO = 7;
export const RAVEN_SPEED_STEAL = 10;


// V2

export const BOX = {
    SIZES: {
        width: 90,
        height: 90,
    }
}

export const GATO = {
    SIZES: {
        width: 70,
        height: 65,
    },
    ACCELERATION: 1,
    MAX_SPEED: 20,
    SPAWN_DISTANCE_HORIZONTAL: {min: 1, max: 2} as MinMax,
    SPAWN_DISTANCE_VERTICAL: {min: 1, max: 2} as MinMax,
}

export const PLAYER = {
    SIZES: {
        width: 150,
        height: 90,
    }
}