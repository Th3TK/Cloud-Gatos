import { Coordinates, CoordinatesPair } from "../../types/common.types";
import Carrier from "../core/Carrier";
import Board from "../environment/Board";
import { EnemyTargets } from "../../types/enemies.types";
import { coordinatesEqual, offsetCoords, pairToCoords, reverseOffsetCoords, straightLineDistance } from "../../utils/positioning";
import { clamp, clampEqual } from "../../utils/misc";
import { AStarFinder } from 'astar-typescript';
import { RAVEN, GAME, ASTAR } from '../../config/_config';


export default class Raven extends Carrier {
    private path: undefined | CoordinatesPair[];
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

    public setPath = (path: CoordinatesPair[]) => this.path = path;

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
        this.path = astar.findPath(start, goal) as CoordinatesPair[];
        this.path.shift();
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
        
        const ravenSizes = this.getSizes();
        const tileSizes = this.board.getTileSize();
        const nextTileCoords = this.pathElementToCoords(this.path[0]);
        const currentCoords = this.getCoords();
        const holdingGato = !!this.getPickable();
        const speed = holdingGato ? RAVEN.SPEED_ESCAPE : RAVEN.SPEED_NORMAL;

        const x = clampEqual(nextTileCoords.x - currentCoords.x + (tileSizes.width - ravenSizes.width) / 2, speed);
        const y = clampEqual(nextTileCoords.y - currentCoords.y + (tileSizes.height - ravenSizes.height) / 2, speed);

        console.log(x)

        this.move({x, y});
        if(x) this.textureHandler?.setFlippedHorizontally(x > 0)
        
        if(coordinatesEqual(nextTileCoords, this.getCoords())) this.path.shift(); //
        return !this.path?.length;
    }
}