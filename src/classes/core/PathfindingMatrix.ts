import { Coordinates, Direction } from "../../types/common.types";
import { squareMatrixFrom } from "../../utils/misc";
import Board from "../environment/Board";

export default class PathfindingMatrix {
    private matrix: number[][];
    private size: number;
    private cornerCoords: Coordinates; // real coords of matrix[0][0]
    private board: Board;

    constructor(board: Board, size: number) {
        this.board = board;
        this.size = size;

        const range = Math.floor(size / 2)
        this.initialize(range);
    }

    public getCornerCoords = () => this.cornerCoords;

    public getSize = () => this.size;

    public getMatrix = () => this.matrix;

    private initialize = (rangeX: number, rangeY: number = rangeX) => {
        const currentPlayerTile = this.board.getCurrentTileCoords();

        const getMatrixCoordinates = (offsetX: number = 0, offsetY: number = 0) => ({
            x: offsetX + currentPlayerTile.x - rangeX,
            y: offsetY + currentPlayerTile.y - rangeY,
        })

        this.cornerCoords = getMatrixCoordinates();

        const matrix = squareMatrixFrom(this.size, (y, x) =>
            this.board.isObstacle(getMatrixCoordinates(x, y))
        );

        this.matrix = matrix;
    }

    public shift = (direction: Direction) => {
        const createRow = (yOffset: number) =>
            Array.from({ length: this.size }, (_, dx) =>
                this.board.isObstacle({
                    x: this.cornerCoords.x + dx,
                    y: this.cornerCoords.y + yOffset
                })
            );

        const createColumn = (xOffset: number) =>
            this.matrix.map((_, dy) =>
                this.board.isObstacle({
                    x: this.cornerCoords.x + xOffset,
                    y: this.cornerCoords.y + dy
                })
            );

        const addRowTop = () => this.matrix.unshift(createRow(-1));

        const addRowBottom = () => this.matrix.push(createRow(this.size));

        const addColumnLeft = () => {
            const column = createColumn(-1);
            this.matrix.forEach((row, i) => row.unshift(column[i]));
        };

        const addColumnRight = () => {
            const column = createColumn(this.size);
            this.matrix.forEach((row, i) => row.push(column[i]));
        };

        const removeRowBottom = () => this.matrix.pop();
        const removeRowTop = () => this.matrix.shift();
        const removeColumnRight = () => this.matrix.forEach(row => row.pop());
        const removeColumnLeft = () => this.matrix.forEach(row => row.shift());

        switch (direction) {
            case "up":
                addRowTop();
                removeRowBottom();
                this.cornerCoords.y--;
                break;
            case "down":
                addRowBottom();
                removeRowTop();
                this.cornerCoords.y++;
                break;
            case "left":
                addColumnLeft();
                removeColumnRight();
                this.cornerCoords.x--;
                break;
            case "right":
                addColumnRight();
                removeColumnLeft();
                this.cornerCoords.x++;
                break;
        }
    }
}