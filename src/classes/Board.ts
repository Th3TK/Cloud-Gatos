import { CHANCE_FOR_CLOUD, CLOUD_WIDTH, MAX_HEIGHT_CLOUDS, MIN_HEIGHT_CLOUDS, TILES_TO_NEW_GATO_HORIZONTAL, TILES_TO_NEW_GATO_VERTICAL } from "../config.ts";
import { Coordinates } from "../types/common.types.ts";
import { filterObject, signDependantFloor } from "../utils/misc.ts";
import { getPos, randomCoords } from "../utils/positioning.js";
import { seededPositionVal } from "../utils/seeds.ts";
import Cloud from "./Cloud.ts";

export default class Board {
    seed: number;
    gridSize: number;
    viewRadius: number;
    obstacles: {[x: string]: Cloud};
    playerPosition: Coordinates;

    constructor(seed: number, playerPosition: Coordinates) {
        this.seed = seed;
        this.obstacles = {};
        this.playerPosition = playerPosition;
        this.setDimensions();
    }

    setDimensions() {
        this.gridSize = CLOUD_WIDTH;
        this.viewRadius = Math.ceil(window.innerWidth / CLOUD_WIDTH);
    }

    isObstacle(tileCoordinates: Coordinates) {
        return (
            tileCoordinates.y <= MAX_HEIGHT_CLOUDS &&
            tileCoordinates.y >= MIN_HEIGHT_CLOUDS &&            
            seededPositionVal(this.seed, tileCoordinates.x, tileCoordinates.y) > (1 - CHANCE_FOR_CLOUD)
        );
    }

    generateObstacle(tileCoordinates: Coordinates) {
        if (tileCoordinates.x === 0 && tileCoordinates.y === 0) return;
        
        const id = `${tileCoordinates.x}:::${tileCoordinates.y}`;
        if (id in this.obstacles) return this.obstacles[id];

        if (!this.isObstacle(tileCoordinates)) return null;
        this.obstacles[id] = new Cloud(tileCoordinates, document.body);
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

    getTileForGato(){
        const tileCoordinates = randomCoords(this.getCurrentTileCoords(), TILES_TO_NEW_GATO_HORIZONTAL, TILES_TO_NEW_GATO_VERTICAL);

        let [x, y, dx, dy] = [0, 0, 0, -1];

        while(!this.isObstacle(tileCoordinates)) {
            
        }
    }

    updateObstaclesPositions() {
        for (const obstacle of Object.values(this.obstacles)) {
            const position = this.getObstaclePosition(obstacle.tileCoordinates);
            obstacle.updatePosition(position);
        }
    }

    getObstaclePosition(tileCoordinates: Coordinates) {
        return getPos({
            x: tileCoordinates.x * this.gridSize, 
            y: tileCoordinates.y * this.gridSize}, this.playerPosition, CLOUD_WIDTH);
    }

    getTileCoords(coordinates: Coordinates) {
        return {
            x: signDependantFloor(coordinates.x / this.gridSize),
            y: signDependantFloor(coordinates.y / this.gridSize),
        }
    }

    getCurrentTileCoords = () => this.getTileCoords(this.playerPosition);

    updateBoard(coordinates: Coordinates) {
        this.playerPosition = coordinates;
        const currentTile = this.getCurrentTileCoords();

        this.generateObstacles(currentTile);
        this.pruneOffViewObstacles(currentTile);
        this.updateObstaclesPositions();
    }
}