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
};
export default class KnowledgeBase extends BaseComponent {
    constructor() {
        super(...arguments);
        this.name = 'Base de Conocimientos';
    }
    initialize() {
        this.actions.set('query', this.query);
    }
    getInitialState() {
        return {};
    }
    getSuggestion(state) {
        const { dbConnected, hasLoadedData, hasSelectedTables, missingValuesAmmount, hasExaminedDataset, algorithmRequirements, algorithmConfigured, dataMined, datatypes, rowAmmount, correlation } = state;
        if (!dbConnected)
            return {
                action: 'dbConnect',
                description: SUGGESTION_ACTIONS.dbConnect
            };
        if (!hasLoadedData)
            return {
                action: 'loadData',
                description: SUGGESTION_ACTIONS.loadData
            };
        if (!hasSelectedTables)
            return {
                action: 'selectTables',
                description: SUGGESTION_ACTIONS.selectTables
            };
        if (missingValuesAmmount === null)
            return {
                action: 'countMissing',
                description: SUGGESTION_ACTIONS.countMissing
            };
        if (!hasExaminedDataset
            || datatypes === null
            || correlation === null
            || rowAmmount === null)
            return {
                action: 'transformExamine',
                description: SUGGESTION_ACTIONS.transformExamine
            };
        if (algorithmRequirements === null)
            return {
                action: 'mineSelect',
                description: SUGGESTION_ACTIONS.mineSelect
            };
        if (!algorithmRequirements.missingValuesAmmount.includes(missingValuesAmmount))
            return {
                action: 'estimateMissing',
                description: SUGGESTION_ACTIONS.estimateMissing
            };
        if (!algorithmRequirements.datatypes.includes(datatypes))
            return {
                action: 'transformEdit',
                description: SUGGESTION_ACTIONS.transformEdit
            };
        if (['HIGH', 'INTERMEDIATE'].includes(correlation) && rowAmmount !== 'LOW')
            return {
                action: 'transformReduce',
                description: SUGGESTION_ACTIONS.transformReduce
            };
        if (!algorithmConfigured)
            return {
                action: 'mineConfigure',
                description: SUGGESTION_ACTIONS.mineConfigure
            };
        if (!dataMined)
            return {
                action: 'mineExecute',
                description: SUGGESTION_ACTIONS.mineExecute
            };
    }
    query(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = message.content.payload;
            yield this.addProcess(1500, 2000);
            const response = this.getSuggestion(state);
            message.respond({ response: { canSuggest: response !== undefined, suggestion: response } });
        });
    }
    getStatus() {
        return 'READY';
    }
}
