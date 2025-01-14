import { Textures } from "../../types/display.types";
import { safeObjectEntries } from "../../utils/misc";

const basePath = import.meta.env.BASE_URL;

export default class TextureBank {
    imageElements: {[key: string]: HTMLImageElement} = {}

    constructor(textures: Textures){
        this.initBank(textures);
    }

    private initBank(textures: Textures) {
        safeObjectEntries(textures).forEach(([key, path]) => 
            this.setTexture(key, path)
        );
    }

    public setTexture = (key: string, path: string) => {
        const img = new Image(); 
        img.src = `${basePath}${path}`;
        this.imageElements[key] = img;
    }

    public getImageElement = (key: string) => this.imageElements[key];

    public getImageElements = () => this.imageElements;
}