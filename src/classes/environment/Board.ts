import SimplexNoise from 'simplex-noise';
import { CHANCE_FOR_CLOUD, CLOUD_WIDTH, MAX_HEIGHT_CLOUDS, MIN_HEIGHT_CLOUDS, TILES_TO_NEW_GATO_HORIZONTAL, TILES_TO_NEW_GATO_VERTICAL } from "../../config";
import { Coordinates, Obstacles } from "../../types/common.types";
import { filterObject, signDependantFloor } from "../../utils/misc";
import { randomCoords } from "../../utils/positioning.js";
import Cloud from "./Cloud";

export default class Board {
    private noise: SimplexNoise;
    private gridSize: number;
    private viewRadius: number;
    private obstacles: Obstacles;
    private container: HTMLElement;
    private lastUpdateTileCoords: Coordinates;
    private getPlayerCoords: () => Coordinates;

    constructor(seed: number, container: HTMLElement, getPlayerCoords: () => Coordinates) {
        this.noise = new SimplexNoise(seed);
        this.obstacles = {};
        this.container = container
        this.getPlayerCoords = getPlayerCoords;
        this.setDimensions();

        this.getTileCoords = this.getTileCoords.bind(this);
    }

    private setDimensions() {
        this.gridSize = CLOUD_WIDTH;
        this.viewRadius = Math.ceil(window.innerWidth / CLOUD_WIDTH / 2) + 1;
    }

    public getObstacles = () => this.obstacles;

    public isObjectInRenderedTiles = (playerCoords : Coordinates, objectCoords: Coordinates) => {
        const centerTile = this.getTileCoords(playerCoords);
        const objectTile = this.getTileCoords(objectCoords);
        return (
            objectTile.x <= centerTile.x + this.viewRadius &&
            objectTile.x >= centerTile.x - this.viewRadius &&
            objectTile.y <= centerTile.y + this.viewRadius &&
            objectTile.y >= centerTile.y - this.viewRadius
        );
    }

    public isObstacle({x, y}: Coordinates) {
        
        return (
            y >= -MAX_HEIGHT_CLOUDS &&
            y <= -MIN_HEIGHT_CLOUDS &&            
            x !== 0 &&
            y !== 0 &&
            this.noise.noise2D(x, y) > (1 - CHANCE_FOR_CLOUD)
        );
    }

    private generateObstacle(tileCoordinates: Coordinates) {
        if (tileCoordinates.x === 0 && tileCoordinates.y === 0) return;
        
        const id = `${tileCoordinates.x}:::${tileCoordinates.y}`;
        if (id in this.obstacles) return this.obstacles[id];

        if (!this.isObstacle(tileCoordinates)) return null;
        this.obstacles[id] = new Cloud(tileCoordinates, this.container);
    }

    generateObstacles(currentTile: Coordinates) {
        for (let dx = -this.viewRadius; dx <= this.viewRadius; dx++) {
            for (let dy = -this.viewRadius; dy <= this.viewRadius; dy++) {

                const tileCoordinates = {
                    x: currentTile.x + dx,
                    y: currentTile.y + dy,
                }

                this.generateObstacle(tileCoordinates);
            }
        }
    }

    pruneOffViewObstacles(currentTile: Coordinates) {
        const [minH, maxH, minV, maxV] = [
            currentTile.x - this.viewRadius,
            currentTile.x + this.viewRadius,
            currentTile.y - this.viewRadius,
            currentTile.y + this.viewRadius
        ];

        const isInView = (obstacle: Cloud) =>
            obstacle.tileCoordinates.x >= minH && obstacle.tileCoordinates.x <= maxH &&
            obstacle.tileCoordinates.y >= minV && obstacle.tileCoordinates.y <= maxV;
            
        this.obstacles = filterObject(this.obstacles, (obstacle: Cloud) => {
            if (isInView(obstacle)) return true;

            obstacle.element.remove();
        });
    }

    public getTileForGato() : Coordinates{
        const tileCoordinates = randomCoords(this.getCurrentTileCoords(), TILES_TO_NEW_GATO_HORIZONTAL, TILES_TO_NEW_GATO_VERTICAL);
        tileCoordinates.y = -tileCoordinates.y;

        let [x, y, dx, dy] = [0, 0, 0, -1];

        while(!this.isObstacle(tileCoordinates)) {
            if( (x == y) || (x < 0 && x == -y) || (x > 0 && x == 1 - y)) {
                [dx, dy] = [-dy, dx];
            }
            x += dx;
            y += dy;
            tileCoordinates.x += dx;
            tileCoordinates.y += dy;
        }

        tileCoordinates.y--;

        return tileCoordinates;
    }

    updateObstaclesPositions() {
        for (const obstacle of Object.values(this.obstacles)) {
            obstacle.updatePosition(this.getCoordsFromTile(obstacle.tileCoordinates), this.getPlayerCoords());
        }
    }

    public getTileCoords(coordinates: Coordinates) {
        return {
            x: signDependantFloor(coordinates.x / this.gridSize),
            y: signDependantFloor(coordinates.y / this.gridSize),
        }
    }

    public getCoordsFromTile(tileCoordinates: Coordinates) {
        return {
            x: tileCoordinates.x * this.gridSize,
            y: tileCoordinates.y * this.gridSize,
        }
    }

    getCurrentTileCoords = () => this.getTileCoords(this.getPlayerCoords());

    updateBoard() {
        const currentTile = this.getCurrentTileCoords();

        if(!this.lastUpdateTileCoords || this.lastUpdateTileCoords.x !== currentTile.x || this.lastUpdateTileCoords.y !== currentTile.y) {
            this.generateObstacles(currentTile);
            this.pruneOffViewObstacles(currentTile);

        }
        this.updateObstaclesPositions();

        this.lastUpdateTileCoords = currentTile;
    }
}