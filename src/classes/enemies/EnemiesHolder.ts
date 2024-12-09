import { PATHFINDING_GRID_RANGE } from "../../config";
import { Coordinates, Direction } from "../../types/common.types";
import { Enemy, EnemyModes, EnemyTargets } from "../../types/enemies.types";
import { clamp, isInViewport, matrixFrom } from "../../utils/misc";
import { reverseOffsetCoords, subtractCoords } from "../../utils/positioning";
import Board from "../environment/Board";
import Gato from "../game/Gato";
import Player from "../game/Player";

export default class EnemiesHolder {
    private enemies: Enemy[] = [];
    private mode: EnemyModes;
    private board: Board;
    private player: Player;
    private gato?: Gato;
    private pathfindingMatrix: number[][];
    private pathfindingMatrixSize: number;
    pathfindingMatrixCornerCoords: Coordinates; // holds the real tile coordinates of the upper left corner of the grid;

    constructor(board: Board, player: Player, gato?: Gato) {
        this.player = player;
        this.gato = gato;
        this.board = board;
        this.pathfindingMatrixSize = PATHFINDING_GRID_RANGE * 2 + 1;

        this.initializePathfindingMatrix();
        this.shiftPathFindingMatrix = this.shiftPathFindingMatrix.bind(this);
    }

    private initializePathfindingMatrix = () => {
        const currentPlayerTile = this.board.getCurrentTileCoords();

        const getMatrixCoordinates = (offsetX: number = 0, offsetY: number = 0) => ({
            x: offsetX + currentPlayerTile.x - PATHFINDING_GRID_RANGE,
            y: offsetY + currentPlayerTile.y - PATHFINDING_GRID_RANGE,
        })

        this.pathfindingMatrixCornerCoords = getMatrixCoordinates();

        const matrix = matrixFrom(this.pathfindingMatrixSize, (y, x) =>
            this.board.isObstacle(getMatrixCoordinates(x, y))
        );

        this.pathfindingMatrix = matrix;

    }

    /* .................................. */
    /*         setters, getters           */
    /* .................................. */

    public getMode = (): EnemyModes => this.mode;
    public setMode = (value: EnemyModes) => {this.mode = value;}
    public getEnemies = (): Enemy[] => this.enemies;
    public addEnemy = (enemy: Enemy) => {this.enemies.push(enemy)};
    public setTarget = (target: EnemyTargets) => this.enemies.forEach(enemy => enemy.setTarget(target));
    public clearTarget = () => this.enemies.forEach(enemy => enemy.clearTarget());
    public assignGato = (gato: Gato) => this.gato = gato;

    /* .................................. */
    /*               matrix               */
    /* .................................. */
    public getPathFindingMatrix = () => this.pathfindingMatrix;

    // loads (adds) new tiles from the specified direction and unloads (removes) tiles from the other direction
    // when the player moves left, the pathfinding matrix render distance shifts to the left
    // this function is for adding these newly loaded tiles and removing the ones that should no longer be rendered (in this case, the last, rightest column)
    public shiftPathFindingMatrix = (direction: Direction) => {
        const createRow = (yOffset: number) =>
            Array.from({ length: this.pathfindingMatrixSize }, (_, dx) =>
                this.board.isObstacle({
                    x: this.pathfindingMatrixCornerCoords.x + dx,
                    y: this.pathfindingMatrixCornerCoords.y + yOffset
                })
            );

        const createColumn = (xOffset: number) =>
            this.pathfindingMatrix.map((_, dy) =>
                this.board.isObstacle({
                    x: this.pathfindingMatrixCornerCoords.x + xOffset,
                    y: this.pathfindingMatrixCornerCoords.y + dy
                })
            );

        const addRowTop = () => this.pathfindingMatrix.unshift(createRow(-1));

        const addRowBottom = () => this.pathfindingMatrix.push(createRow(this.pathfindingMatrixSize));

        const addColumnLeft = () => {
            const column = createColumn(-1);
            this.pathfindingMatrix.forEach((row, i) => row.unshift(column[i]));
        };

        const addColumnRight = () => {
            const column = createColumn(this.pathfindingMatrixSize);
            this.pathfindingMatrix.forEach((row, i) => row.push(column[i]));
        };

        const removeRowBottom = () => this.pathfindingMatrix.pop();
        const removeRowTop = () => this.pathfindingMatrix.shift();
        const removeColumnRight = () => this.pathfindingMatrix.forEach(row => row.pop());
        const removeColumnLeft = () => this.pathfindingMatrix.forEach(row => row.shift());

        switch (direction) {
            case "up":
                addRowTop();
                removeRowBottom();
                this.pathfindingMatrixCornerCoords.y--;
                break;
            case "down":
                addRowBottom();
                removeRowTop();
                this.pathfindingMatrixCornerCoords.y++;
                break;
            case "left":
                addColumnLeft();
                removeColumnRight();
                this.pathfindingMatrixCornerCoords.x--;
                break;
            case "right":
                addColumnRight();
                removeColumnLeft();
                this.pathfindingMatrixCornerCoords.x++;
                break;
        }

    }

