import { Coordinates, CoordinatesPair } from "../../types/common.types";
import Carrier from "../core/Carrier";
import Board from "../environment/Board";
import { EnemyTargets } from "../../types/enemies.types";
import { coordinatesEqual, offsetCoords, pairToCoords, reverseOffsetCoords, straightLineDistance } from "../../utils/positioning";
import { clamp, clampEqual } from "../../utils/misc";
import { AStarFinder } from 'astar-typescript';
import { RAVEN, GAME, ASTAR } from '../../config/_config';

export default class Raven extends Carrier {
    private path: undefined | Coordinates[];
    private board: Board;
    private target: EnemyTargets;
    private canAttack = true;
    private hidden = false;

    constructor(board: Board) {
        super({x: -5000, y: 0}, RAVEN.SIZES);
        this.board = board;

        this.followPath = this.followPath.bind(this);
        this.pathfind = this.pathfind.bind(this);
        this.startAttackCooldown = this.startAttackCooldown.bind(this);

        this.addTextureHandler(RAVEN.TEXTURE_KEYS);
        this.textureHandler!.addAnimation(RAVEN.TEXTURE_KEYS.map(key => ({textureKey: key, duration: RAVEN.ANIMATION_KEYFRAME_DURATION})));
        this.textureHandler!.startAnimation(true);
    }

    public hide = () => {
        this.hidden = true;
        this.textureHandler!.pauseAnimation();
    }
    public show = () => {
        this.hidden = false;
        this.textureHandler!.resumeAnimation();
    }

    public isHidden = () => this.hidden;

    public setTarget = (target: EnemyTargets) => {
        this.target = target;
        this.path = undefined;
        this.startAttackCooldown()
    };

    public getTarget = () => this.target;

    public clearTarget = () => this.target = null;

    public startAttackCooldown(){
        this.canAttack = false;
        setTimeout(() => this.canAttack = true, 1000);
    }

    public getOffset = (playerTile: Coordinates) => ({ 
        x: playerTile.x - GAME.PATHFINDING_GRID_RANGE, 
        y: playerTile.y - GAME.PATHFINDING_GRID_RANGE,
    })

    public getPath = () => this.path;

    public setPath = (path: Coordinates[]) => this.path = path;

    private attack() {
        if(!this.target) return;
        const targetCoords = this.target?.getCoords();
        const currentCoords = this.getCoords();
        console.log('atak!')

        this.move({
            x: clampEqual(targetCoords.x - currentCoords.x, RAVEN.SPEED_STEAL),
            y: clampEqual(targetCoords.y - currentCoords.y, RAVEN.SPEED_STEAL),
        })
    }

    private preparePath(path: CoordinatesPair[]) {
        path.shift();

        const currentCoords = this.getCoords();
        const ravenSizes = this.getSizes();
        const tileSizes = this.board.getTileSize();
        
        const pathOfCoords = path
            .map(move => this.pathElementToCoords(move))
            .map(({x, y}) => ({
                x: x - currentCoords.x + (tileSizes.width - ravenSizes.width) / 2,
                y: y - currentCoords.y + (tileSizes.height - ravenSizes.height) / 2
            }));

        this.path = pathOfCoords;
    }

    public pathfind(matrix: number[][], toTile: Coordinates) {
        const astar = new AStarFinder({...ASTAR, grid: {matrix}});
        const currentPlayerTile = this.board.getCurrentTileCoords();
        const offset = this.getOffset(currentPlayerTile);
        const start = offsetCoords(this.board.getTileCoords(this.getCoords()), offset);
        const goal = offsetCoords(toTile, offset)

        const max = GAME.PATHFINDING_GRID_RANGE * 2;
        start.x = clamp(start.x, max, 0) || 1;
        start.y = clamp(start.y, max, 0) || 1;
        goal.x = clamp(goal.y, max, 0) || 1;
        goal.y = clamp(goal.y, max, 0) || 1;

        if(this.board.isObstacle(toTile)) console.error(`Goal:\n${toTile}\n is an obstacle!`)
        const path = astar.findPath(start, goal) as CoordinatesPair[];

        this.preparePath(path);
    }

    public pathElementToCoords = (move: CoordinatesPair) => {
        const currentPlayerTile = this.board.getCurrentTileCoords();
        const offset = this.getOffset(currentPlayerTile);
        const nextTile = reverseOffsetCoords(pairToCoords(move), offset);
        return this.board.getCoordsFromTile(nextTile);
    }

    public followPath() {
        const size = this.board.getTileSize();
        const proximity = this.target && straightLineDistance(this.target.getCoords(), this.getCoords()) < Math.max(size.width, size.height);
        
        if(proximity && this.canAttack) {
            this.attack();
            return true;
        };

        if(!this.path?.length) return true;
        
        const nextMove = this.path[0];
        const holdingGato = !!this.getPickable();
        const speed = holdingGato ? RAVEN.SPEED_ESCAPE : RAVEN.SPEED_NORMAL;

        this.move({
            x: clampEqual(nextMove.x, speed),
            y: clampEqual(nextMove.y, speed),
        });

        if(nextMove.x) this.textureHandler?.setFlippedHorizontally(nextMove.x > 0)
        
        if(coordinatesEqual(nextMove, this.getCoords())) this.path.shift(); 
        return !this.path?.length;
    }
}