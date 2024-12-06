function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export const getSeed = () => getRandomInt(1e9);

export const seededPositionVal = (seed: number, x: number, y: number) => {
    const rand = x * 73856093 ^ y * 19349663 ^ seed;
    return (Math.sin(rand) * 10000) % 1;
}