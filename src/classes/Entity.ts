import { Coordinates, Sizes } from "../types/common.types";
import Board from "./Board";
import CollisionHandler from "./CollisionHandler";

export default class Entity {
    element: HTMLElement | null;
    protected coordinates: Coordinates;
    protected collisionHandler: CollisionHandler | null = null;

    constructor(element: HTMLElement | null, coordinates: Coordinates = {x: NaN, y: NaN}) {
        this.element = element;
        this.coordinates = coordinates;
    }

    public getCoords = () : Coordinates => this.coordinates;

    public getSizes = () : Sizes => this.element ? {width: this.element.offsetWidth, height: this.element.offsetHeight} : {width: NaN, height: NaN};

    public addCollisionHandler (board: Board) {
        this.collisionHandler = new CollisionHandler(this.getCoords, board.getTileCoords, board.getObstacles);
    }
}