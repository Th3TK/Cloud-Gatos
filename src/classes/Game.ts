import Board from "./Board.js";
import Player from "./Player.js";
import Gato from "./Gato.js";
import { Coordinates, Movement } from "../types/common.types.js";

export class Game {
    element: HTMLElement;
    player: Player;
    board: Board;
    gato: Gato | null = null;

    constructor(gameElement: HTMLElement, playerElement: HTMLElement, seed: number) {
        this.element = gameElement;
        this.player = new Player(playerElement, {x: 0, y: 0});
        this.board = new Board(seed, this.player.coordinates);
    }

    newGato(coordinates: Coordinates) {
        if(this.gato) this.gato.element.remove();

        const gatoElement = document.createElement('div');
        gatoElement.classList.add('gato');

        this.element.appendChild(gatoElement);
        this.gato = new Gato(gatoElement, coordinates);
    }

    handleCollisions(movement: Movement) {
        const currentTile = this.board.getCurrentTileCoords();
        const playerRect = this.player.element.getBoundingClientRect();

        for (const obstacle of Object.values(this.board.obstacles)) {
            if(Math.abs(obstacle.tileCoordinates.x - currentTile.x) > 1 && Math.abs(obstacle.tileCoordinates.y - currentTile.y) > 1) continue;
            
            const rect = obstacle.element.getBoundingClientRect();
            
            const horizontalBounds = playerRect.x < rect.x + rect.width && playerRect.x + playerRect.width > rect.x;
            const verticalBounds = playerRect.y < rect.y + rect.height && playerRect.y + playerRect.height > rect.y;

            const horizontalBoundsAfterMove = playerRect.x + movement.x < rect.x + rect.width && playerRect.x + playerRect.width + movement.x  > rect.x;
            const verticalBoundsAfterMove = playerRect.y + movement.y  < rect.y + rect.height && playerRect.y + playerRect.height + movement.y  > rect.y;
            
            if(horizontalBoundsAfterMove && verticalBounds) movement.x = 0;
            if(horizontalBounds && verticalBoundsAfterMove) movement.y = 0;
        }

        return movement;
    }

    updatePositions(movement: Movement) {
        if (!movement.x && !movement.y) return;
        const handledMovement = this.handleCollisions(movement);

        this.player.move(handledMovement);
        this.board.updateBoard(this.player.coordinates);
    }
}