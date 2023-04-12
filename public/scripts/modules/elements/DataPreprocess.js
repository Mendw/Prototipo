var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BaseKDDComponent, PrerequisitesError, DBError, BaseComponentError } from '../common.js';
import ConsoleController from '../controllers/ConsoleController.js';
export const MISSING_VALUE_AMMOUNTS = {
    NONE: {
        name: 'Ninguno',
        description: 'No se detectaron valores faltantes en el conjunto de datos'
    },
    LOW: {
        name: 'Pocos',
        description: 'Se detectaron pocos valores faltantes en el conjunto de datos'
    },
    MEDIUM: {
        name: 'Intermedios',
        description: 'Se detectó una cantidad moderada de valores faltantes en el conjunto de datos'
    },
    HIGH: {
        name: 'Muchos',
        description: 'Se detectó una gran cantidad de valores faltantes en el conjunto de datos'
    }
};
export default class DataPreprocess extends BaseKDDComponent {
    constructor() {
        super(...arguments);
        this.name = 'Preprocesamiento de d.';
        this.className = 'DataPreprocess';
    }
    initialize() {
        this.UIActions.set('outlierDetect', this.outlierDetect);
        this.UIActions.set('outlierRemove', this.outlierRemove);
        this.UIActions.set('countMissing', this.countMissing);
        this.UIActions.set('estimateMissing', this.estimateMissing);
        this.isDetecting = false;
        this.isEliminating = false;
        this.isCounting = false;
        this.isEstimating = false;
    }
    getInitialState() {
        return {
            hasOutliers: null,
            missingValuesAmmount: null
        };
    }
    getPrerequisites() {
        return { dbConnected: [true], hasLoadedData: [true], hasSelectedTables: [true] };
    }
    outlierDetect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isDetecting || this.state.hasOutliers !== null)
                return;
            this.isDetecting = true;
            const areValid = yield this.checkPrerequisitesMet(300, 600);
            if (!areValid) {
                this.isDetecting = false;
                return this.setState({ error: new PrerequisitesError() }, false);
            }
            const queryExecuted = yield this.queryDB('SELECT', 200, 500);
            if (!queryExecuted) {
                this.isDetecting = false;
                return this.setState({ error: new DBError('No fue posible detectar anomalías en el conjunto de datos') }, false);
            }
            yield this.addProcess(200, 500);
            this.setState({ hasOutliers: this.randomPick([true, true, false]) }, false);
            const description = (!this.state.hasOutliers ? 'No se' : 'Se') + ' detectaron anomalías en el conjunto de datos';
            this.registerAction(description, 'outlierDetect');
            this.isDetecting = false;
        });
    }
    outlierRemove() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isEliminating || this.state.hasOutliers === null) {
                return;
            }
            if (this.state.hasOutliers === false) {
                ConsoleController.log('El conjunto de datos no contiene anomalías');
                return;
            }
            this.isEliminating = true;
            const areValid = yield this.checkPrerequisitesMet(300, 600);
            if (!areValid) {
                this.isEliminating = false;
                return this.setState({ error: new PrerequisitesError() }, false);
            }
            const queryExecuted = yield this.queryDB('DELETE', 200, 500);
            if (!queryExecuted) {
                this.isEliminating = false;
                return this.setState({ error: new DBError('No fue posible eliminar las anomalias del conjunto de datos') }, false);
            }
            yield this.addProcess(200, 500);
            this.setState({
                hasOutliers: false
            }, false);
            this.registerAction('Las anomalías han sido eliminadas del conjunto de datos', 'outlierRemove');
            this.isEliminating = false;
        });
    }
    countMissing() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isCounting || this.state.missingValuesAmmount !== null)
                return;
            this.isCounting = true;
            const areValid = yield this.checkPrerequisitesMet(300, 600);
            if (!areValid) {
                this.isCounting = false;
                return this.setState({ error: new PrerequisitesError() }, false);
            }
            const queryExecuted = yield this.queryDB('SELECT', 200, 500);
            if (!queryExecuted) {
                this.isCounting = false;
                return this.setState({ error: new DBError('No fue posible detectar la cantidad de valores faltantes en el conjunto de datos') }, false);
            }
            const newMissingValuesAmmount = this.randomPick(['NONE', 'LOW', 'LOW', 'MEDIUM', 'MEDIUM', 'MEDIUM', 'MEDIUM', 'HIGH']);
            this.setState({ missingValuesAmmount: newMissingValuesAmmount });
            yield this.addProcess(200, 500);
            this.registerAction(MISSING_VALUE_AMMOUNTS[newMissingValuesAmmount].description, 'countMissing', { missingValuesAmmount: this.state.missingValuesAmmount });
            this.isCounting = false;
        });
    }
    estimateMissing() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isEstimating || this.state.missingValuesAmmount === null)
                return;
            this.isEstimating = true;
            if (this.state.missingValuesAmmount === 'NONE') {
                ConsoleController.log('El conjunto de datos no contiene valores faltantes');
                return;
            }
            const areValid = yield this.checkPrerequisitesMet(300, 600);
            if (!areValid) {
                this.isEstimating = false;
                return this.setState({ error: new PrerequisitesError() }, false);
            }
            const queryExecuted = yield this.queryDB('UPDATE', 200, 500);
            if (!queryExecuted) {
                this.isEstimating = false;
                return this.setState({ error: new DBError('No fue posible estimar los valores faltantes que contiene el conjunto de datos') }, false);
            }
            let newMissingAmmount, description;
            switch (this.state.missingValuesAmmount) {
                case 'LOW':
                    newMissingAmmount = 'NONE';
                    description = 'Los valores faltantes han sido estimados con éxito';
                    break;
                case 'MEDIUM':
                    newMissingAmmount = 'LOW';
                    description = 'Se ha reducido la cantidad de valores faltantes del conjunto de datos';
                    break;
                case 'HIGH':
                    newMissingAmmount = 'MEDIUM';
                    description = 'Se ha reducido la cantidad de valores faltantes del conjunto de datos';
                    break;
                default:
                    this.setState({ error: new BaseComponentError('state', 'Estado incorrecto') }, false);
                    this.isEstimating = false;
                    return;
            }
            yield this.addProcess(200, 500);
            this.setState({ missingValuesAmmount: newMissingAmmount });
            this.registerAction(description, 'estimateMissing', { missingValuesAmmount: this.state.missingValuesAmmount });
            this.isEstimating = false;
        });
    }
    describeState() {
        return [
            this.name,
            'El conjunto de datos' + (this.state.hasOutliers ? '' : ' no') + ' contiene anomalías',
            this.state.missingValuesAmmount === null ? 'No se ha determi nado la cantidad de valores faltantes que contiene el conjunto de datos' : MISSING_VALUE_AMMOUNTS[this.state.missingValuesAmmount].description
        ].join('\n');
    }
    getStatus() {
        const hadError = this.resetError();
        if (hadError)
            return 'ERRORED';
        const { hasOutliers, missingValuesAmmount } = this.state;
        if (hasOutliers === false && missingValuesAmmount === 'NONE') {
            return 'READY';
        }
        if (hasOutliers !== null || missingValuesAmmount !== null) {
            return 'CONFIGURING';
        }
        return 'INITIAL';
    }
}
