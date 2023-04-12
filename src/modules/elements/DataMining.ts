import { BaseComponentError, BaseComponentState, BaseKDDComponent, ComponentStatus, DBError, KDDComponentPrerequisites, PrerequisitesError } from '../common.js';
import ConsoleController from '../controllers/ConsoleController.js';
import { MissingValuesAmmountType, MISSING_VALUE_AMMOUNTS } from './DataPreprocess.js';
import { DATATYPES, Datatypes } from './DataTransform.js';

export interface AlgorithmRequirements {
    missingValuesAmmount: MissingValuesAmmountType[],
    datatypes: Datatypes[]
}

export interface DataMiningState extends BaseComponentState {
    algorithmSelected: boolean;
    algorithmRequirements: AlgorithmRequirements | null;
    algorithmConfigured: boolean;
    dataMined: boolean;
}

export default class DataMining extends BaseKDDComponent<DataMiningState> {
    name = 'Minería de datos';
    className = 'DataMining';

    isSelecting!: boolean;
    isConfiguring!: boolean;
    isExecuting!: boolean;

    initialize() {
        this.UIActions.set('mineSelect', this.mineSelect);
        this.UIActions.set('mineConfigure', this.mineConfigure);
        this.UIActions.set('mineExecute', this.mineExecute);

        this.isSelecting = false;
        this.isConfiguring = false;
        this.isExecuting = false;
    }

    getInitialState(): DataMiningState {
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

    async mineSelect() {
        if (this.isSelecting || this.state.algorithmSelected) return;
        this.isSelecting = true;

        const areValid = await this.checkPrerequisitesMet(300, 600);
        if (!areValid) {
            this.isSelecting = false;
            return this.setState({ error: new PrerequisitesError() }, false);
        }

        const queryExecuted = await this.queryDB('SELECT', 200, 500);
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

        await this.addProcess(200, 500);
        this.registerAction('Algoritmo de minería de datos seleccionado', 'mineSelect', { algorithmRequirements: this.state.algorithmRequirements });
        this.isSelecting = false;
    }

    async mineConfigure() {
        if (this.isConfiguring || this.state.algorithmConfigured) return;
        if (!this.state.algorithmSelected) {
            ConsoleController.log('No se ha seleccionado el algoritmo de minería de datos', 'DEBUG');
            return;
        }

        await this.addProcess(300, 600);
        this.setState({
            algorithmConfigured: true
        });

        await this.addProcess(200, 500);
        this.registerAction('Algoritmo de minería de datos configurado', 'mineConfigure', { algorithmConfigured: true });
        this.isConfiguring = false;
    }

    async mineExecute() {
        if (this.isExecuting || this.state.dataMined || this.state.algorithmRequirements === null) return;
        if (!this.state.algorithmConfigured) {
            ConsoleController.log('El algoritmo de minería de datos no ha sido configurado', 'DEBUG');
            return;
        }

        this.isExecuting = true;

        await this.addProcess(300, 600);
        const prerequisites: KDDComponentPrerequisites = this.getPrerequisites();
        Object.assign(prerequisites, this.state.algorithmRequirements);

        const prerequisiteCheckResult = await this.checkPrerequisites(prerequisites);
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

        const queryExecuted = await this.queryDB('MINE', 200, 500);
        if (!queryExecuted) {
            this.isExecuting = false;
            return this.setState({ error: new DBError('No fue posible cargar datos al conjunto de datos') }, false);
        }

        await this.addProcess(4000, 5000);
        this.setState({
            dataMined: true
        });

        this.registerAction('Algoritmo de minería de datos ejecutado', 'mineExecute' ,{ dataMined: true });
        this.isExecuting = false;
    }

    describeState(): string {
        const stateParts = [this.name];
        if (this.state.algorithmSelected) {
            stateParts.push('Se ha seleccionado un algoritmo de minería de datos');
            if (this.state.algorithmRequirements) {
                stateParts.push('Requerimientos: ');
                stateParts.push(` - Cantidad de valores faltantes: ${this.state.algorithmRequirements.missingValuesAmmount.map(ammount => MISSING_VALUE_AMMOUNTS[ammount].name).join('/')}`);
                stateParts.push(` - Tipos de datos: ${this.state.algorithmRequirements.datatypes.map(datatype => DATATYPES[datatype]).join('/')}`);
            }
        } else {
            stateParts.push('No se ha seleccionado un algoritmo de mineria de datos');
        }

        if (this.state.algorithmConfigured) {
            stateParts.push('El algoritmo de minería de datos fue configurado');
        } else {
            stateParts.push('No se ha configurado el algoritmo de minería de datos');
        }

        return stateParts.join('\n');
    }

    getStatus(): ComponentStatus {
        const hadError = this.resetError();
        if (hadError) return 'ERRORED';

        if (this.state.algorithmSelected && this.state.algorithmConfigured && this.state.dataMined) return 'READY';
        if (this.state.algorithmSelected) return 'CONFIGURING';

        return 'INITIAL';
    }
}