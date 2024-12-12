function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export const getSeed = () => getRandomInt(1e9);