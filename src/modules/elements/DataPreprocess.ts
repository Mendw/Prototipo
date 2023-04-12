import { BaseKDDComponent, BaseComponentState, ComponentStatus, PrerequisitesError, DBError, BaseComponentError } from '../common.js';
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

export type MissingValuesAmmountType = keyof typeof MISSING_VALUE_AMMOUNTS;

interface DataPreprocessState extends BaseComponentState {
    hasOutliers: boolean | null;
    missingValuesAmmount: MissingValuesAmmountType | null;
}

export default class DataPreprocess extends BaseKDDComponent<DataPreprocessState> {
    name = 'Preprocesamiento de d.';
    className = 'DataPreprocess';

    isDetecting!: boolean;
    isEliminating!: boolean;
    isCounting!: boolean;
    isEstimating!: boolean;

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

    async outlierDetect() {
        if (this.isDetecting || this.state.hasOutliers !== null) return;
        this.isDetecting = true;

        const areValid = await this.checkPrerequisitesMet(300, 600);
        if (!areValid) { 
            this.isDetecting = false;
            return this.setState({ error: new PrerequisitesError() }, false);
        }

        const queryExecuted = await this.queryDB('SELECT', 200, 500);
        if (!queryExecuted) { 
            this.isDetecting = false;
            return this.setState({ error: new DBError('No fue posible detectar anomalías en el conjunto de datos')}, false);
        }

        await this.addProcess(200, 500);
        this.setState({ hasOutliers: this.randomPick([true, true, false]) }, false);

        const description = (!this.state.hasOutliers ? 'No se' : 'Se') + ' detectaron anomalías en el conjunto de datos';
        this.registerAction(description, 'outlierDetect');
        this.isDetecting = false;
    }

    async outlierRemove() {
        if (this.isEliminating || this.state.hasOutliers === null) { return; }

        if (this.state.hasOutliers === false) {
            ConsoleController.log('El conjunto de datos no contiene anomalías');
            return;
        }

        this.isEliminating = true;

        const areValid = await this.checkPrerequisitesMet(300, 600);
        if (!areValid) { 
            this.isEliminating = false;
            return this.setState({ error: new PrerequisitesError() }, false);
        }

        const queryExecuted = await this.queryDB('DELETE', 200, 500);
        if (!queryExecuted) { 
            this.isEliminating = false; 
            return this.setState({ error: new DBError('No fue posible eliminar las anomalias del conjunto de datos')}, false); 
        }

        await this.addProcess(200, 500);
        this.setState({
            hasOutliers: false
        }, false);

        this.registerAction('Las anomalías han sido eliminadas del conjunto de datos', 'outlierRemove');
        this.isEliminating = false;
    }

    async countMissing() {
        if (this.isCounting || this.state.missingValuesAmmount !== null) return;
        this.isCounting = true;

        const areValid = await this.checkPrerequisitesMet(300, 600);
        if (!areValid) { 
            this.isCounting = false;
            return this.setState({ error: new PrerequisitesError() }, false);
        }

        const queryExecuted = await this.queryDB('SELECT', 200, 500);
        if (!queryExecuted) {
            this.isCounting = false;
            return this.setState({ error: new DBError('No fue posible detectar la cantidad de valores faltantes en el conjunto de datos')}, false);
        }

        const newMissingValuesAmmount: MissingValuesAmmountType = this.randomPick(['NONE', 'LOW', 'LOW', 'MEDIUM', 'MEDIUM', 'MEDIUM', 'MEDIUM', 'HIGH']);
        this.setState({ missingValuesAmmount: newMissingValuesAmmount });

        await this.addProcess(200, 500);
        this.registerAction(
            MISSING_VALUE_AMMOUNTS[newMissingValuesAmmount].description, 
            'countMissing',
            { missingValuesAmmount: this.state.missingValuesAmmount });

        this.isCounting = false;
    }

    async estimateMissing() {
        if (this.isEstimating || this.state.missingValuesAmmount === null) return;
        this.isEstimating = true;

        if (this.state.missingValuesAmmount === 'NONE') {
            ConsoleController.log('El conjunto de datos no contiene valores faltantes');
            return;
        }

        const areValid = await this.checkPrerequisitesMet(300, 600);
        if (!areValid) {
            this.isEstimating = false;
            return this.setState({ error: new PrerequisitesError() }, false);
        }

        const queryExecuted = await this.queryDB('UPDATE', 200, 500);
        if (!queryExecuted) { 
            this.isEstimating = false;
            return this.setState({ error: new DBError('No fue posible estimar los valores faltantes que contiene el conjunto de datos')}, false);
        }

        let newMissingAmmount: MissingValuesAmmountType, description: string;
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

        await this.addProcess(200, 500);
        this.setState({ missingValuesAmmount: newMissingAmmount });
        this.registerAction(description, 'estimateMissing', { missingValuesAmmount: this.state.missingValuesAmmount });

        this.isEstimating = false;
    }

    describeState(): string {
        return [
            this.name,
            'El conjunto de datos' + (this.state.hasOutliers ? '' : ' no') + ' contiene anomalías',
            this.state.missingValuesAmmount === null ? 'No se ha determi nado la cantidad de valores faltantes que contiene el conjunto de datos' : MISSING_VALUE_AMMOUNTS[this.state.missingValuesAmmount].description
        ].join('\n');
    }

    getStatus(): ComponentStatus {
        const hadError = this.resetError();
        if (hadError) return 'ERRORED';
        
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