import { BaseComponent, ComponentStatus, Message } from '../common.js';
import { SuggestionMessage } from '../controllers/SuggestionInterface.js';
import { ActionRegistrationState } from './ActionRegistration.js';

export const SUGGESTION_ACTIONS = {
    dbConnect: 'Conectarse con la base de datos',
    loadData: 'Cargar datos a la base de datos',
    selectTables: 'Seleccionar las tablas que serán usadas durante el proceso de KDD',
    countMissing: 'Obtener la cantidad de valores faltantes que contiene el conjunto de datos',
    estimateMissing: 'Estimar los valores faltantes del conjunto de datos',
    transformExamine: 'Explorar las características del conjunto de datos',
    transformEdit: 'Editar tipos de datos',
    transformReduce: 'Reducir la dimensionalidad del conjunto de datos',
    mineSelect: 'Seleccionar algoritmo de mineria de datos',
    mineConfigure: 'Configurar algoritmo de minería de datos',
    mineExecute: 'Ejecutar algoritmo de minería de datos',
    visualizeResults: 'Visualizar resultados del proceso de KDD',
    visualizeSelect: 'Seleccionar los patrones que serán evaluados',
    visualizeEvaluate: 'Evaluar los patrones seleccionados',
    publishSelect: 'Seleccionar los patrones que serán exportados',
    publishExport: 'Exportar los patrones seleccionados'
} as const;

export type SuggestionAction = keyof typeof SUGGESTION_ACTIONS;
export default class KnowledgeBase extends BaseComponent {
    name = 'Base de Conocimientos';

    initialize() {
        this.actions.set('query', this.query);
    }

    getInitialState() {
        return { };
    }

    getSuggestion(state: ActionRegistrationState): SuggestionMessage | undefined {
        const { 
            dbConnected,
            hasLoadedData,
            hasSelectedTables,
            missingValuesAmmount,
            hasExaminedDataset,
            algorithmRequirements,
            algorithmConfigured,
            dataMined,
            datatypes,
            rowAmmount,
            correlation
        } = state;

        if (!dbConnected) return {
            action: 'dbConnect',
            description: SUGGESTION_ACTIONS.dbConnect
        };

        if (!hasLoadedData) return {
            action: 'loadData',
            description: SUGGESTION_ACTIONS.loadData
        };

        if (!hasSelectedTables) return {
            action: 'selectTables',
            description: SUGGESTION_ACTIONS.selectTables
        };

        if (missingValuesAmmount === null) return {
            action: 'countMissing',
            description: SUGGESTION_ACTIONS.countMissing
        };

        if (
            !hasExaminedDataset 
            || datatypes === null 
            || correlation === null
            || rowAmmount === null
        ) return {
            action: 'transformExamine',
            description: SUGGESTION_ACTIONS.transformExamine
        };

        if (algorithmRequirements === null) return {
            action: 'mineSelect',
            description: SUGGESTION_ACTIONS.mineSelect
        };

        if (!algorithmRequirements.missingValuesAmmount.includes(missingValuesAmmount)) return {
            action: 'estimateMissing',
            description: SUGGESTION_ACTIONS.estimateMissing
        };

        if (!algorithmRequirements.datatypes.includes(datatypes)) return {
            action: 'transformEdit',
            description: SUGGESTION_ACTIONS.transformEdit
        };

        if (['HIGH', 'INTERMEDIATE'].includes(correlation) && rowAmmount !== 'LOW' ) return {
            action: 'transformReduce',
            description: SUGGESTION_ACTIONS.transformReduce
        };

        if (!algorithmConfigured) return {
            action: 'mineConfigure',
            description: SUGGESTION_ACTIONS.mineConfigure
        };

        if (!dataMined) return {
            action: 'mineExecute',
            description: SUGGESTION_ACTIONS.mineExecute
        };
    }

    async query(message: Message) {
        const state = message.content.payload as ActionRegistrationState;

        await this.addProcess(1500, 2000);
        const response = this.getSuggestion(state);
        message.respond({ response: { canSuggest: response !== undefined, suggestion: response } });
    }

    getStatus(): ComponentStatus {
        return 'READY';
    }
}