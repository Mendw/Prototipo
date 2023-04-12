import { Submenu, Action } from '../common.js';
import SimulationController from './SimulationController.js';

export default class MenuController {
    private static instance?: MenuController = undefined;
    static get Instance() {
        return MenuController.instance;
    }

    private submenus: Map<string, HTMLElement>;
    private speedDisplay: HTMLElement;
    
    private parent: SimulationController;
    private container: HTMLElement;
    constructor(parent: SimulationController, container: HTMLElement, config: Submenu[]) {
        if (MenuController.instance !== undefined) {
            throw new Error('No es posible instanciar una clase Singleton más de una vez.');
        }

        MenuController.instance = this;
        this.parent = parent;
        this.container = container;
        this.submenus = new Map();

        this.speedDisplay = document.createElement('div');
        this.speedDisplay.classList.add('speed-display');
        this.container.appendChild(this.speedDisplay);

        this.parseMenu(config)
            .forEach(submenu => this.container.appendChild(submenu));
    }

    closeMenus() {
        for (const submenu of this.submenus.values()) {
            submenu.style.visibility = 'hidden';
        }
    }

    openMenu(selectedName: string) {
        this.closeMenus();

        const submenu = this.submenus.get(selectedName);
        if (submenu !== undefined) submenu.style.visibility = 'visible';
    }

    doAction(action: string) {
        this.closeMenus();
        this.parent.triggerMenuAction(action);

        return false;
    }

    parseMenu(config: Submenu[]) {
        return config.map(({ name, options }) => {
            const element = document.createElement('div');
            element.classList.add('main_menu');

            const menuButton = document.createElement('div');
            menuButton.innerText = name;
            menuButton.addEventListener('click', () => this.openMenu(name));
            menuButton.classList.add('menu_button');
            element.appendChild(menuButton);

            const submenuWrapper = document.createElement('div');
            submenuWrapper.classList.add('submenu_container__wrapper');
            element.appendChild(submenuWrapper);

            const submenu = document.createElement('div');
            submenu.classList.add('submenu_container');
            this.submenus.set(name, submenu);

            options.forEach(option => submenu.appendChild(this.parseOption(option)));
            submenuWrapper.appendChild(submenu);
            element.appendChild(submenuWrapper);

            return element;
        });
    }

    parseOption(option: Action) {
        const optionElement = document.createElement('div');
        optionElement.classList.add('menu_action');
        optionElement.addEventListener('click', () => this.doAction(option.action));
        optionElement.innerText = option.title;

        return optionElement;
    }

    setDisplaySpeed(innerText: string, isPaused: boolean = false) {
        this.speedDisplay.innerText = innerText;
        if (isPaused) {
            this.speedDisplay.classList.add('paused');
        } else {
            this.speedDisplay.classList.remove('paused');
        }
    }
}