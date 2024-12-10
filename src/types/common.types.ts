export interface Coordinates {
    x: number;
    y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export type CoordinatesPair = [x: number, y: number]

export interface Sizes {
    width: number;
    height: number;
}

export interface Rect {
    left: number;
    right: number;
    top: number;
    bottom: number;
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
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    [x: string]: boolean;
}

export interface ObjectAny {
    [key: string]: any;
}
