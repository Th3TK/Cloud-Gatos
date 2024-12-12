import SimplexNoise from 'simplex-noise';
import { Coordinates, Sizes, } from "../../types/common.types";
import { filterObject, matrixFrom } from "../../utils/misc";
import { offsetCoords, randomCoords } from "../../utils/positioning.js";
import Obstacle from "./Obstacle.js";
import { DirectionValues, Obstacles } from '../../types/board.types.js';
import Player from '../game/Player.js';
import { ASTAR, BOARD, GAME, GATO } from '../../config/_config.js';
import PathfindingMatrix from '../core/PathfindingMatrix.js';
import { AStarFinder } from 'astar-typescript';

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
        this.tileSize = BOARD.TILE_SIZES;
        this.viewRadius = {
            horizontal: Math.min(Math.ceil(window.innerWidth / this.tileSize.width), GAME.BOARD_MAX_RENDER_DISTANCE),
            vertical: Math.min(Math.ceil(window.innerHeight / this.tileSize.height), GAME.BOARD_MAX_RENDER_DISTANCE)
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
        if (y < -BOARD.MAX_HEIGHT_CLOUDS || y > -BOARD.MIN_HEIGHT_CLOUDS || (x === 0 && y === 0)) return 0;

        const value = this.noise.noise2D(x, y);

        if (value < 0.45) return 0;
        return 1;
    }

    private generateObstacle(tileCoordinates: Coordinates) {
        if (tileCoordinates.x === 0 && tileCoordinates.y === 0) return;

        const id = `${tileCoordinates.x}:::${tileCoordinates.y}`;
        if (id in this.obstacles) return this.obstacles[id];

        if (!this.isObstacle(tileCoordinates)) return null;
        const tileNoiseValue = this.noise.noise2D(tileCoordinates.x, tileCoordinates.y);

        this.obstacles[id] = new Obstacle(tileCoordinates, this.tileSize, tileNoiseValue);
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

    private ensureTileIsReachable (startTile: Coordinates, endTile: Coordinates) : Boolean {
        const range = Math.abs(startTile.x - endTile.x);
        const pathfindingMatrix = new PathfindingMatrix(this, range * 2 + 1);
        const finder = new AStarFinder({...ASTAR, grid: {matrix: pathfindingMatrix.getMatrix()}});

        const offset = {x: endTile.x - range, y: endTile.y - range};
        const start = offsetCoords(endTile, offset);
        const goal = offsetCoords(startTile, offset);

        try {
            return !!finder.findPath(start, goal).length;
        }
        catch {
            return false;
        }
    }

    public getTileForGato(centerTile: Coordinates = this.getCurrentTileCoords()): Coordinates {
        let tileCoordinates = randomCoords(centerTile, GATO.SPAWN_DISTANCE_HORIZONTAL, GATO.SPAWN_DISTANCE_VERTICAL);
        tileCoordinates.y = tileCoordinates.y;

        let [x, y, dx, dy] = [0, 0, 0, -1];

        const next = () => {
            if ((x == y) || (x < 0 && x == -y) || (x > 0 && x == 1 - y)) {
                [dx, dy] = [-dy, dx];
            }
            x += dx;
            y += dy;
            tileCoordinates.x += dx;
            tileCoordinates.y += dy;
        }
        
        let found = false;
        while(!found) {
            // find an obstacle tile for the gato to sit on (searches in a snake around the tile)
            while (!this.isObstacle(tileCoordinates)) next();

            // then move up since we want the gato to sit on the obstacle, not inside
            const tileCoordinatesCopy = structuredClone(tileCoordinates);
            while(this.isObstacle(tileCoordinatesCopy)) tileCoordinatesCopy.y--;

            if(this.ensureTileIsReachable(centerTile, tileCoordinatesCopy)) {
                tileCoordinates = tileCoordinatesCopy;
                found = true;
            }
            else next();
        }

        return tileCoordinates;
    }

    public getTileCoords(coordinates: Coordinates) {
        return {
            x: Math.floor(coordinates.x / this.tileSize.width),
            y: Math.floor(coordinates.y / this.tileSize.height),
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