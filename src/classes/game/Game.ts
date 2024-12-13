import Board from "../environment/Board.js";
import Player from "./Player.js";
import { Coordinates, Movement } from "../../types/common.types.js";
import Pointer from "./Pointer.js";
import GatoBoxPair from "./GatoBoxPair.js";
import { BOARD, BOX, GAME, GATO } from "../../config/_config.js";
import EnemiesHolder from "../enemies/EnemiesHolder.js";
import Raven from "../enemies/Raven.js";
import CanvasDisplay from "../display/CanvasDisplay.js";
import { straightLineDistance } from "../../utils/positioning.js";
import { randomNumber } from "../../utils/misc.js";

export default class Game {
    private running: boolean = false;
    private pointsDisplay: HTMLElement;
    private player: Player;
    private board: Board;
    private canvasDisplay: CanvasDisplay;
    private gatoBoxPair: GatoBoxPair | null = null;
    private pointer: Pointer;
    private enemies: EnemiesHolder;
    private points = 0;
    private gameLostCallback: (points: number) => void;

    constructor(
        playerElement: HTMLElement,  
        pointerElement: HTMLElement, 
        pointsDisplay: HTMLElement,
        gameCanvas: HTMLCanvasElement,
        seed: number,
    ) {
        this.pointsDisplay = pointsDisplay;

        this.player = new Player(playerElement);
        this.pointer = new Pointer(pointerElement);
        this.board = new Board(seed, this.player);
        this.enemies = new EnemiesHolder(this.board, this.player, this.gatoBoxPair?.gato);
        this.player.addCollisionHandler(this.board);
        this.canvasDisplay = new CanvasDisplay(gameCanvas, this.board);
        
        this.addPoint = this.addPoint.bind(this);
        this.playerRelease = this.playerRelease.bind(this);
        this.newBoxGatoPair = this.newBoxGatoPair.bind(this);
        this.playerEnteredNewTile = this.playerEnteredNewTile.bind(this);
        this.stop = this.stop.bind(this);
    }
    
    /* .................................. */
    /* to be called outside the game      */
    /* .................................. */
    
    public isGameRunning = () => this.running;

    public addGameLostCallback = (gameLostCallback: (points: number) => void) => this.gameLostCallback = gameLostCallback;

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

        if(last.y !== current.y) this.enemies.shiftMatrix(last.y > current.y ? 'up' : 'down');
        if(last.x !== current.x) this.enemies.shiftMatrix(last.x > current.x ? 'left' : 'right');
        
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
        const tileSize = this.board.getTileSize();        

        boxCoordinates.y += tileSize.height - BOX.SIZES.height + 8;
        gatoCoordinates.y += tileSize.height - GATO.SIZES.height + 8;
        boxCoordinates.x += randomNumber(0, BOARD.TILE_SIZES.width - BOX.SIZES.width);
        gatoCoordinates.x += randomNumber(0, BOARD.TILE_SIZES.width - GATO.SIZES.width);
        this.gatoBoxPair = new GatoBoxPair(boxCoordinates, gatoCoordinates, this.board, this.addPoint);

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
        this.gatoBoxPair.checkForGatoInABox();
    }

    /* .................................. */
    /*               GAME                 */
        /* .................................. */

    public start() {
        this.pointsDisplay.innerHTML = '';
        this.newBoxGatoPair();
        this.enemies.addEnemy();
        this.enemies.enterDisengageMode();
        this.running = true;
    }

    public stop() {
        this.gameLost();
    }

    public addPoint() {
        this.pointsDisplay.innerHTML = `${++this.points}`;

        this.playerRelease();
        this.newBoxGatoPair();

        this.enemies.enterDisengageMode();
    }

    private checkIfGameLost() {
        if(!this.gatoBoxPair?.gato) return false;

        const gatoTile = this.board.getTileCoords(this.gatoBoxPair.gato.getCoords());
        const gatoInWater = gatoTile.y > -BOARD.WATER_LEVEL_TILE;
        if(gatoInWater) return true;   

        if(this.enemies.getMode() !== 'escape') return false;
        const gatoCoords = this.gatoBoxPair.gato.getCoords();
        const playerCoords = this.player.getCoords();
        return straightLineDistance(gatoCoords, playerCoords) > GAME.DISTANCE_FOR_GAME_LOST;
    }

    private gameLost() {
        if(this.gameLostCallback) this.gameLostCallback(this.points);
        this.running = false;
    }

    public tick(movement: Movement) {
        if(movement.x || movement.y) this.player.move(movement);
        
        const playerCoords = this.player.getCoords();
        
        this.updateGatoBoxPair(playerCoords); 
        this.pointer.updatePointing(playerCoords);
        this.pointer.updatePosition(playerCoords);
        this.board.updateBoard(this.playerEnteredNewTile);
        
        const enemyWithGato = this.enemies.updateEnemies();
        if(enemyWithGato) this.pointer.pointAt(enemyWithGato);
        
        this.canvasDisplay.update(this.player, this.enemies, this.gatoBoxPair);
        if(this.checkIfGameLost()) this.gameLost();

        // const currentBoardTile = this.board.getCurrentTileCoords();
        // const currentPlayerTile = this.board.getTileCoords(playerCoords);
        // this.player.element.innerText = 
        // `${currentPlayerTile.x} ${currentPlayerTile.y}\n${currentBoardTile.x} ${currentBoardTile.y}\n${playerCoords.x} ${playerCoords.y}`
    } 
}