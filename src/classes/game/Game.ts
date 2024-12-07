import Board from "../environment/Board.js";
import Player from "./Player.js";
import { Movement } from "../../types/common.types.js";
import Pointer from "./Pointer.js";
import { isElementVisible } from "../../utils/positioning.js";
import GatoBoxPair from "./GatoBoxPair.js";

export class Game {
    private element: HTMLElement;
    private pointCounter: HTMLElement;
    private player: Player;
    private board: Board;
    private gatoBoxPair: GatoBoxPair | null = null;
    private pointer: Pointer;
    private points = 0;

    constructor(
        gameElement: HTMLElement, 
        playerElement: HTMLElement, 
        obstacleContainer: HTMLElement, 
        pointerElement: HTMLElement, 
        pointCounter: HTMLElement,
        seed: number
    ) {
        this.element = gameElement;
        this.pointCounter = pointCounter;
        this.player = new Player(playerElement);
        this.board = new Board(seed, obstacleContainer, this.player.getCoords);
        this.pointer = new Pointer(pointerElement);
        this.player.addCollisionHandler(this.board);

        this.playerRelease = this.playerRelease.bind(this);
        this.addPoint = this.addPoint.bind(this);
        this.newBoxGatoPair = this.newBoxGatoPair.bind(this);
    }

    private getNewGatoBoxPairCoordinates() {
        const gatoCoordinates = this.board.getCoordsFromTile(this.board.getTileForGato());
        const boxCoordinates = this.board.getCoordsFromTile(this.board.getTileForGato(this.board.getTileCoords(gatoCoordinates)));

        return {boxCoordinates, gatoCoordinates};
    }

    private newBoxGatoPair() {
        const {boxCoordinates, gatoCoordinates} = this.getNewGatoBoxPairCoordinates();

        if(this.gatoBoxPair) this.gatoBoxPair.remove();
        
        this.gatoBoxPair = new GatoBoxPair(boxCoordinates, gatoCoordinates, this.board, this.addPoint);
        this.gatoBoxPair.create(this.element, this.board.getGridSize() / 2);

        this.pointer.pointAt(this.gatoBoxPair.gato);
        this.gatoBoxPair?.gato?.updatePosition(this.player.getCoords());
        this.gatoBoxPair?.box?.updatePosition(this.player.getCoords());
    }

    protected addPoint() {
        console.log('success!')

        this.playerRelease();
        this.newBoxGatoPair();
        this.pointCounter.innerText = `${++this.points}`;
    }

    private checkForGatoPickUps(){
        if(!this.gatoBoxPair) return;
        
        let pickedUp = false;
        if(this.player.getCanPick()) pickedUp = this.player.tryPick(this.gatoBoxPair.gato);
        if(pickedUp) this.pointer.pointAt(this.gatoBoxPair.box);
    }

    public start() {
        this.newBoxGatoPair();
        this.gatoBoxPair?.gato?.updatePosition(this.player.getCoords());
    }

    public playerRelease() {
        if(!this.gatoBoxPair) return;
        
        this.player.release();
        this.pointer.pointAt(this.gatoBoxPair.gato);
    }

    public updatePositions(movement: Movement) {
        if(movement.x || movement.y) this.player.move(movement);
        
        const playerCoords = this.player.getCoords();
        const playerSizes = this.player.getSizes(); 
        
        if(this.gatoBoxPair) {
            if(this.board.isObjectInRenderedTiles(playerCoords, this.gatoBoxPair?.gato?.getCoords())) {
                this.checkForGatoPickUps();
                this.gatoBoxPair?.gato?.updatePosition(playerCoords);
            }

            if(this.board.isObjectInRenderedTiles(playerCoords, this.gatoBoxPair?.box?.getCoords())) {
                this.gatoBoxPair?.box?.updatePosition(playerCoords);
            }
            this.gatoBoxPair.checkForGatoInABox();
        } 
        
        this.board.updateBoard();
        
        if(!isElementVisible(this.pointer.getTarget()?.element)) this.pointer.show();
        else this.pointer.hide();
        
        this.pointer.updatePointing(playerCoords, playerSizes);
    }
}