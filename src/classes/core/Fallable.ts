import { Coordinates, Sizes } from "../../types/common.types";
import Entity from "./Entity";

export default class Fallable extends Entity {
    // all in the context of vertical displacement
    private speed: number = 0;
    private maxSpeed: number = 0;
    private accelerationPerFrame: number = 0;

    constructor(coordinates: Coordinates, sizes: Sizes, accelerationPerFrame: number, maxSpeed: number) {
        super(coordinates, sizes);
        this.accelerationPerFrame = accelerationPerFrame;
        this.maxSpeed = maxSpeed;
    }

    protected calculateFalling() {
        if(!this.collisionHandler) throw Error('Fallable must have a collision handler assigned.');
        this.speed = Math.min(this.speed + this.accelerationPerFrame, this.maxSpeed);
    
        const movement = {x: 0, y: this.speed};
        const handledMovement = this.collisionHandler.handleCollisions(movement);
    
        if(!handledMovement.y) return this.speed = 0;
    
        this.coordinates.y += this.speed;
    }
}