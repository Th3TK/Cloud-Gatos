import Board from "../environment/Board.js";
import Player from "./Player.js";
import { Coordinates, Movement, Sizes } from "../../types/common.types.js";
import Pointer from "./Pointer.js";
import { isElementVisible } from "../../utils/positioning.js";
import GatoBoxPair from "./GatoBoxPair.js";
import { WATER_LEVEL } from "../../config.js";
import EnemiesHolder from "../enemies/EnemiesHolder.js";
import Raven from "../enemies/Raven.js";
import CanvasDisplay from "../display/CanvasDisplay.js";

export class Game {
    private element: HTMLElement;
    private pointCounter: HTMLElement;
    private player: Player;
    private board: Board;
    private canvasDisplay: CanvasDisplay;
    private gatoBoxPair: GatoBoxPair | null = null;
    private pointer: Pointer;
    private enemies: EnemiesHolder;
    private points = 0;
    private gameLostCallback: () => void;

    constructor(
        gameElement: HTMLElement, 
        playerElement: HTMLElement,  
        pointerElement: HTMLElement, 
        pointCounter: HTMLElement,
        gameCanvas: HTMLCanvasElement,
        seed: number,
    ) {
        this.element = gameElement;
        this.pointCounter = pointCounter;

        this.player = new Player(playerElement);
        this.board = new Board(seed, this.player);
        this.pointer = new Pointer(pointerElement);
        this.canvasDisplay = new CanvasDisplay(gameCanvas, this.board);
        this.enemies = new EnemiesHolder(this.board, this.player, this.gatoBoxPair?.gato);
        this.player.addCollisionHandler(this.board);
        
        this.addPoint = this.addPoint.bind(this);
        this.playerRelease = this.playerRelease.bind(this);
        this.newBoxGatoPair = this.newBoxGatoPair.bind(this);
        this.playerEnteredNewTile = this.playerEnteredNewTile.bind(this);
    }

    

    /* .................................. */
    /* to be called outside the game      */
    /* .................................. */
    
    public addGameLostCallback = (gameLostCallback: () => void) => this.gameLostCallback = gameLostCallback;

    public playerRelease() {
        if(!this.gatoBoxPair || !this.player.getPickable()) return;
        
        this.player.release();
        this.pointer.pointAt(this.gatoBoxPair.gato);
        this.enemies.setTarget(this.gatoBoxPair.gato);
    }

    /* .................................. */
    /*              PLAYER                */
    /* .................................. */

    private playerEnteredNewTile(last: Coordinates, current: Coordinates) {
        if(!last) return;

        if(last.y !== current.y) this.enemies.shiftPathFindingMatrix(last.y > current.y ? 'up' : 'down');
        if(last.x !== current.x) this.enemies.shiftPathFindingMatrix(last.x > current.x ? 'left' : 'right');
        
        this.enemies.runEnemyUpdate();
    }

    /* .................................. */
    /*           GATO 🐈🐈🐈             */
    /* .................................. */

    private getNewGatoBoxPairCoordinates() {
        const gatoCoordinates = this.board.getCoordsFromTile(this.board.getTileForGato());
        const boxCoordinates = this.board.getCoordsFromTile(this.board.getTileForGato(this.board.getTileCoords(gatoCoordinates)));

        return {boxCoordinates, gatoCoordinates};
    }

    private newBoxGatoPair() {
        const {boxCoordinates, gatoCoordinates} = this.getNewGatoBoxPairCoordinates();
                
        console.log(boxCoordinates, gatoCoordinates);
        this.gatoBoxPair = new GatoBoxPair(boxCoordinates, gatoCoordinates, this.board, this.addPoint);
        this.gatoBoxPair.create(this.element);

        this.pointer.pointAt(this.gatoBoxPair.gato);
        this.enemies.assignGato(this.gatoBoxPair.gato);
    }


    /* .................................. */
    /*              UPDATE                */
    /* .................................. */

    private checkForGatoPickUps(){
        if(!this.gatoBoxPair || !this.player.getCanPick()) return;

        const pickedUp = this.player.tryPick(this.gatoBoxPair.gato);
        if(!pickedUp) return;
        
        this.pointer.pointAt(this.gatoBoxPair.box);
        this.enemies.enterAttackMode(); 
    }

    private updateGatoBoxPair(playerCoords: Coordinates) {
        if(!this.gatoBoxPair) return;

        if(this.board.isObjectInRenderedTiles(playerCoords, this.gatoBoxPair?.gato?.getCoords())) {
            this.checkForGatoPickUps();
            this.gatoBoxPair.gato.updateCoords();
        }

        // if(this.board.isObjectInRenderedTiles(playerCoords, this.gatoBoxPair?.box?.getCoords())) {
        //     this.gatoBoxPair?.box?.updatePosition(playerCoords);
        // }
        this.gatoBoxPair.checkForGatoInABox();
    }

    private updatePointer(playerCoords: Coordinates, playerSizes: Sizes) {
        // if(!isElementVisible(this.pointer.getTarget())) this.pointer.show();
        // else this.pointer.hide();
        
        this.pointer.updatePointing(playerCoords);
    }

    /* .................................. */
    /*               GAME                 */
    /* .................................. */

    public start() {
        this.newBoxGatoPair();
        // this.enemies.addEnemy(new Raven(this.element, this.board));
        // this.enemies.enterDisengageMode();
    }

    protected addPoint() {
        console.log('success!')

        this.playerRelease();
        this.newBoxGatoPair();
        this.enemies.enterDisengageMode();
        this.pointCounter.innerText = `${++this.points}`;
    }

    private checkIfGameLost() {
        if(!this.gatoBoxPair?.gato) return false;
        if(this.gatoBoxPair.gato.getCoords().y > WATER_LEVEL) return true;   
    }

    private gameLost() {
        console.log('Game over.');
        if(this.gameLostCallback) this.gameLostCallback();
    }

    public tick(movement: Movement) {
        
        if(movement.x || movement.y) this.player.move(movement);
        
        const playerCoords = this.player.getCoords();
        const playerSizes = this.player.getSizes(); 
        
        this.updateGatoBoxPair(playerCoords); 
        this.updatePointer(playerCoords, playerSizes);
        
        this.board.updateBoard(this.playerEnteredNewTile);
        this.canvasDisplay.update(this.player, this.gatoBoxPair);
        
        const enemyWithGato = this.enemies.updatePositions();
        if(enemyWithGato) this.pointer.pointAt(enemyWithGato);

        if(this.checkIfGameLost()) this.gameLost();
    }

    
}