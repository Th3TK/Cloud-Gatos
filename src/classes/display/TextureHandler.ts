import { AnimationFrame } from "../../types/canvas.types";

export default class TextureHandler {
    private textureKeys: string[] = []; 
    private chooseTexture?: () => string; 
    private animations: AnimationFrame[] = []; 
    private animationIndex: number = 0; 
    private animationStartTime: number | null = null;
    private isAnimating: boolean = false; 
    private isPaused: boolean = false; 
    private pauseTime: number | null = null; 
    private flippedHorizontally = false; 
    private looped: boolean = false;

    constructor(textureKeys: string[], chooseTexture?: () => string) {
        this.textureKeys = textureKeys;
        this.chooseTexture = chooseTexture;
    }

    public setFlippedHorizontally = (flipped: boolean) => this.flippedHorizontally = flipped;

    public isFlippedHorizontally = () => this.flippedHorizontally;

    public getCurrentTextureKey(): string | undefined {
        let textureKey: string | undefined;

        if (this.isAnimating && this.animations.length > 0) textureKey = this.getCurrentAnimationFrame();
        else textureKey = this.chooseTexture?.();

        if(!textureKey) return;
        return `${textureKey}${this.flippedHorizontally ? '_flipped' : ''}`;  
    }

    public addAnimation(frames: AnimationFrame[]): void {
        this.animations = frames;
        this.resetAnimation();
    }

    public startAnimation(looped: boolean = false): void {
        if (!this.isAnimating && this.animations.length > 0) {
            this.isAnimating = true;
            this.animationStartTime = performance.now();
            this.isPaused = false;
            this.looped = looped;
        }
    }

    public pauseAnimation(): void {
        if (this.isAnimating && !this.isPaused) {
            this.isPaused = true;
            this.pauseTime = performance.now();
        }
    }

    public resumeAnimation(): void {
        if (this.isAnimating && this.isPaused) {
            this.isPaused = false;
            if (this.pauseTime && this.animationStartTime) {
                this.animationStartTime += performance.now() - this.pauseTime;
            }
        }
    }

    public stopAnimation(): void {
        this.isAnimating = false;
        this.resetAnimation();
    }
    
    private resetAnimation(): void {
        this.animationIndex = 0;
        this.animationStartTime = null;
        this.isPaused = false;
        this.looped = false;
    }

    private getCurrentAnimationFrame() : string {
        if (!this.isAnimating || this.isPaused || !this.animationStartTime) {
            return this.animations[this.animationIndex].textureKey;
        }

        const elapsed = performance.now() - this.animationStartTime;
        let accumulatedTime = 0;

        for (let i = 0; i < this.animations.length; i++) {
            accumulatedTime += this.animations[i].duration;
            
            if (elapsed < accumulatedTime) {
                this.animationIndex = i;
                return this.animations[i].textureKey;
            }
        }

        let looped = this.looped;
        this.stopAnimation();
        if(looped) this.startAnimation(true);

        return this.animations[0].textureKey;
    }
}