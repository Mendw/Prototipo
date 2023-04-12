class MenuController {
    static get Instance() {
        return MenuController.instance;
    }
    constructor(parent, container, config) {
        if (MenuController.instance !== undefined) {
            throw new Error('No es posible instanciar una clase Singleton más de una vez.');
        }
        MenuController.instance = this;
        this.parent = parent;
        this.container = container;
        this.submenus = new Map();
        this.parseMenu(config)
            .forEach(submenu => this.container.appendChild(submenu));
    }
    closeMenus() {
        for (const submenu of this.submenus.values()) {
            submenu.style.visibility = 'hidden';
        }
    }
    openMenu(selectedName) {
        this.closeMenus();
        const submenu = this.submenus.get(selectedName);
        if (submenu !== undefined)
            submenu.style.visibility = 'visible';
    }
    doAction(action) {
        this.closeMenus();
        this.parent.triggerMenuAction(action);
        return false;
    }
    parseMenu(config) {
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
    parseOption(option) {
        const optionElement = document.createElement('div');
        optionElement.classList.add('menu_action');
        optionElement.addEventListener('click', () => this.doAction(option.action));
        optionElement.innerText = option.title;
        return optionElement;
    }
}
MenuController.instance = undefined;
export default MenuController;
