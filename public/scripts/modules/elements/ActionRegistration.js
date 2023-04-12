var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BaseComponent } from '../common.js';
import ConsoleController from '../controllers/ConsoleController.js';
export const COMPONENT_CLASSES = {
    DataMining: 'Mineria',
    DataPreprocess: 'Preprocesamiento',
    DataSelection: 'Seleccion',
    DataTransform: 'Transformacion',
    DBConnection: 'Conexion a BDD',
    ResultVisualize: 'Visualizacion',
    ResultPublish: 'Publicación'
};
export default class ActionRegistration extends BaseComponent {
    constructor() {
        super(...arguments);
        this.name = 'Registro de Acciones';
    }
    initialize() {
        this.actions.set('register', this.registerAction);
        this.actions.set('checkPrerequisites', this.checkPrerequisites);
        this.actions.set('undo', this.undo);
    }
    getInitialState() {
        return {
            dbConnected: false,
            hasLoadedData: false,
            hasSelectedTables: false,
            missingValuesAmmount: null,
            hasExaminedDataset: false,
            dataMined: false,
            algorithmRequirements: null,
            datatypes: null,
            rowAmmount: null,
            columnAmmount: null,
            correlation: null,
            hasEvaluated: false,
            algorithmConfigured: false
        };
    }
    registerAction(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { element, description, stateChange, action } = message.content.payload;
            if (element === undefined
                || description === undefined
                || COMPONENT_CLASSES[element] === undefined
                || stateChange !== undefined && Object.keys(stateChange).some(key => this.state[key] === undefined)
                || action === undefined) {
                console.error(`${this.name} recibio un mensaje incorrecto`);
                console.dir(message);
                return;
            }
            yield this.addProcess(500, 1000);
            ConsoleController.log(`${COMPONENT_CLASSES[element]}: ${description}`);
            if (stateChange !== undefined) {
                this.setState(stateChange, false);
                this.sendMessage('IntelligentAgent', {
                    action: 'processAction',
                    payload: { state: this.state, action }
                });
                yield this.addProcess(200, 300);
                this.sendMessage('OperationHistory', {
                    action: 'push',
                    payload: { element }
                });
            }
        });
    }
    checkPrerequisites(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.addProcess(300, 600);
            const prerequisites = message.content.payload;
            if (Object.keys(prerequisites).some(key => this.state[key] === undefined)) {
                console.error(`${this.name} recibio un mensaje incorrecto`);
                console.dir(message);
                return;
            }
            const response = {
                allTrue: true,
                prerequisites: {}
            };
            for (const key of Object.keys(prerequisites)) {
                const isIncluded = prerequisites[key].includes(this.state[key]);
                response.allTrue = response.allTrue && isIncluded;
                response.prerequisites[key] = isIncluded;
            }
            message.respond({ response });
        });
    }
    undo(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.addProcess(500, 1000);
            const { className } = message.content.payload;
            if (className === undefined) {
                console.error(`${this.name} recibio un mensaje incorrecto`);
                console.dir(message);
                return;
            }
            const { newComponentState } = yield this.sendMessage(className, { action: 'undo', payload: {} });
            if (newComponentState === undefined) {
                console.error(`${this.name} recibio un mensaje incorrecto`);
                console.dir(message);
                return;
            }
            const relevantKeys = Object.keys(newComponentState).filter(key => this.state[key] !== undefined);
            for (const key of relevantKeys) {
                this.state[key] = newComponentState[key];
            }
            this.sendMessage('IntelligentAgent', {
                action: 'processAction',
                payload: { state: this.state, action: 'undo' }
            });
        });
    }
    getStatus() {
        return 'READY';
    }
}
