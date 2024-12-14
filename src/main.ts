import Game from "./classes/game/Game";
import KeyboardHandler from "./classes/game/KeyboardHandler.js";
import MovementHandler from "./classes/game/MovementHandler.js";
import Page from "./classes/layout/Page.js";
import { getSeed } from "./utils/seeds.js";
import Cookies from 'js-cookie';

const playerElement = document.querySelector('#player')! as HTMLElement;
const pointerElement = document.querySelector('#pointer')! as HTMLElement;
const pointsDisplay = document.querySelector('#points-display')! as HTMLElement;
const gameCanvas = document.querySelector('#game-canvas')! as HTMLCanvasElement;
const gameContainer = document.querySelector('#game-container')! as HTMLElement;
const menuContainer = document.querySelector('#menu')! as HTMLElement;
const endscreenContainer = document.querySelector('#endscreen')! as HTMLElement;
const finalScoreOutput = document.querySelector('#endscreen-score-out')! as HTMLElement;
const highScoreOutput = document.querySelector('#endscreen-highscore-out')! as HTMLElement;

const endscreenPage = new Page(endscreenContainer);
const gamePage = new Page(gameContainer);
const menuPage = new Page(menuContainer, 'menu-visible-section', 'menu-hidden-section');
menuPage.registerSectionConfigs('main', [1, 3]);
menuPage.registerSectionConfigs('credits', [2]);

let game: Game | null = null;

const startGame = () => {
    if(game?.isGameRunning()) return;
    
    game = new Game(playerElement, pointerElement, pointsDisplay, gameCanvas, getSeed());
    const movementHandler = new MovementHandler(game); 
    const keyboardHandler = new KeyboardHandler();
    
    keyboardHandler.registerKeysDown(['w', 'a', 's', 'd'], movementHandler.keyPress);
    keyboardHandler.registerKeysUp(['w', 'a', 's', 'd'], movementHandler.keyRelease);
    keyboardHandler.registerKeyDown(' ', game.playerRelease);
    keyboardHandler.registerKeyDown('l', game.stop);
    // keyboardHandler.registerKeyDown('i', game.addPoint)

    game.addGameLostCallback((points: number) => {
        movementHandler.stop();
        keyboardHandler.stop();
    
        movePages(gamePage, endscreenPage);
        
        const highScore = updateAndGetHighScore(points);
        finalScoreOutput.innerText = `${points}`;
        highScoreOutput.innerText = `${highScore}`;
    })

    keyboardHandler.start();
    movementHandler.start();
    game.start();
}

menuPage.registerButton('play-button', () => {
    startGame();
    movePages(menuPage, gamePage);
})

menuPage.registerButton('credits-button', () => {
    menuPage.display('credits');
    menuPage.getElement().style.backgroundPosition = 'center';
})

menuPage.registerButton('return-from-credits', () => {
    menuPage.display('main');
    menuPage.getElement().style.backgroundPosition = 'bottom';
})

endscreenPage.registerButton('play-again', () => {
    startGame();
    movePages(endscreenPage, gamePage);
})

endscreenPage.registerButton('return-to-menu', () => {
    movePages(endscreenPage, menuPage);
})


function movePages(from: Page, to: Page) {
    from.hidePage();
    to.showPage();
}

function updateAndGetHighScore(points: number) {
    let highScore = parseInt(`${Cookies.get('highscore')}`);
    if(isNaN(highScore) || points > highScore) {
        Cookies.set('highscore', `${points}`);
        highScore = points;
    }
    return highScore;
}