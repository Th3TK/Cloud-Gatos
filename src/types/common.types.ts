import Cloud from "../classes/environment/Cloud";

export type CloudSizes = 1 | 2 | 3;

export interface Coordinates {
    x: number;
    y: number;
}

export interface Sizes {
    width: number;
    height: number;
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

export interface Obstacles {
    [key: string]: Cloud,
};

export interface ObjectAny {
    [key: string]: any,
}