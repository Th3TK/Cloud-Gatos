import Board from "./Board.js";
import Player from "./Player.js";
import Gato from "./Gato.js";
import { Coordinates, Movement } from "../types/common.types.js";

export class Game {
    private element: HTMLElement;
    private player: Player;
    private board: Board;
    private gato: Gato | null = null;

    constructor(gameElement: HTMLElement, playerElement: HTMLElement, seed: number) {
        this.element = gameElement;
        this.player = new Player(playerElement);
        this.board = new Board(seed, this.player.getCoords);
        this.player.addCollisionHandler(this.board);
    }

    public start() {
        this.newGato(this.board.getCoordsFromTile(this.board.getTileForGato()));
        this.gato?.updatePosition(this.player.getCoords(), this.player.getSizes());
    }

    private newGato(coordinates: Coordinates) {
        if(this.gato) this.gato?.element?.remove();
        
        this.gato = new Gato(coordinates, this.board);
        this.gato.createGato(this.element);
    }

    public updatePositions(movement: Movement) {
        if (!movement.x && !movement.y) return;

        this.player.move(movement);
        this.gato?.updatePosition(this.player.getCoords(), this.player.getSizes());
        this.board.updateBoard(this.player.getCoords());
    }
}