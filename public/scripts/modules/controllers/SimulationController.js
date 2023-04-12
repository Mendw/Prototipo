import { Vector, Connector } from '../common.js';
import ElementMap from '../index.js';
import ConsoleController from './ConsoleController.js';
import MenuController from './MenuController.js';
import SuggestionInterface from './SuggestionInterface.js';
export default class SimulationController {
    constructor(config, canvasContainerElement, menuContainerElement, consoleContainerElement, suggestionContainerElement) {
        this.minDrag = 4;
        const { elements, connectors, menu } = config;
        this.canvasContainer = canvasContainerElement;
        this.consoleController = new ConsoleController(this, consoleContainerElement);
        this.menuController = new MenuController(this, menuContainerElement, menu);
        this.suggestionInterface = new SuggestionInterface(this, suggestionContainerElement);
        this.canvas = document.createElement('canvas');
        const _context = this.canvas.getContext('2d');
        if (_context === null) {
            throw new Error('Unable to get canvas rendering context');
        }
        this.context = _context;
        this.canvasContainer.appendChild(this.canvas);
        this.isAnimating = false;
        this.previousTimestep = null;
        this.focusedElement = null;
        this.resizeTimerId = null;
        this.elements = new Map();
        this.menuActionClassNames = new Map();
        this.UIActions = new Map();
        this.initializeElements(elements);
        this.initializeConnectors(connectors);
        this.initializeMenuActions(menu);
        this.offset = Vector.zero;
        this.scale = 1;
        this.simulationSpeed = 1;
        this.trajectoryLength = 0;
        this.updateSize();
        this.addListeners();
    }
    initializeElements(elements) {
        for (const { className, boundingBox, connectionPoints } of elements) {
            const ElementClass = ElementMap.get(className);
            if (ElementClass === undefined) {
                throw new Error(`${className} is not a valid class name`);
            }
            const [x, y, w, h] = boundingBox;
            this.elements.set(className, new ElementClass(x, y, w, h, connectionPoints));
        }
    }
    initializeConnectors(connectors) {
        for (const { origin: [originName, originPoint], target: [targetName, targetPoint], draw } of connectors) {
            const connectorOrigin = this.elements.get(originName);
            if (connectorOrigin === undefined) {
                throw new Error(`Element '${originName}' not found.`);
            }
            const connectorTarget = this.elements.get(targetName);
            if (connectorTarget === undefined) {
                throw new Error(`Element '${targetName}' not found.`);
            }
            const _originConnectionPoint = connectorOrigin.getConnectionPoint(originPoint);
            if (_originConnectionPoint === undefined) {
                throw new Error(`Connection point '${originPoint}' not found on element '${originName}'`);
            }
            const _targetConnectionPoint = connectorTarget.getConnectionPoint(targetPoint);
            if (_targetConnectionPoint === undefined) {
                throw new Error(`Connection point '${targetPoint}' not found on element '${targetName}'`);
            }
            const connector = new Connector(_originConnectionPoint, _targetConnectionPoint, draw);
            connectorOrigin.connectors.set(targetName, connector);
        }
    }
    initializeMenuActions(menuActions) {
        for (const { className, options } of menuActions) {
            if (!this.elements.has(className) && className !== 'SimulationController') {
                console.error(`Class name ${className} not found`);
            }
            for (const { action } of options) {
                this.menuActionClassNames.set(action, className);
            }
        }
        this.UIActions.set('simPause', this.pauseSimulation);
        this.UIActions.set('simSlow', this.simulationSlow);
        this.UIActions.set('simNormal', this.simulationNormal);
        this.UIActions.set('simFast', this.simulationFast);
        this.UIActions.set('simUndo', this.undoAction);
        this.UIActions.set('simReset', this.resetSimulation);
        this.UIActions.set('acceptSuggestion', this.acceptSuggestion);
        this.UIActions.set('rejectSuggestion', this.rejectSuggestion);
    }
    pauseSimulation() {
        this.simulationSpeed = 0;
    }
    simulationSlow() {
        this.simulationSpeed = 0.5;
        if (!this.isAnimating)
            this.requestFrame();
    }
    simulationNormal() {
        this.simulationSpeed = 1.0;
        if (!this.isAnimating)
            this.requestFrame();
    }
    simulationFast() {
        this.simulationSpeed = 2.0;
        if (!this.isAnimating)
            this.requestFrame();
    }
    undoAction() {
        const operationHistory = this.elements.get('OperationHistory');
        if (operationHistory === undefined) {
            throw new Error('OperationHistory not found');
        }
        operationHistory.UITrigger('undo');
        if (!this.isAnimating)
            this.requestFrame();
    }
    resetSimulation() {
        window.location.reload();
    }
    acceptSuggestion() {
        const suggestionController = this.elements.get('SuggestionController');
        if (suggestionController === undefined) {
            throw new Error('SuggestionController not found');
        }
        suggestionController.UITrigger('acceptSuggestion');
        if (!this.isAnimating)
            this.requestFrame();
    }
    rejectSuggestion() {
        const suggestionController = this.elements.get('SuggestionController');
        if (suggestionController === undefined) {
            throw new Error('SuggestionController not found');
        }
        suggestionController.UITrigger('rejectSuggestion');
        if (!this.isAnimating)
            this.requestFrame();
    }
    requestFrame() {
        window.requestAnimationFrame(timestep => this.drawSimulation(timestep));
    }
    updateSize() {
        this.canvas.width = this.width = 0;
        this.canvas.height = this.height = 0;
        this.canvas.width = this.width = this.canvasContainer.clientWidth;
        this.canvas.height = this.height = this.canvasContainer.clientHeight;
        if (!this.isAnimating)
            this.requestFrame();
    }
    addListeners() {
        window.addEventListener('resize', () => {
            this.updateSize();
        });
        this.canvas.addEventListener('mousedown', ev => this.handleMousedown(ev));
        this.canvas.addEventListener('mousemove', ev => this.handleMousemove(ev));
        this.canvas.addEventListener('wheel', ev => this.handleWheelmove(ev));
        window.addEventListener('mouseup', ev => this.handleMouseup(ev));
    }
    drawSimulation(timestep) {
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.save();
        this.context.translate(this.offset.x, this.offset.y);
        this.context.scale(this.scale, this.scale);
        const deltaT = (timestep - (this.previousTimestep || timestep)) * this.simulationSpeed;
        this.previousTimestep = timestep;
        let isAnimating = false;
        for (const element of this.elements.values()) {
            for (const connector of element.connectors.values()) {
                const isConnectorAnimating = connector.draw(this.context, deltaT);
                isAnimating || (isAnimating = isConnectorAnimating);
            }
        }
        for (const element of this.elements.values()) {
            const isElementAnimating = element.draw(this.context, deltaT);
            isAnimating || (isAnimating = isElementAnimating);
        }
        this.isAnimating = this.simulationSpeed !== 0 && isAnimating;
        if (this.isAnimating) {
            this.requestFrame();
        }
        else
            this.previousTimestep = null;
        this.context.restore();
    }
    handleMousedown(ev) {
        this.prevPoint = new Vector(ev.offsetX, ev.offsetY);
        this.trajectoryLength = 0;
        this.menuController.closeMenus();
    }
    handleMousemove(ev) {
        if (!this.prevPoint)
            return;
        const point = new Vector(ev.offsetX, ev.offsetY);
        const delta = point.substract(this.prevPoint);
        this.offset = this.offset.add(delta);
        this.trajectoryLength += delta.Size;
        this.prevPoint = point;
        if (!this.isAnimating)
            this.requestFrame();
    }
    handleMouseup(ev) {
        if (!this.prevPoint)
            return;
        if (this.trajectoryLength < this.minDrag) {
            const needsRedraw = this.handleClick(new Vector(ev.offsetX, ev.offsetY));
            if (needsRedraw && !this.isAnimating) {
                this.requestFrame();
            }
        }
        this.trajectoryLength = 0;
        this.prevPoint = undefined;
    }
    handleClick(point) {
        for (const element of this.elements.values()) {
            if (element.contains(point, this.offset, this.scale)) {
                return element.click();
            }
        }
        return false;
    }
    handleWheelmove(event) {
        const delta = event.deltaY;
        const scaleCenter = new Vector(event.offsetX, event.offsetY);
        const prevScale = this.scale;
        const ammount = delta < 0 ? 1.1 : 1 / 1.1;
        this.scale = Math.min(3 / 2, Math.max(this.scale * ammount, 1 / 2));
        const scaleRatio = this.scale / prevScale;
        this.offset = scaleCenter.substract(scaleCenter.substract(this.offset).scale(scaleRatio));
        if (!this.isAnimating)
            this.requestFrame();
    }
    UITrigger(actionName) {
        const action = this.UIActions.get(actionName);
        if (action === undefined) {
            console.error(`${actionName} no es una accion válida del controlador de simulación`);
            return;
        }
        action.call(this);
    }
    triggerMenuAction(actionName) {
        const className = this.menuActionClassNames.get(actionName);
        if (className === undefined) {
            console.log(`${actionName} no es una acción válida de interfaz`);
            return;
        }
        const element = className === 'SimulationController' ? this : this.elements.get(className);
        if (element === undefined) {
            console.error(`${className} no es un elemento válido de la simulación`);
            return;
        }
        element.UITrigger(actionName);
        if (!this.isAnimating)
            this.requestFrame();
    }
}
