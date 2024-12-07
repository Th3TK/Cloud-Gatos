import { CHANCE_FOR_CLOUD, CLOUD_WIDTH, MAX_HEIGHT_CLOUDS, MIN_HEIGHT_CLOUDS, TILES_TO_NEW_GATO_HORIZONTAL, TILES_TO_NEW_GATO_VERTICAL } from "../config.ts";
import { Coordinates, Obstacles } from "../types/common.types.ts";
import { filterObject, signDependantFloor } from "../utils/misc.ts";
import { randomCoords } from "../utils/positioning.js";
import { seededPositionVal } from "../utils/seeds.ts";
import Cloud from "./Cloud.ts";

export default class Board {
    private seed: number;
    private gridSize: number;
    private viewRadius: number;
    private obstacles: Obstacles;
    private getPlayerCoords: () => Coordinates;

    constructor(seed: number, getPlayerCoords: () => Coordinates) {
        this.seed = seed;
        this.obstacles = {};
        this.getPlayerCoords = getPlayerCoords;
        this.setDimensions();

        this.getTileCoords = this.getTileCoords.bind(this);
    }

    public getObstacles = () => this.obstacles;

    private setDimensions() {
        this.gridSize = CLOUD_WIDTH;
        this.viewRadius = Math.ceil(window.innerWidth / CLOUD_WIDTH);
    }

    public isObstacle(tileCoordinates: Coordinates) {
        return (
            tileCoordinates.y >= -MAX_HEIGHT_CLOUDS &&
            tileCoordinates.y <= -MIN_HEIGHT_CLOUDS &&            
            seededPositionVal(this.seed, tileCoordinates.x, tileCoordinates.y) > (1 - CHANCE_FOR_CLOUD) &&
            tileCoordinates.x !== 0 &&
            tileCoordinates.y !== 0
        );
    }

    private generateObstacle(tileCoordinates: Coordinates) {
        if (tileCoordinates.x === 0 && tileCoordinates.y === 0) return;
        
        const id = `${tileCoordinates.x}:::${tileCoordinates.y}`;
        if (id in this.obstacles) return this.obstacles[id];

        if (!this.isObstacle(tileCoordinates)) return null;
        this.obstacles[id] = new Cloud(tileCoordinates, document.querySelector('#obstacleContainer') ?? document.body);
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

        console.log(tileCoordinates, this.isObstacle(tileCoordinates));
        while(!this.isObstacle(tileCoordinates)) {
            if( (x == y) || (x < 0 && x == -y) || (x > 0 && x == 1 - y)) {
                [dx, dy] = [-dy, dx];
            }
            x += dx;
            y += dy;
            tileCoordinates.x += dx;
            tileCoordinates.y += dy;
            console.log(tileCoordinates, this.isObstacle(tileCoordinates));
        }

        tileCoordinates.y--;

        return tileCoordinates;
    }

    updateObstaclesPositions() {
        for (const obstacle of Object.values(this.obstacles)) {
            console.log()
            obstacle.updatePosition(this.getCoordsFromTile(obstacle.tileCoordinates), this.getPlayerCoords());
        }
    }

    public getTileCoords(coordinates: Coordinates) {
        console.log(coordinates, this.gridSize)
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

    updateBoard(coordinates: Coordinates) {
        const currentTile = this.getCurrentTileCoords();

        this.generateObstacles(currentTile);
        this.pruneOffViewObstacles(currentTile);
        this.updateObstaclesPositions();
    }
}