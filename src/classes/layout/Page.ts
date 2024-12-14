export default class Page {
    private element: HTMLElement;
    private configs: {[key: string]: number[]} = {};
    private sectionShownClass: string;
    private sectionHiddenClass: string;

    constructor(element: HTMLElement, sectionShownClass?: string, sectionHiddenClass?: string) {
        this.element = element;
        if(sectionShownClass) this.sectionShownClass = sectionShownClass;
        if(sectionHiddenClass) this.sectionHiddenClass = sectionHiddenClass;
    }

    public getElement = () => this.element;

    public showPage() {
        this.element.style.animation = 'wipe 1s ease-in-out forwards';
        this.element.classList.add('current');
    }

    public hidePage() {
        this.element.style.animation = 'wipeReverse 1s ease-in-out forwards';
        this.element.classList.remove('current');
    }

    private modifySectionVisibility(section: HTMLElement, show: boolean) {
        section.classList.add(show ? this.sectionShownClass : this.sectionHiddenClass);
        section.classList.remove(show ? this.sectionHiddenClass : this.sectionShownClass);
    }
    
    public showSections(...sectionNumbers: number[]) {
        sectionNumbers.forEach(num => {
            const section = this.element.querySelector(`[no=${num}]`) as HTMLElement;
            this.modifySectionVisibility(section, true);
        })
    }
    
    public hideSections(...sectionNumbers: number[]) {
        sectionNumbers.forEach(num => {
            const section = this.element.querySelector(`[no=${num}]`) as HTMLElement;
            this.modifySectionVisibility(section, false);
        })
    }
    
    public display(configKey: string) {
        const allSections = this.element.querySelectorAll('[no]');
        allSections.forEach((section) => {
            const sectionNumber = parseInt(section.getAttribute('no')!);
            const shouldBeDisplayed = this.configs[configKey].includes(sectionNumber);

            this.modifySectionVisibility(section as HTMLElement, shouldBeDisplayed);
        })
    }

    public registerSectionConfigs(key: string, sectionNumbers: number[]) {
        this.configs[key] = sectionNumbers;
    }

    public registerButton(buttonId: string, callback: (event: Event) => any) {
        const button = this.element.querySelector(`#${buttonId}`) as HTMLButtonElement;
        if(!button) return;

        button.addEventListener('click', callback);
    }

}