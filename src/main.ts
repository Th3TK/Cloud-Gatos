import TextureBank from "./classes/display/TextureBank.js";
import Game from "./classes/game/Game";
import KeyboardHandler from "./classes/game/KeyboardHandler.js";
import MovementHandler from "./classes/game/MovementHandler.js";
import TEXTURES from "./config/textures.config.js";
import { getSeed } from "./utils/seeds.js";

const playerElement = document.querySelector('#player');
const pointerElement = document.querySelector('#pointer');
const pointsCounter = document.querySelector('#pointsCounter');
const gameCanvas = document.querySelector('#game-canvas');

if (!(playerElement instanceof HTMLElement)) throw 'No HTMLElement of id = #player';
if (!(pointsCounter instanceof HTMLElement)) throw 'No HTMLElement of id = #pointCounter';
if (!(pointerElement instanceof HTMLElement)) throw 'No HTMLElement of id = #pointer';
if (!(gameCanvas instanceof HTMLCanvasElement)) throw 'No HTMLCanvasElement of id = #game-canvas';

const seed = getSeed();
const game = new Game(playerElement, pointerElement, pointsCounter, gameCanvas, seed);
const movementHandler = new MovementHandler(game); 
const keyboardHandler = new KeyboardHandler();

game.addGameLostCallback(() => {
    movementHandler.stop();
    keyboardHandler.stop();
})

keyboardHandler.registerKeysDown(['w', 'a', 's', 'd'], movementHandler.keyPress);
keyboardHandler.registerKeysUp(['w', 'a', 's', 'd'], movementHandler.keyRelease);
keyboardHandler.registerKeyDown('r', game.playerRelease);

document.addEventListener('DOMContentLoaded', () => {    
    keyboardHandler.start();
    movementHandler.start();
    game.start();
});