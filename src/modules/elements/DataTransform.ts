import { BaseComponentError, BaseComponentState, BaseKDDComponent, ComponentStatus, DBError, PrerequisitesError } from '../common.js';
import ConsoleController from '../controllers/ConsoleController.js';

export const DATATYPES = {
    NUMERIC: 'Numéricos',
    ALPHANUMERIC: 'Alfanuméricos',
    PARAMETERIZED: 'Parametrizados'
} as const;

const DIMENSIONS = {
    HIGH: 'Alta',
    INTERMEDIATE: 'Intermedia',
    LOW: 'Baja'
} as const;

const CORRELATIONS = {
    HIGH: 'Alta',
    INTERMEDIATE: 'Intermedia',
    LOW: 'Baja',
    NONE: 'Ninguna'
} as const;

export type Dimensions = keyof typeof DIMENSIONS;
export type Datatypes = keyof typeof DATATYPES;
export type Correlations = keyof typeof CORRELATIONS;

export interface DataTransformState extends BaseComponentState {
    hasExaminedDataset: boolean;

    datatypes: Datatypes | null;
    rowAmmount: Dimensions | null;
    columnAmmount: Dimensions | null;
    correlation: Correlations | null;
}

export default class DataTransform extends BaseKDDComponent<DataTransformState> {
    name = 'Transformación de datos';
    className = 'DataTransform';
    
    isExamining!: boolean;
    isEditing!: boolean;
    isFiltering!: boolean;
    isReducing!: boolean;

    initialize() {
        this.UIActions.set('transformExamine', this.transformExamine);
        this.UIActions.set('transformEdit', this.transformEdit);
        this.UIActions.set('transformFilter', this.transformFilter);
        this.UIActions.set('transformReduce', this.transformReduce);

        this.isExamining = false;
        this.isEditing = false;
        this.isFiltering = false;
        this.isReducing = false;
    }

    getInitialState(): DataTransformState {
        return {
            hasExaminedDataset: false,
            datatypes: null,
            rowAmmount: null,
            columnAmmount: null,
            correlation: null,
        };
    }

    getPrerequisites() {
        return { dbConnected: [true], hasLoadedData: [true], hasSelectedTables: [true] };
    }

    async transformExamine() {
        if (this.isExamining || this.state.hasExaminedDataset) return;
        this.isExamining = true;

        const areValid = await this.checkPrerequisitesMet(300, 600);
        if (!areValid) { 
            this.isExamining = false;
            return this.setState({ error: new PrerequisitesError() }, false);
        }

        const queryExecuted = await this.queryDB('SELECT', 200, 500);
        if (!queryExecuted) { 
            this.isExamining = false;
            return this.setState({ error: new DBError('No fue posible examinar el conjunto de datos')}, false); 
        }

        await this.addProcess(200, 700);
        this.setState({
            hasExaminedDataset: true,
            datatypes: this.randomPick(['NUMERIC', 'ALPHANUMERIC', 'PARAMETERIZED']),
            rowAmmount: this.randomPick(['HIGH', 'INTERMEDIATE', 'LOW']),
            columnAmmount: this.randomPick(['HIGH', 'INTERMEDIATE', 'LOW']),
            correlation: this.randomPick(['HIGH', 'INTERMEDIATE', 'LOW', 'NONE'])
        });

        const { hasExaminedDataset, datatypes, rowAmmount, columnAmmount, correlation } = this.state;
        this.registerAction(
            'Se examinó el conjunto de datos',
            'transformExamine',
            { hasExaminedDataset, datatypes, rowAmmount, columnAmmount, correlation }
        );
        this.isExamining = false;
    }

    async transformEdit() {
        if (this.isEditing || !this.state.hasExaminedDataset || this.state.datatypes === null) return;
        this.isEditing = true;

        const areValid = await this.checkPrerequisitesMet(300, 600);
        if (!areValid) { 
            this.isEditing = false;
            return this.setState({ error: new PrerequisitesError() }, false);
        }

        const queryExecuted = await this.queryDB('UPDATE', 200, 500);
        if (!queryExecuted) { 
            this.isEditing = false;
            return this.setState({ error: new DBError('No fue posible cambiar el tipo de datos de las columnas del conjunto de datos')}, false); 
        }

        await this.addProcess(200, 500);
        const prevDatatypes = this.state.datatypes;
        this.setState({ datatypes: this.randomPick(['NUMERIC', 'ALPHANUMERIC', 'PARAMETERIZED']) });

        const description = `El tipo de datos de las columnas del conjunto de datos ${prevDatatypes === this.state.datatypes ? 'se mantuvo igual' : `fue modificado de ${DATATYPES[prevDatatypes]} a ${DATATYPES[this.state.datatypes]}`}`;
        this.registerAction(description, 'transformEdit', { datatypes: this.state.datatypes });
        this.isEditing = false;
    }

