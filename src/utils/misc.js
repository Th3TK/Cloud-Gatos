export const filterObject = (obj, predicate) => 
    Object.keys(obj)
        .filter( key => predicate(obj[key]) )
        .reduce( (res, key) => (res[key] = obj[key], res), {} );


export const signDependantFloor = (num) =>
    num > 0 ? Math.floor(num) : Math.ceil(num);

export function doesSquareContain(square1, square2) {
    // square1 and square2 are objects with properties: left, right, top, bottom
    return (
      square1.right > square2.left ||
      square1.left < square2.right ||
      square1.bottom > square2.top ||
      square1.top < square2.bottom
    );
  }