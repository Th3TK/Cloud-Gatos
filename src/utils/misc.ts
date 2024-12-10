import { Coordinates, ObjectAny, Sizes } from "../types/common.types";

export const filterObject = (obj: ObjectAny, predicate: (a: any) => boolean | undefined) =>
    Object.keys(obj)
        .filter(key => predicate(obj[key]))
        .reduce((res, key) => (res[key] = obj[key], res), {} as ObjectAny);


export const signDependantFloor = (num: number) =>
    num > 0 ? Math.floor(num) : Math.ceil(num);

export const doRectanglesOverlap = (coords1: Coordinates, sizes1: Sizes, coords2: Coordinates, sizes2: Sizes) => 
    coords1.x < coords2.x + sizes2.width && coords1.x + sizes1.width > coords2.x &&
    coords1.y < coords2.y + sizes2.height && coords1.y + sizes1.height > coords2.y;

export const randomNumber = (min: number, max: number) : number => Math.floor(Math.random() * (max - min)) + min;

export const randomSign = (num: number) => Math.random() < 0.5 ? num : -num;

export const clamp = (n: number, max: number, min: number) => Math.max(Math.min(n, Math.max(max, min)), Math.min(max, min));

export const clampEqual = (n: number, range: number) => clamp(n, range, -range);

export const indicePairInMatrix = (matrix: any[][], x: number, y: number) => 
    x >= 0 && y >= 0 && matrix.length > y && matrix[y].length > x;

export const indicePairInMatrixOfSizes = (width: number, height: number, x: number, y: number) => 
    x >= 0 && y >= 0 && height > y && width > x;

export const matrixFrom = (length: number, callback: (y: number, x: number) => any) => (
    Array.from({length}, (_, y) => 
        Array.from({length}, (_, x) => 
            callback(y, x)
        )
    )
);

export const matrixForEach = (matrix: any[][], callback: (e: any, y: number, x: number) => any) => 
    matrix.forEach((row, y) => row.forEach((e, x) => callback(e, y, x)));

export function isInViewport(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

export const safeObjectKeys = (obj: object) => Object.keys(obj || {});
export const safeObjectValues = (obj: object) => Object.values(obj || {});