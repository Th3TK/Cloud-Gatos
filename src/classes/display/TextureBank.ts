import { Textures } from "../../types/canvas.types";
import { safeObjectEntries } from "../../utils/misc";

export default class TextureBank {
    imageElements: {[key: string]: HTMLImageElement} = {}

    constructor(textures: Textures){
        this.initBank(textures);
    }

    private initBank(textures: Textures) {
        safeObjectEntries(textures).forEach(([key, path]) => 
            this.setTexture(key, path)
        );
        console.log(this.imageElements);
    }

    public setTexture = (key: string, path: string) => {
        const img = new Image(); 
        img.src = `${path}`;
        this.imageElements[key] = img;
    }

    public getImageElement = (key: string) => this.imageElements[key];

    public getImageElements = () => this.imageElements;
}