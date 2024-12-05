import { HORIZONTAL_VELOCITY, UPDATES_PER_SECOND, VERTICAL_VELOCITY } from "../config.js";

const KEYS_MAPPED = {
    87: 'up',
    83: 'down',
    65: 'left',
    68: 'right',
}

export default class MovementHandler {
    constructor(board) {
        this.board = board;
        this.pressed = {
            up: false,
            down: false,
            left: false,
            right: false,
        }

        this.handleButtonDown = this.handleButtonDown.bind(this);
        this.handleButtonUp = this.handleButtonUp.bind(this);
        this.updateMovement = this.updateMovement.bind(this);
        this.calculateDistanceToAdd = this.calculateDistanceToAdd.bind(this);
    }

    handleButtonDown(event) {
        const key = event.keyCode;
        event.preventDefault();

        if (!(key in KEYS_MAPPED)) return;
        this.pressed[KEYS_MAPPED[key]] = true;
    }

    handleButtonUp(event) {
        const key = event.keyCode;
        event.preventDefault();

        if (!(key in KEYS_MAPPED)) return;
        this.pressed[KEYS_MAPPED[key]] = false;
    }

    updateMovement() {
        const {x, y} = this.calculateDistanceToAdd();
        this.board.updatePositions(x, y);
    }

    calculateDistanceToAdd() {
        const y = this.pressed.up === this.pressed.down ? 0 : this.pressed.down ? VERTICAL_VELOCITY : -VERTICAL_VELOCITY;
        const x = this.pressed.left === this.pressed.right ? 0 : this.pressed.right ? HORIZONTAL_VELOCITY : -HORIZONTAL_VELOCITY;

        return { x, y };
    }

    start() {
        document.addEventListener('keydown', this.handleButtonDown);
        document.addEventListener('keyup', this.handleButtonUp);

        this.updateInterval = setInterval(this.updateMovement, 1000 / UPDATES_PER_SECOND);
        this.board.updatePositions(1, 1);
    }

    destroy() {
        document.removeEventListener('keydown', this.handleButtonDown);
        document.removeEventListener('keyup', this.handleButtonUp);
        clearInterval(this.updateInterval);
    }
}