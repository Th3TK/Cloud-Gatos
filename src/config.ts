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
export const TILES_TO_NEW_GATO_HORIZONTAL: MinMax = {min: 5, max: 8}
export const TILES_TO_NEW_GATO_VERTICAL: MinMax = {min: 5, max: 8}

export const GATO_ACCELERATION = 1;
export const GATO_MAX_SPEED = 20;

export const PICK_UP_COOLDOWN = 1000;

/* Pointer */
export const getPointerRadius = () => window.innerHeight / 2 - 250; 

/* Enemies - Ravens */
export const PATHFINDING_GRID_RANGE = 10; // range from player (in the center), so when 25 the grid is 51x51
export const RAVEN_SPEED = 9;
export const RAVEN_SPEED_WITH_GATO = 7;
export const RAVEN_SPEED_STEAL = 10;
