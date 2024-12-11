import GAME from "../../config/game.config";
import { Coordinates, Movement, Rect, Sizes } from "../../types/common.types";
import { clamp } from "../../utils/misc";
import { rectFromCoordsAndSizes } from "../../utils/positioning";
import TextureHandler from "../display/TextureHandler";
import Board from "../environment/Board";
import CollisionHandler from "./CollisionHandler";

export default class Entity {
    protected coordinates: Coordinates;
    protected sizes: Sizes;
    protected collisionHandler: CollisionHandler | null = null;
    protected textureHandler?: TextureHandler;

    constructor(coordinates: Coordinates, sizes: Sizes) {
        this.coordinates = coordinates;
        this.sizes = sizes;
    }

    public getCoords = () : Coordinates => this.coordinates;
    public setCoords = (coords: Coordinates) => this.coordinates = coords;
    public getSizes = () : Sizes => this.sizes;
    public getCenter = () : Coordinates => ({
        x: this.coordinates.x + this.sizes.width / 2,
        y: this.coordinates.y + this.sizes.height / 2,
    })
    public getRect = () : Rect => rectFromCoordsAndSizes(this.coordinates, this.sizes);
    
    public getCurrentTextureKey = () => this.textureHandler?.getCurrentTextureKey();

    public isTextureFlipped = () => this.textureHandler!.isFlippedHorizontally();
    
    public addTextureHandler (textureKeys: string[], chooseTexture?: () => string) {
        this.textureHandler = new TextureHandler(textureKeys, chooseTexture);
    }

    public addCollisionHandler (board: Board) {
        this.collisionHandler = new CollisionHandler(this, board);
    }
    
    public move(movement: Movement) {
        let handledMovement = this.collisionHandler?.handleCollisions(movement) ?? movement;
        
        this.coordinates.x += handledMovement.x;
        this.coordinates.y = clamp(this.coordinates.y + handledMovement.y, -GAME.ENTITY_MAX_Y, -GAME.ENTITY_MIN_Y);

        console.log(this.getCoords())
    }
}