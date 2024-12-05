export default class Player {
    constructor(element, posX, posY) {
        this.element = element;
        this.posX = posX;
        this.posY = posY;
    }

    move(addedX = 0, addedY = 0) {
        this.posX += addedX;
        this.posY += addedY;

        this.element.innerText = `${this.posX} ${this.posY}`;
    }
}