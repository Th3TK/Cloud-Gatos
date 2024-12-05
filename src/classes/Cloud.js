
const container = document.querySelector('#obstacleContainer');

export default class Cloud {
    constructor(gridX, gridY) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.element = this.appendToDOM();
        
        this.updatePosition();
        this.appendToDOM = this.appendToDOM.bind(this);
    }

    updatePosition(posX, posY) {
        this.element.style.position = 'absolute';
        this.element.style.left = `${posX}px`;
        this.element.style.top = `${posY}px`;
    }

    appendToDOM() {
        let element = document.createElement('div');
        element.classList.add('cloud');
        element.innerHTML = `${this.gridX} ${this.gridY}`
        container.appendChild(element);
        return element;
    }
}