    /* .................................. */
    /*               modes                */
    /* .................................. */

    public enterAttackMode() {
        if(!this.gato) return false;
        this.setTarget(this.player.getPickable() ? this.player : this.gato);
        this.setMode('attack');
        return true;
    }

    public enterDisengageMode() {
        this.setTarget(null);
        this.setMode('disengage');
    }

    public enterEscapeMode() {
        this.setTarget(null);
        this.setMode('escape');
    }

    /* .................................. */
    /*              updates               */
    /* .................................. */

    private getTargetTileCoords(enemy: Enemy) : Coordinates {
        const currentPlayerTile = this.board.getCurrentTileCoords();
        const playerToTheRight = (enemy: Enemy) => currentPlayerTile.x - this.board.getTileCoords(enemy.getCoords()).x > 0;
        
        // furthest point away from the player in the x direction:
        const escapeCoords = (enemy: Enemy) => {
            const difference = subtractCoords(currentPlayerTile, this.board.getTileCoords(enemy.getCoords()));

            const x = playerToTheRight(enemy) ? 0 : this.pathfindingMatrixSize - 1;
            const y = clamp(Math.floor(Math.abs(x / (difference.x || 1))) * difference.y, this.pathfindingMatrixSize - 1, 0);
            const offset = { x: currentPlayerTile.x - PATHFINDING_GRID_RANGE, y: currentPlayerTile.y - PATHFINDING_GRID_RANGE};

            const tile = reverseOffsetCoords({x, y}, offset);
            while(this.board.isObstacle(tile)) tile.x += x > 0 ? -1 : 1;
            return tile;
        }

        const targetGetters = {
            'disengage': (enemy: Enemy) => escapeCoords(enemy),
            'escape': (enemy: Enemy) => escapeCoords(enemy),
            'attack': () => currentPlayerTile,
        }

        return targetGetters[this.mode](enemy);
    }

    // boolean indicating if enemy is hidden
    private updateVisibility = (enemy: Enemy) => {
        if(this.mode !== 'disengage') {
            if(enemy.isHidden()) enemy.show();
            return true;
        }

        if(enemy.isHidden()) return false;
        if(enemy.element && !isInViewport(enemy.element)) enemy.hide();
        return !enemy.isHidden();
    }

    // true if successful gato steal 
    private tryStealingGato = (enemy: Enemy) => {
        console.log(this.gato, this.mode)
        if(!this.gato || this.mode !== 'attack') return false;
        
        const pickedGato = enemy.tryPick(this.gato);
        if(pickedGato) this.enterEscapeMode();
        return pickedGato;
    }
    
    public runEnemyUpdate = () => {
        if(this.mode !== 'attack') return;
        this.enemies.forEach(enemy => {
            enemy.pathfind(this.pathfindingMatrix, this.getTargetTileCoords(enemy)); 
        });
    }

    // returns the enemy that stole the gato
    public updatePositions = () => {
        return this.enemies.find(enemy => {
            const shown = this.updateVisibility(enemy);
            if(!shown) return;

            const pathFinished = enemy.followPath();
            enemy.updatePosition(this.player.getCoords());
            if(pathFinished) enemy.pathfind(this.pathfindingMatrix, this.getTargetTileCoords(enemy));

            return this.tryStealingGato(enemy);
        });
    }
}