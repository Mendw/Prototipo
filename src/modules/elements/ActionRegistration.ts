import { BaseComponent, BaseKDDComponentCheckResult, ComponentStatus, Message } from '../common.js';
import ConsoleController from '../controllers/ConsoleController.js';
import { AlgorithmRequirements } from './DataMining.js';
import { MissingValuesAmmountType } from './DataPreprocess.js';
import { Correlations, Datatypes, Dimensions } from './DataTransform.js';

export const COMPONENT_CLASSES = {
    DataMining: 'Mineria',
    DataPreprocess: 'Preprocesamiento',
    DataSelection: 'Seleccion',
    DataTransform: 'Transformacion',
    DBConnection: 'Conexion a BDD',
    ResultVisualize: 'Visualizacion',
    ResultPublish: 'Publicación'
} as const;

export interface ActionRegistrationState {
    [key: string]: unknown;
    dbConnected: boolean;
    
    hasLoadedData: boolean;
    hasSelectedTables: boolean;
    
    missingValuesAmmount: MissingValuesAmmountType | null;
    
    datatypes: Datatypes | null;
    rowAmmount: Dimensions | null;
    columnAmmount: Dimensions | null;
    correlation: Correlations | null;
    
    hasExaminedDataset: boolean;
    
    algorithmRequirements: AlgorithmRequirements | null;
    algorithmConfigured: boolean;
    dataMined: boolean;

    hasEvaluated: boolean;
}

interface ActionRegistrationMessagePayload {
    element: keyof typeof COMPONENT_CLASSES;
    description: string;
    stateChange?: Partial<ActionRegistrationState>;
    action: string;
}

interface PrerequisiteCheckMessagePayload {
    [key: string]: unknown[]
}

interface UndoMessagePayload {
    className: string;
}

interface ComponentUndoMessagePayload {
    newComponentState: Partial<ActionRegistrationState>;
}


export default class ActionRegistration extends BaseComponent<ActionRegistrationState> {
    name = 'Registro de Acciones';

    initialize() {
        this.actions.set('register', this.registerAction);
        this.actions.set('checkPrerequisites', this.checkPrerequisites);
        this.actions.set('undoAction', this.undoAction);

        this.UIActions.set('initialize', this.generateInitialSuggestion);
    }

    getInitialState(): ActionRegistrationState {
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

    async registerAction(message: Message) {
        const { element, description, stateChange, action } = message.content.payload as ActionRegistrationMessagePayload;
        if (
            element === undefined 
            || description === undefined 
            || COMPONENT_CLASSES[element] === undefined
            || stateChange !== undefined && Object.keys(stateChange).some(key => this.state[key] === undefined)
            || action === undefined
        ) {
            console.error(`${this.name} recibio un mensaje incorrecto`);
            console.dir(message);
            return;
        }

        await this.addProcess(500, 1000);
        ConsoleController.log(`${COMPONENT_CLASSES[element]}: ${description}`);

        if (stateChange !== undefined) {
            this.setState(stateChange, false);
            this.sendMessage('IntelligentAgent', {
                action: 'processAction',
                payload: { state: this.state, action }
            });

            await this.addProcess(200, 300);
            this.sendMessage('OperationHistory', {
                action: 'push',
                payload: { element }
            });
        }
    }

    async checkPrerequisites(message: Message) {
        await this.addProcess(300, 600);
        const prerequisites = message.content.payload as PrerequisiteCheckMessagePayload;
        
        if (Object.keys(prerequisites).some(key => this.state[key] === undefined)) {
            console.error(`${this.name} recibio un mensaje incorrecto`);
            console.dir(message);
            return;
        }

        const response = {
            allTrue: true,
            prerequisites: {}
        } as BaseKDDComponentCheckResult;

        for(const key of Object.keys(prerequisites)) {
            const isIncluded = prerequisites[key].includes(this.state[key]);

            response.allTrue = response.allTrue && isIncluded;
            response.prerequisites[key] = isIncluded;
        }

        message.respond({ response });
    }

    async undoAction(message: Message) {
        await this.addProcess(500, 1000);

        const { className } = message.content.payload as UndoMessagePayload;
        if (className === undefined) {
            console.error(`${this.name} recibio un mensaje incorrecto`);
            console.dir(message);
            return;
        }

        const { newComponentState } = await this.sendMessage(className, { action: 'undo', payload: {}}) as ComponentUndoMessagePayload;
        if (newComponentState === undefined) {
            console.error(`${this.name} recibio un mensaje incorrecto`);
            console.dir(message);
            return;
        }

        const relevantKeys = Object.keys(newComponentState).filter(key => this.state[key] !== undefined);
        for(const key of relevantKeys) {
            this.state[key] = newComponentState[key];
        }

        this.sendMessage('IntelligentAgent', {
            action: 'processAction',
            payload: { state: this.state, action: 'undo' }
        });
    }

    async generateInitialSuggestion() {
        await this.addProcess(500, 1000);
        this.sendMessage('IntelligentAgent', {
            action: 'processAction',
            payload: { state: this.state, action: 'initialize' }
        });
    }

    getStatus(): ComponentStatus {
        return 'READY';
    }
}