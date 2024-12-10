export { default as ASTAR } from "./astar.config";
export { default as BOARD } from "./board.config";
export { default as BOX } from "./box.config";
export { default as GAME } from "./game.config";
export { default as GATO } from "./gato.config";
export { default as PLAYER } from "./player.config";
export { default as RAVEN } from "./raven.config";

export const POINTER = {
    getPointerRadius: () => window.innerHeight / 2 - 250,
}

export const PICK_UP = {
    COOLDOWN: 1000,
}