import { GATO_ACCELERATION, GATO_MAX_SPEED, UPDATES_PER_SECOND } from "../config";
import { Coordinates, Sizes } from "../types/common.types";
import { doRectanglesOverlap } from "../utils/misc";
import { getPos } from "../utils/positioning";
import Board from "./Board";
import Entity from "./Entity";

export default class Gato extends Entity {
    private picked: boolean = false;
    private verticalSpeed: number = 0;

    constructor(coordinates: Coordinates, board: Board){
        super(null, coordinates);

        this.addCollisionHandler(board);
        this.fall = this.fall.bind(this);
    }

    public createGato(container: HTMLElement) {
        this.element = document.createElement('div');
        this.element.classList.add('gato');

        container.appendChild(this.element);
    }
    
    public updatePosition(playerCoordinates: Coordinates, playerSizes: Sizes) {
        if(!this.element) return;

        const doesOverlapWithPlayer = doRectanglesOverlap(this.coordinates, this.getSizes(), playerCoordinates, playerSizes);

        if(!this.picked && doesOverlapWithPlayer) this.picked = true;
        if(this.picked) this.coordinates = structuredClone(playerCoordinates);

        const position = getPos(this.coordinates, playerCoordinates, this.element.offsetWidth);

        this.element.style.left = `${position.x}px`;
        this.element.style.top = `${position.y}px`;

        if(!this.picked) this.fall();
    }

    private fall() {
        if(!this.element) return;
        this.verticalSpeed = Math.min(this.verticalSpeed + GATO_ACCELERATION, GATO_MAX_SPEED);

        const movement = {x: 0, y: this.verticalSpeed};
        const handledMovement = this.collisionHandler?.handleCollisions(this.element, movement);

        if(!handledMovement?.y) return this.verticalSpeed = 0;

        this.coordinates.y += this.verticalSpeed;
        this.element.style.top = `${this.element.offsetTop + this.verticalSpeed}px`;
        
        setTimeout(this.fall, 1000 / UPDATES_PER_SECOND)
    }
}