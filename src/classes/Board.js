import { CHANCE_FOR_CLOUD, CLOUD_WIDTH } from "../config.js";
import { filterObject, signDependantFloor } from "../utils/misc.js";
import { seededPositionVal } from "../utils/seeds.js";
import Cloud from "./cloud.js";

export default class Board {
    constructor(player, seed) {
        this.player = player;
        this.seed = seed;
        this.obstacles = {};
        this.setDimensions();
    }

    setDimensions() {
        this.gridSize = CLOUD_WIDTH;
        this.viewRadius = Math.ceil(window.innerWidth / CLOUD_WIDTH);
    }

    generateObstacle(tileX, tileY) {
        if (tileX === 0 && tileY === 0) return;

        const id = `${tileX}:::${tileY}`;
        if (id in this.obstacles) return this.obstacles[id];

        const isObstacle = seededPositionVal(this.seed, tileX, tileY) > (1 - CHANCE_FOR_CLOUD);
        if (!isObstacle) return null;

        this.obstacles[id] = new Cloud(tileX, tileY);
    }

    generateObstacles(gridX, gridY) {
        for (let dx = -this.viewRadius; dx <= this.viewRadius; dx++) {
            for (let dy = -this.viewRadius; dy <= this.viewRadius; dy++) {
                const tileX = gridX + dx;
                const tileY = gridY + dy;

                this.generateObstacle(tileX, tileY);
            }
        }
    }

    pruneOffViewObstacles(gridX, gridY) {
        const [minH, maxH, minV, maxV] = [
            gridX - this.viewRadius,
            gridX + this.viewRadius,
            gridY - this.viewRadius,
            gridY + this.viewRadius
        ];

        const isInView = (obstacle) =>
            obstacle.gridX >= minH && obstacle.gridX <= maxH &&
            obstacle.gridY >= minV && obstacle.gridY <= maxV;
            
        this.obstacles = filterObject(this.obstacles, (obstacle) => {
            if (isInView(obstacle)) return true;

            obstacle.element.remove();
        });
    }

    updateObstaclesPositions() {
        for (const obstacle of Object.values(this.obstacles)) {
            const { posX, posY } = this.getObstaclePosition(obstacle.gridX, obstacle.gridY);
            obstacle.updatePosition(posX, posY)
        }
    }

    getObstaclePosition(tileX, tileY) {
        return {
            posX: tileX * this.gridSize - this.player.posX + window.innerWidth / 2 - CLOUD_WIDTH / 2,
            posY: tileY * this.gridSize - this.player.posY + window.innerHeight / 2 - CLOUD_WIDTH / 2,
        }
    }

    getCurrentTileCoords() {
        return {
            gridX: signDependantFloor(this.player.posX / this.gridSize),
            gridY: signDependantFloor(this.player.posY / this.gridSize)
        }
    }

    handleCollisions(movementX, movementY) {
        const { gridX, gridY } = this.getCurrentTileCoords();
        const movement = {x: movementX, y: movementY};
        const playerRect = this.player.element.getBoundingClientRect();

        for (const obstacle of Object.values(this.obstacles)) {
            if(!(Math.abs(obstacle.gridX - gridX) <= 1 || Math.abs(obstacle.gridY - gridY) <= 1)) continue;
            
            const rect = obstacle.element.getBoundingClientRect();

            const horizontalBounds = playerRect.x < rect.x + rect.width && playerRect.x + playerRect.width > rect.x;
            const verticalBounds = playerRect.y < rect.y + rect.height && playerRect.y + playerRect.height > rect.y;

            const horizontalBoundsAfterMove = playerRect.x + movement.x < rect.x + rect.width && playerRect.x + playerRect.width + movement.x  > rect.x;
            const verticalBoundsAfterMove = playerRect.y + movement.y  < rect.y + rect.height && playerRect.y + playerRect.height + movement.y  > rect.y;
            
            if(horizontalBoundsAfterMove && verticalBounds) movement.x = 0;
            if(horizontalBounds && verticalBoundsAfterMove) movement.y = 0;
        }

        return movement;
    }

    updateBoard() {
        const { gridX, gridY } = this.getCurrentTileCoords();

        this.generateObstacles(gridX, gridY);
        this.pruneOffViewObstacles(gridX, gridY);
        this.updateObstaclesPositions();
    }

    updatePositions(movementX, movementY) {
        if (!movementX && !movementY) return;
        console.log(movementX)
        const handledMovement = this.handleCollisions(movementX, movementY);

        this.player.move(handledMovement.x, handledMovement.y);
        this.updateBoard();
    }
}