import SimplexNoise from 'simplex-noise';
import { BOARD_TILE_HEIGHT, BOARD_TILE_WIDTH, GATO, MAX_HEIGHT_CLOUDS, MAX_RENDER_DISTANCE, MIN_HEIGHT_CLOUDS } from "../../config";
import { Coordinates, Sizes, } from "../../types/common.types";
import { filterObject, signDependantFloor } from "../../utils/misc";
import { randomCoords } from "../../utils/positioning.js";
import Obstacle from "./Obstacle.js";
import { DirectionValues, Obstacles } from '../../types/board.types.js';
import Player from '../game/Player.js';

export default class Board {
    private noise: SimplexNoise;
    private tileSize: Sizes;
    private viewRadius: DirectionValues;
    private obstacles: Obstacles;
    private lastUpdateTileCoords: Coordinates;
    public getPlayerCoords: () => Coordinates;

    constructor(seed: number, player: Player) {
        this.noise = new SimplexNoise(seed);
        this.obstacles = {};
        this.getPlayerCoords = () => player.getCoords();

        this.getTileCoords = this.getTileCoords.bind(this);

        this.setDimensions();
        window.addEventListener('resize', this.setDimensions);
    }

    private setDimensions() {
        this.tileSize = {
            width: BOARD_TILE_WIDTH,
            height: BOARD_TILE_HEIGHT,
        } ;
        this.viewRadius = {
            horizontal: Math.min(Math.ceil(window.innerWidth / BOARD_TILE_WIDTH), MAX_RENDER_DISTANCE),
            vertical: Math.min(Math.ceil(window.innerHeight / BOARD_TILE_HEIGHT), MAX_RENDER_DISTANCE)
        } 
    }

    public getDimension = (dimension: 'horizontal' | 'vertical') => this.viewRadius[dimension] * 2 + 1;

    public getDimensions = () : DirectionValues => ({
        horizontal: this.getDimension('horizontal'),
        vertical: this.getDimension('vertical'),
    });

    public getObstacles = () => this.obstacles;

    public getTileSize = () => this.tileSize;

    public getOffset = () => {
        const currentPlayerTile = this.getTileCoords(this.getPlayerCoords());
        return {
            x: currentPlayerTile.x - this.viewRadius.horizontal,
            y: currentPlayerTile.y - this.viewRadius.vertical,
        }
    }

    public isObjectInRenderedTiles = (playerCoords: Coordinates, objectCoords: Coordinates) => {
        const centerTile = this.getTileCoords(playerCoords);
        const objectTile = this.getTileCoords(objectCoords);
        return (
            objectTile.x <= centerTile.x + this.viewRadius.horizontal &&
            objectTile.x >= centerTile.x - this.viewRadius.horizontal &&
            objectTile.y <= centerTile.y + this.viewRadius.vertical &&
            objectTile.y >= centerTile.y - this.viewRadius.vertical
        );
    }

    public isObstacle({ x, y }: Coordinates) {
        if (y < -MAX_HEIGHT_CLOUDS || y > -MIN_HEIGHT_CLOUDS || (x === 0 && y === 0)) return 0;

        const value = this.noise.noise2D(x, y);

        if (value < 0.45) return 0;
        return 1;
    }

    private generateObstacle(tileCoordinates: Coordinates) {
        if (tileCoordinates.x === 0 && tileCoordinates.y === 0) return;

        const id = `${tileCoordinates.x}:::${tileCoordinates.y}`;
        if (id in this.obstacles) return this.obstacles[id];

        if (!this.isObstacle(tileCoordinates)) return null;
        this.obstacles[id] = new Obstacle(tileCoordinates, this.tileSize);
    }

    private generateObstacles(currentTile: Coordinates) {
        for (let dx = -this.viewRadius.horizontal; dx <= this.viewRadius.horizontal; dx++) {
            for (let dy = -this.viewRadius.vertical; dy <= this.viewRadius.vertical; dy++) {

                const tileCoordinates = {
                    x: currentTile.x + dx,
                    y: currentTile.y + dy,
                }

                this.generateObstacle(tileCoordinates);
            }
        }
    }

    private pruneOffViewObstacles(currentTile: Coordinates) {
        const [minH, maxH, minV, maxV] = [
            currentTile.x - this.viewRadius.horizontal,
            currentTile.x + this.viewRadius.horizontal,
            currentTile.y - this.viewRadius.vertical,
            currentTile.y + this.viewRadius.vertical,
        ];
        

        const isInView = (tileCoords: Coordinates) =>
            tileCoords.x >= minH && tileCoords.x <= maxH &&
            tileCoords.y >= minV && tileCoords.y <= maxV;

        this.obstacles = filterObject(this.obstacles, (obstacle: Obstacle) => isInView(obstacle.getTileCoords()));
    }

    public getTileForGato(centerTile: Coordinates = this.getCurrentTileCoords()): Coordinates {
        const tileCoordinates = randomCoords(centerTile, GATO.SPAWN_DISTANCE_HORIZONTAL, GATO.SPAWN_DISTANCE_VERTICAL);
        tileCoordinates.y = tileCoordinates.y;

        let [x, y, dx, dy] = [0, 0, 0, -1];

        while (!this.isObstacle(tileCoordinates)) {
            if ((x == y) || (x < 0 && x == -y) || (x > 0 && x == 1 - y)) {
                [dx, dy] = [-dy, dx];
            }
            x += dx;
            y += dy;
            tileCoordinates.x += dx;
            tileCoordinates.y += dy;
        }

        while(this.isObstacle(tileCoordinates)) tileCoordinates.y--;

        return tileCoordinates;
    }

    public getTileCoords(coordinates: Coordinates) {
        return {
            x: signDependantFloor(coordinates.x / this.tileSize.width),
            y: signDependantFloor(coordinates.y / this.tileSize.height),
        }
    }

    public getCoordsFromTile(tileCoordinates: Coordinates) {
        return {
            x: tileCoordinates.x * this.tileSize.width,
            y: tileCoordinates.y * this.tileSize.height,
        }
    }

    public getCurrentTileCoords = () => this.getTileCoords(this.getPlayerCoords());

    updateBoard(enteredNewTileCallback: (lastTile: Coordinates, currentTile: Coordinates) => void) {
        const currentTile = this.getCurrentTileCoords();

        if (!this.lastUpdateTileCoords || this.lastUpdateTileCoords.x !== currentTile.x || this.lastUpdateTileCoords.y !== currentTile.y) {
            this.generateObstacles(currentTile);
            this.pruneOffViewObstacles(currentTile);
            enteredNewTileCallback(this.lastUpdateTileCoords, currentTile);
        }

        this.lastUpdateTileCoords = currentTile;
    }
}