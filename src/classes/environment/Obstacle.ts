import { Coordinates, Sizes } from "../../types/common.types";

export default class Obstacle {
    private tileCoordinates: Coordinates;
    private sizes: Sizes;

    constructor(tileCoordinates: Coordinates, sizes: Sizes) {
        this.tileCoordinates = tileCoordinates;
        this.sizes = sizes;
    }

    public getTileCoords = () => this.tileCoordinates;

    public getSizes = () => this.sizes; 

    
}