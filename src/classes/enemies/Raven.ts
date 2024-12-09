import { Coordinates, CoordinatesPair, Movement } from "../../types/common.types";
import Carrier from "../core/Carrier";
import Board from "../environment/Board";
import Gato from "../game/Gato";
import Player from "../game/Player";
import { EnemyTargets } from "../../types/enemies.types";
import { PATHFINDING_GRID_RANGE, RAVEN_SPEED, RAVEN_SPEED_STEAL, RAVEN_SPEED_WITH_GATO } from "../../config";
import { addCoords, coordinatesEqual, offsetCoords, pairToCoords, reverseOffsetCoords, straightLineDistance } from "../../utils/positioning";
import { clamp, clampEqual } from "../../utils/misc";
import { AStarFinder } from 'astar-typescript';


export default class Raven extends Carrier {
    private path: undefined | CoordinatesPair[];
    private board: Board;
    private target: EnemyTargets;
    private canAttack = true;
    private hidden = false;

    constructor(container: HTMLElement, board: Board) {
        super(null, { x: 1000, y: 1000 });
        this.board = board;
        this.createRaven(container);

        this.followPath = this.followPath.bind(this);
        this.pathfind = this.pathfind.bind(this);
        this.startAttackCooldown = this.startAttackCooldown.bind(this);
    }

    public hide = () => {
        if(!this.element) return;
        this.element.style.display = 'none';
        this.hidden = true;
    }
    public show = () => {
        if(!this.element) return;
        this.element.style.display = '';
        this.hidden = false;
    }

    public isHidden = () => this.hidden;


    public setTarget = (target: EnemyTargets) => {
        this.target = target;
        this.path = undefined;
        this.startAttackCooldown()
    };
    public clearTarget = () => this.target = null;

    private createRaven(container: HTMLElement) {
        this.element = document.createElement('div');
        this.element.classList.add('raven');

        container.appendChild(this.element);
    }

    public startAttackCooldown(){
        this.canAttack = false;
        setTimeout(() => this.canAttack = true, 1000);
    }

    private attack() {
        if(!this.target) return;
        const targetCoords = this.target?.getCoords();
        const currentCoords = this.getCoords();
        console.log('atak!')

        this.move({
            x: clampEqual(targetCoords.x - currentCoords.x, RAVEN_SPEED_STEAL),
            y: clampEqual(targetCoords.y - currentCoords.y, RAVEN_SPEED_STEAL),
        })
    }

    public pathfind(matrix: number[][], toTile: Coordinates) {
        const astar = new AStarFinder({
            grid: {
                matrix: matrix
            },
            diagonalAllowed: false,
            includeStartNode: true,
            includeEndNode: true,
            allowPathAsCloseAsPossible: true
        });
        const currentPlayerTile = this.board.getCurrentTileCoords();
        const offset = { x: currentPlayerTile.x - PATHFINDING_GRID_RANGE, y: currentPlayerTile.y - PATHFINDING_GRID_RANGE};
        const start = offsetCoords(this.board.getTileCoords(this.getCoords()), offset);
        const goal = offsetCoords(toTile, offset)

        start.x = clamp(start.x, PATHFINDING_GRID_RANGE * 2, 0);
        start.y = clamp(start.y, PATHFINDING_GRID_RANGE * 2, 0);
        goal.x = clamp(goal.y, PATHFINDING_GRID_RANGE * 2, 0);
        goal.y = clamp(goal.y, PATHFINDING_GRID_RANGE * 2, 0);

        this.path = astar.findPath(start, goal) as CoordinatesPair[];
        this.path.shift();
    }

    public followPath() {
        const size = this.board.getTileSize();
        const proximity = this.target && straightLineDistance(this.target.getCoords(), this.getCoords()) < Math.max(size.horizontal, size.vertical);
        if(proximity && this.canAttack) this.attack();
        if(proximity || !this.path?.length) return true;
        
        const currentPlayerTile = this.board.getCurrentTileCoords();
        const offset = { x: currentPlayerTile.x - PATHFINDING_GRID_RANGE, y: currentPlayerTile.y - PATHFINDING_GRID_RANGE};
        const nextMove = this.path[0];
        const nextTile = reverseOffsetCoords(pairToCoords(nextMove), offset);
        const nextTileCoords = this.board.getCoordsFromTile(nextTile);
        const currentCoords = this.getCoords();

        if(this.board.isObstacle(nextTile)) console.error("Invalid raven move: ", nextMove, "Tile: ", nextTile, "Path: ", this.path)
        
        const holdingGato = !!this.getPickable();
        const speed = holdingGato ? RAVEN_SPEED : RAVEN_SPEED_WITH_GATO;

        this.move({
            x: clampEqual(nextTileCoords.x - currentCoords.x, speed),
            y: clampEqual(nextTileCoords.y - currentCoords.y, speed),
        })

        if(coordinatesEqual(nextTileCoords, this.getCoords())) {
            this.path.shift();
        }

        return !this.path?.length;
    }
}