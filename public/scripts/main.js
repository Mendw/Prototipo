import { assets, ImageWrapper } from './modules/common.js';
import SimulationController from './modules/controllers/SimulationController.js';
import CONFIG from './modules/config.js';
const containerNames = {
    canvas: 'canvas-container',
    menu: 'simulation-menu',
    console: 'simulation-console',
    suggestions: 'suggestions-box'
};
function initialize() {
    const canvasContainerElement = document.getElementById(containerNames.canvas);
    if (canvasContainerElement === null) {
        throw new Error(`No fue posible cargar el elemento 'canvas' (${containerNames.canvas})`);
    }
    const menuContainerElement = document.getElementById(containerNames.menu);
    if (menuContainerElement === null) {
        throw new Error(`No fue posible cargar el elemento 'menu' (${containerNames.menu})`);
    }
    const consoleContainerElement = document.getElementById(containerNames.console);
    if (consoleContainerElement === null) {
        throw new Error(`No fue posible cargar el elemento 'console' (${containerNames.console})`);
    }
    const suggestionContainerElement = document.getElementById(containerNames.suggestions);
    if (suggestionContainerElement === null) {
        throw new Error(`No fue posible cargar el elemento 'suggestions' (${containerNames.suggestions})`);
    }
    const simulationController = new SimulationController(CONFIG, canvasContainerElement, menuContainerElement, consoleContainerElement, suggestionContainerElement);
    const gearIcon = new ImageWrapper('../img/gear.png', () => simulationController.requestFrame());
    assets.set('gear', gearIcon);
    simulationController.requestFrame();
}
window.addEventListener('load', initialize);
