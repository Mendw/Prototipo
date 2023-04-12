var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BaseComponentError, BaseKDDComponent, DBError, PrerequisitesError } from '../common.js';
import ConsoleController from '../controllers/ConsoleController.js';
import { MISSING_VALUE_AMMOUNTS } from './DataPreprocess.js';
import { DATATYPES } from './DataTransform.js';
export default class DataMining extends BaseKDDComponent {
    constructor() {
        super(...arguments);
        this.name = 'Minería de datos';
        this.className = 'DataMining';
    }
    initialize() {
        this.UIActions.set('mineSelect', this.mineSelect);
        this.UIActions.set('mineConfigure', this.mineConfigure);
        this.UIActions.set('mineExecute', this.mineExecute);
        this.isSelecting = false;
        this.isConfiguring = false;
        this.isExecuting = false;
    }
    getInitialState() {
        return {
            algorithmSelected: false,
            algorithmConfigured: false,
            algorithmRequirements: null,
            dataMined: false
        };
    }
    getPrerequisites() {
        return {
            dbConnected: [true],
            hasLoadedData: [true],
            hasSelectedTables: [true],
            hasExaminedDataset: [true]
        };
    }
    mineSelect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isSelecting || this.state.algorithmSelected)
                return;
            this.isSelecting = true;
            const areValid = yield this.checkPrerequisitesMet(300, 600);
            if (!areValid) {
                this.isSelecting = false;
                return this.setState({ error: new PrerequisitesError() }, false);
            }
            const queryExecuted = yield this.queryDB('SELECT', 200, 500);
            if (!queryExecuted) {
                this.isSelecting = false;
                return this.setState({ error: new DBError('No fue posible obtener los algoritmos de minería de datos configurados') }, false);
            }
            this.setState({
                algorithmSelected: true,
                algorithmRequirements: {
                    missingValuesAmmount: this.randomPick([['NONE'], ['NONE', 'LOW']]),
                    datatypes: this.randomPick([['NUMERIC'], ['NUMERIC', 'PARAMETERIZED'], ['ALPHANUMERIC']])
                }
            });
            yield this.addProcess(200, 500);
            this.registerAction('Algoritmo de minería de datos seleccionado', 'mineSelect', { algorithmRequirements: this.state.algorithmRequirements });
            this.isSelecting = false;
        });
    }
    mineConfigure() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isConfiguring || this.state.algorithmConfigured)
                return;
            if (!this.state.algorithmSelected) {
                ConsoleController.log('No se ha seleccionado el algoritmo de minería de datos', 'DEBUG');
                return;
            }
            yield this.addProcess(300, 600);
            this.setState({
                algorithmConfigured: true
            });
            yield this.addProcess(200, 500);
            this.registerAction('Algoritmo de minería de datos configurado', 'mineConfigure', { algorithmConfigured: true });
            this.isConfiguring = false;
        });
    }
    mineExecute() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isExecuting || this.state.dataMined || this.state.algorithmRequirements === null)
                return;
            if (!this.state.algorithmConfigured) {
                ConsoleController.log('El algoritmo de minería de datos no ha sido configurado', 'DEBUG');
                return;
            }
            this.isExecuting = true;
            yield this.addProcess(300, 600);
            const prerequisites = this.getPrerequisites();
            Object.assign(prerequisites, this.state.algorithmRequirements);
            const prerequisiteCheckResult = yield this.checkPrerequisites(prerequisites);
            if (prerequisiteCheckResult === undefined) {
                this.isExecuting = false;
                return this.setState({ error: new BaseComponentError('prerequisites', 'No fue posible validar los prerequisitos de esta accion') }, false);
            }
            const { dbConnected, hasLoadedData, hasSelectedTables, hasExaminedDataset, missingValuesAmmount, datatypes } = prerequisiteCheckResult.prerequisites;
            if (!(dbConnected && hasLoadedData && hasSelectedTables && hasExaminedDataset)) {
                this.isExecuting = false;
                return this.setState({ error: new PrerequisitesError() }, false);
            }
            if (!(missingValuesAmmount && datatypes)) {
                const prerequisiteErrorMessageParts = [];
                if (!missingValuesAmmount) {
                    prerequisiteErrorMessageParts.push(`El conjunto de datos sobrepasa la cantidad máxima de datos faltantes (${this.state.algorithmRequirements.missingValuesAmmount.map(ammount => MISSING_VALUE_AMMOUNTS[ammount].name).join('/')})`);
                }
                if (!datatypes) {
                    prerequisiteErrorMessageParts.push(`El conjunto de datos no tiene el tipo de datos correcto (${this.state.algorithmRequirements.datatypes.map(datatype => DATATYPES[datatype]).join('/')})`);
                }
                this.isExecuting = false;
                return this.setState({ error: new BaseComponentError('prerequisites', prerequisiteErrorMessageParts.join('. ')) }, false);
            }
            const queryExecuted = yield this.queryDB('MINE', 200, 500);
            if (!queryExecuted) {
                this.isExecuting = false;
                return this.setState({ error: new DBError('No fue posible cargar datos al conjunto de datos') }, false);
            }
            yield this.addProcess(4000, 5000);
            this.setState({
                dataMined: true
            });
            this.registerAction('Algoritmo de minería de datos ejecutado', 'mineExecute', { dataMined: true });
            this.isExecuting = false;
        });
    }
    describeState() {
        const stateParts = [this.name];
        if (this.state.algorithmSelected) {
            stateParts.push('Se ha seleccionado un algoritmo de minería de datos');
            if (this.state.algorithmRequirements) {
                stateParts.push('Requerimientos: ');
                stateParts.push(` - Cantidad de valores faltantes: ${this.state.algorithmRequirements.missingValuesAmmount.map(ammount => MISSING_VALUE_AMMOUNTS[ammount].name).join('/')}`);
                stateParts.push(` - Tipos de datos: ${this.state.algorithmRequirements.datatypes.map(datatype => DATATYPES[datatype]).join('/')}`);
            }
        }
        else {
            stateParts.push('No se ha seleccionado un algoritmo de mineria de datos');
        }
        if (this.state.algorithmConfigured) {
            stateParts.push('El algoritmo de minería de datos fue configurado');
        }
        else {
            stateParts.push('No se ha configurado el algoritmo de minería de datos');
        }
        return stateParts.join('\n');
    }
    getStatus() {
        const hadError = this.resetError();
        if (hadError)
            return 'ERRORED';
        if (this.state.algorithmSelected && this.state.algorithmConfigured && this.state.dataMined)
            return 'READY';
        if (this.state.algorithmSelected)
            return 'CONFIGURING';
        return 'INITIAL';
    }
}
