import { Coordinates, Sizes } from "../../types/common.types";

export default class Obstacle {
    private tileCoordinates: Coordinates;
    private tileValue: number;
    private sizes: Sizes;

    constructor(tileCoordinates: Coordinates, sizes: Sizes, tileValue: number) {
        this.tileCoordinates = tileCoordinates;
        this.sizes = sizes;
        this.tileValue = tileValue;
    }

    public getTileCoords = () => this.tileCoordinates;

    public getSizes = () => this.sizes; 

    public getTileValue = () => this.tileValue;
}