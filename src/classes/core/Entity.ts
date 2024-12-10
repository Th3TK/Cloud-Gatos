import { Coordinates, Movement, Rect, Sizes } from "../../types/common.types";
import { getPos, rectFromCoordsAndSizes } from "../../utils/positioning";
import Board from "../environment/Board";
import CollisionHandler from "./CollisionHandler";

export default class Entity {
    protected coordinates: Coordinates;
    protected sizes: Sizes;
    protected collisionHandler: CollisionHandler | null = null;

    constructor(coordinates: Coordinates, sizes: Sizes) {
        this.coordinates = coordinates;
        this.sizes = sizes;
    }

    public getCoords = () : Coordinates => this.coordinates;
    public setCoords = (coords: Coordinates) => this.coordinates = coords;
    public getSizes = () : Sizes => this.sizes;
    public getRect = () : Rect => rectFromCoordsAndSizes(this.coordinates, this.sizes);

    public addCollisionHandler (board: Board) {
        this.collisionHandler = new CollisionHandler(this, board);
    }


    public move(movement: Movement) {
        let handledMovement = this.collisionHandler?.handleCollisions(movement) ?? movement;
        
        this.coordinates.x += handledMovement.x;
        this.coordinates.y += handledMovement.y;

        console.log(this.coordinates)
    }
}