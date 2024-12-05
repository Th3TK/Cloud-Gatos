import Board from "./classes/Board.js";
import MovementHandler from "./classes/MovementHandler.js";
import Player from "./classes/Player.js";
import { getSeed } from "./utils/seeds.js";

const playerElement = document.querySelector('#player');

const seed = getSeed();

const player = new Player(playerElement, 0, 0);
const board = new Board(player, seed);
const handler = new MovementHandler(board);

document.addEventListener('DOMContentLoaded', () => {
    handler.start();
});
