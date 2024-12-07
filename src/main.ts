import MovementHandler from "./classes/MovementHandler.js";
import { Game } from "./classes/Game.ts";
import { getSeed } from "./utils/seeds.js";

const playerElement = document.querySelector('#player');
const gameElement = document.body;

if (!(playerElement instanceof HTMLElement)) throw 'No HTMLElement of id = #player';

const seed = getSeed();
const game = new Game(gameElement, playerElement, seed);
const handler = new MovementHandler(game); 

document.addEventListener('DOMContentLoaded', () => {
    handler.start();
    game.start();
});
