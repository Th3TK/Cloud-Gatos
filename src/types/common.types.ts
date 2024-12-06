export interface Coordinates {
    x: number;
    y: number;
}
export interface Movement {
    x: number;
    y: number;
}

export interface MinMax {
    min: number,
    max: number,
}

export interface Pressed {
    up: boolean,
    down: boolean,
    left: boolean,
    right: boolean,
    [x: string]: boolean,
}