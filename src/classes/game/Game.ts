import Board from "../environment/Board.js";
import Player from "./Player.js";
import Gato from "./Gato.js";
import { Coordinates, Movement } from "../../types/common.types.js";
import Pointer from "./Pointer.js";
import { isElementVisible } from "../../utils/positioning.js";

export class Game {
    private element: HTMLElement;
    private player: Player;
    private board: Board;
    private gato: Gato | null = null;
    private pointer : Pointer;

    constructor(
        gameElement: HTMLElement, 
        playerElement: HTMLElement, 
        obstacleContainer: HTMLElement, 
        pointerElement: HTMLElement, 
        seed: number
    ) {
        this.element = gameElement;
        this.player = new Player(playerElement);
        this.board = new Board(seed, obstacleContainer, this.player.getCoords);
        this.pointer = new Pointer(pointerElement);
        this.player.addCollisionHandler(this.board);

        this.playerRelease = this.playerRelease.bind(this);
    }

    public start() {
        this.newGato(this.board.getCoordsFromTile(this.board.getTileForGato()));
        this.gato?.updatePosition(this.player.getCoords());
    }

    private newGato(coordinates: Coordinates) {
        if(this.gato) this.gato?.element?.remove();
        
        this.gato = new Gato(coordinates, this.board);
        this.gato.createGato(this.element);

        this.pointer.pointAt(this.gato);
    }

    public checkForGatoPickUps(){
        if(!this.gato) return;
        
        if(this.player.getCanPick()) this.player.tryPick(this.gato);
    }

    public playerRelease() {
        this.player.release();
    }

    public updatePositions(movement: Movement) {
        if(movement.x || movement.y) this.player.move(movement);
        
        const playerCoords = this.player.getCoords();
        const playerSizes = this.player.getSizes(); 
        
        if(this.gato && this.board.isObjectInRenderedTiles(playerCoords, this.gato?.getCoords())) {
            this.checkForGatoPickUps();
            this.gato?.updatePosition(playerCoords);
        }
        
        this.board.updateBoard();
        
        if(!isElementVisible(this.pointer.getTarget()?.element)) {
            this.pointer.show();
        }
        else this.pointer.hide();
        this.pointer.updatePointing(playerCoords, playerSizes);
    }
}