    async transformFilter() {
        if (this.isFiltering || !this.state.hasExaminedDataset || this.state.rowAmmount === null) return;
        if (this.state.rowAmmount === 'LOW') {
            ConsoleController.log('No es posible reducir la cantidad de filas del conjunto de datos', 'DEBUG');
            return;
        }

        this.isFiltering = true;
        const areValid = await this.checkPrerequisitesMet(300, 600);
        if (!areValid) { 
            this.isFiltering = false;
            return this.setState({ error: new PrerequisitesError() }, false);
        }

        const queryExecuted = await this.queryDB('DELETE', 200, 500);
        if (!queryExecuted) { 
            this.isFiltering = false;
            return this.setState({ error: new DBError('No fue posible reducir la cantidad de filas del conjunto de datos')}, false); 
        }

        let newRowAmmount: Dimensions;
        switch (this.state.rowAmmount) {
        case 'HIGH':
            newRowAmmount = 'INTERMEDIATE';
            break;
        case 'INTERMEDIATE':
            newRowAmmount = 'LOW';
            break;
        default:
            this.setState({ error: new BaseComponentError('state', 'Estado incorrecto') }, false);
            this.isFiltering = false;
            return;
        }

        await this.addProcess(200, 500);
        this.setState({ rowAmmount: newRowAmmount }, false);

        this.registerAction('Se redujo la cantidad de filas del conjunto de datos', 'transformFilter');
        this.isFiltering = false;
    }

    async transformReduce() {
        if (this.isReducing || !this.state.hasExaminedDataset || this.state.columnAmmount === null) return;
        if (this.state.columnAmmount === 'LOW') {
            ConsoleController.log('No es posible reducir la cantidad de columnas del conjunto de datos', 'DEBUG');
            return;
        }

        this.isReducing = true;
        const areValid = await this.checkPrerequisitesMet(300, 600);
        if (!areValid) { 
            this.isReducing = false;
            return this.setState({ error: new PrerequisitesError() }, false);
        }

        const queryExecuted = await this.queryDB('UPDATE', 200, 500);
        if (!queryExecuted) { 
            this.isReducing = false;
            return this.setState({ error: new DBError('No fue posible reducir la cantidad de columnas del conjunto de datos')}, false); 
        }

        let newColumnAmmount: Dimensions;
        let newCorrelation: Correlations | null = null, correlationChangeDescription = '';

        switch (this.state.columnAmmount) {
        case 'HIGH':
            newColumnAmmount = 'INTERMEDIATE';
            break;
        case 'INTERMEDIATE':
            newColumnAmmount = 'LOW';
            break;
        default:
            this.setState({ error: new BaseComponentError('state', 'Estado incorrecto') }, false);
            this.isReducing = false;
            return;
        }

        switch (this.state.correlation) {
        case 'HIGH':
            if (Math.random() < 2/3) {
                if (Math.random() < 2/3) {
                    newCorrelation = 'INTERMEDIATE';
                    correlationChangeDescription = ' Se disminuyó la correlación entre las columnas (Alta -> Intermedia)';
                } else {
                    newCorrelation = 'LOW';
                    correlationChangeDescription = ' Se disminuyó la correlación entre las columnas (Alta -> Baja)';
                }
            }
            break;
        case 'INTERMEDIATE':
            if (Math.random() < 2/3) {
                newCorrelation = 'LOW';
                correlationChangeDescription = ' Se disminuyó la correlación entre las columnas (Intermedia -> Baja)';
            }
            break;
        case 'LOW':
        case 'NONE':
            correlationChangeDescription = ' La correlacion entre las columnas se mantuvo igual';
        }

        await this.addProcess(200, 500);
        this.setState({ columnAmmount: newColumnAmmount, correlation: newCorrelation || this.state.correlation });

        const columnAmmountChangeDescription = 'Se redujo la cantidad de columnas del conjunto de datos.';
        this.registerAction(columnAmmountChangeDescription + correlationChangeDescription, 'transformReduce', { columnAmmount: newColumnAmmount, correlation: this.state.correlation });
        this.isReducing = false;
    }

    describeState(): string {
        return [
            this.name,
            this.state.hasExaminedDataset ? 'Se ha examinado el conjunto de datos' : 'No se ha examinado el conjunto de datos',
            this.state.datatypes !== null && `Tipos de dato: ${DATATYPES[this.state.datatypes]}`,
            this.state.columnAmmount !== null && `Cantidad de columnas: ${DIMENSIONS[this.state.columnAmmount]}`,
            this.state.rowAmmount !== null && `Cantidad de filas: ${DIMENSIONS[this.state.rowAmmount]}`,
            this.state.correlation !== null && `Correlación: ${CORRELATIONS[this.state.correlation]}`,
        ].filter(value => Boolean(value)).join('\n');
    }

    getStatus(): ComponentStatus {
        const hadError = this.resetError();
        if (hadError) return 'ERRORED';

        const { hasExaminedDataset } = this.state;
        if (hasExaminedDataset) {
            return 'READY';
        }

        return 'INITIAL';
    }
}