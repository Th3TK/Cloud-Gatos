import BOARD from "../../config/board.config";
import GAME from "../../config/game.config";
import { Coordinates, Direction } from "../../types/common.types";
import { Enemy, EnemyModes, EnemyTargets } from "../../types/enemies.types";
import { matrixFrom, randomChoice } from "../../utils/misc";
import { reverseOffsetCoords, straightLineDistance } from "../../utils/positioning";
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
        this.pathfindingMatrixSize = GAME.PATHFINDING_GRID_RANGE * 2 + 1;

        this.initializePathfindingMatrix();
        this.shiftPathFindingMatrix = this.shiftPathFindingMatrix.bind(this);
    }

    private initializePathfindingMatrix = () => {
        const currentPlayerTile = this.board.getCurrentTileCoords();

        const getMatrixCoordinates = (offsetX: number = 0, offsetY: number = 0) => ({
            x: offsetX + currentPlayerTile.x - GAME.PATHFINDING_GRID_RANGE,
            y: offsetY + currentPlayerTile.y - GAME.PATHFINDING_GRID_RANGE,
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
            const x = playerToTheRight(enemy) ? 0 : this.pathfindingMatrixSize - 1;
            const y = currentPlayerTile.y;
            const offset = enemy.getOffset(currentPlayerTile);
            const tile = reverseOffsetCoords({x, y}, offset);

            while(this.board.isObstacle(tile)) tile.x += x > 0 ? -1 : 1;
            return tile;
        }

        const targetGetters = {
            'disengage': (enemy: Enemy) => escapeCoords(enemy),
            'escape': (enemy: Enemy) => escapeCoords(enemy),
            'attack': (enemy: Enemy) => this.board.getTileCoords(enemy.getTarget()!.getCoords()),
        }

        return targetGetters[this.mode](enemy);
    }
    

    // true if successful gato steal 
    private tryStealingGato = (enemy: Enemy) => {
        if(!this.gato || this.mode !== 'attack') return false;
        
        const pickedGato = enemy.tryPick(this.gato);
        if(pickedGato) this.enterEscapeMode();
        return pickedGato;
    }

    private spawn(enemy: Enemy) {
        
        enemy.setPath([]);

        const enemyCoords = enemy.getCoords();
        const playerCoords = this.player.getCoords();
        const playerSizes = this.player.getSizes();

        const spawnCoords = {
            x: randomChoice([playerCoords.x - 2000, playerCoords.x + 2000]),
            y: playerCoords.y,
        }

        while(this.board.isObstacle(this.board.getTileCoords(spawnCoords))) 
            spawnCoords.x += (spawnCoords.x > playerCoords.x ? BOARD.TILE_SIZES.width : -BOARD.TILE_SIZES.width);

        enemy.setCoords(spawnCoords)

        console.log(playerCoords, enemy.getCoords(), enemy.getPath());


        enemy.show();
    }

    private isEnemyOutOfView = (enemy: Enemy) => straightLineDistance(this.player.getCoords(), enemy.getCoords()) > GAME.BOARD_MAX_RENDER_DISTANCE * this.board.getTileSize().width;

    // returns the enemy that stole the gato
    public updateEnemies = () => this.enemies.find(enemy => {
        if(this.mode === 'disengage' && enemy.isHidden()) return;
        if(this.mode === 'disengage' && this.isEnemyOutOfView(enemy)) enemy.hide();
        if(this.mode !== 'disengage' && enemy.isHidden()) this.spawn(enemy);

        enemy.pathfind(this.pathfindingMatrix, this.getTargetTileCoords(enemy));
        enemy.followPath();

        if(this.mode === 'attack') return this.tryStealingGato(enemy);
    });
}