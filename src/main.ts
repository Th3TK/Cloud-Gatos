import Game from "./classes/game/Game";
import KeyboardHandler from "./classes/game/KeyboardHandler.js";
import MovementHandler from "./classes/game/MovementHandler.js";
import { getSeed } from "./utils/seeds.js";
import Cookies from 'js-cookie';

const playerElement = document.querySelector('#player')! as HTMLElement;
const pointerElement = document.querySelector('#pointer')! as HTMLElement;
const pointsDisplay = document.querySelector('#points-display')! as HTMLElement;
const gameCanvas = document.querySelector('#game-canvas')! as HTMLCanvasElement;
const gameContainer = document.querySelector('#game-container')! as HTMLElement;
const menuContainer = document.querySelector('#menu')! as HTMLElement;
const endscreenContainer = document.querySelector('#endscreen')! as HTMLElement;
const startButton = document.querySelector('#play-button')! as HTMLButtonElement;
const restartButton = document.querySelector('#play-again')! as HTMLButtonElement;
const returnToMenuButton = document.querySelector('#return-to-menu')! as HTMLButtonElement;
const finalScoreOutput = document.querySelector('#endscreen-score-out')! as HTMLElement;
const highScoreOutput = document.querySelector('#endscreen-highscore-out')! as HTMLElement;

let game: Game | null = null;

const startGame = () => {
    if(game?.isGameRunning()) return;
    
    game = new Game(playerElement, pointerElement, pointsDisplay, gameCanvas, getSeed());
    const movementHandler = new MovementHandler(game); 
    const keyboardHandler = new KeyboardHandler();
    
    keyboardHandler.registerKeysDown(['w', 'a', 's', 'd'], movementHandler.keyPress);
    keyboardHandler.registerKeysUp(['w', 'a', 's', 'd'], movementHandler.keyRelease);
    keyboardHandler.registerKeyDown('r', game.playerRelease);
    keyboardHandler.registerKeyDown('l', game.stop);

    game.addGameLostCallback((points: number) => {
        movementHandler.stop();
        keyboardHandler.stop();
    
        movePages(gameContainer, endscreenContainer);

        const highScore = parseInt(`${Cookies.get('highscore')}`);
        if(!isNaN(highScore) && points > highScore) Cookies.set('highscore', `${points}`);

        finalScoreOutput.innerText = `${points}`;
        highScoreOutput.innerText = `${highScore}`;
    })

    keyboardHandler.start();
    movementHandler.start();
    game.start();
}

startButton.addEventListener('click', () => {
    startGame();
    movePages(menuContainer, gameContainer);
})

restartButton.addEventListener('click', () => {
    startGame();
    movePages(endscreenContainer, gameContainer);
})

returnToMenuButton.addEventListener('click', () => {
    movePages(endscreenContainer, menuContainer);
})


function movePages(from: HTMLElement, to: HTMLElement) {
    to.style.animation = 'wipe 1s ease-in-out forwards';
    from.style.animation = 'wipeReverse 1s ease-in-out forwards';

    to.classList.add('current');
    from.classList.remove('current');  
}