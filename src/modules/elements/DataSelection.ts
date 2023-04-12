import { BaseComponentState, BaseKDDComponent, ComponentStatus, DBError, PrerequisitesError } from '../common.js';

export interface DataSelectionState extends BaseComponentState {
    hasLoadedData: boolean;
    hasSelectedTables: boolean;
    hasCombinedTables: boolean;
}

export default class DataSelection extends BaseKDDComponent<DataSelectionState> {
    name = 'Selección de datos';
    className = 'DataSelection';
    
    isLoadingData!: boolean;
    isSelectingTables!: boolean;
    isCombiningTables!: boolean;

    initialize() {
        this.UIActions.set('loadData', this.loadData);
        this.UIActions.set('selectTables', this.selectTables);
        this.UIActions.set('combineTables', this.combineTables);

        this.isLoadingData = false;
        this.isSelectingTables = false;
        this.isCombiningTables = false;
    }

    getInitialState(): DataSelectionState {
        return { 
            hasLoadedData: false,
            hasSelectedTables: false,
            hasCombinedTables: false
        };
    }

    getPrerequisites() {
        return { dbConnected: [true] };
    }

    async loadData() {
        if (this.isLoadingData) return;
        this.isLoadingData = true;

        const areValid = await this.checkPrerequisitesMet(300, 600);
        if (!areValid) { 
            this.isLoadingData = false;
            return this.setState({ error: new PrerequisitesError() }, false);
        }

        const queryExecuted = await this.queryDB('INSERT', 200, 500);
        if (!queryExecuted) { 
            this.isLoadingData = false;
            return this.setState({ error: new DBError('No fue posible cargar datos al conjunto de datos')}, false);
        }
        
        await this.addProcess(200, 500);
        this.setState({ hasLoadedData: true });
        this.registerAction('Nuevos datos almacenados en la base de datos', 'loadData', { hasLoadedData: true });
        this.isLoadingData = false;
    }

    async selectTables() {
        if (this.isSelectingTables || this.state.hasSelectedTables) return;
        this.isSelectingTables = true;

        const areValid = await this.checkPrerequisitesMet(300, 600);
        if (!areValid) { 
            this.isSelectingTables = false;
            return this.setState({ error: new PrerequisitesError() }, false);
        }

        const queryExecuted = await this.queryDB('SELECT', 200, 500);
        if (!queryExecuted) { 
            this.isSelectingTables = false;
            return this.setState({ error: new DBError('No fue posible seleccionar tablas del conjunto de datos')}, false);
        }

        await this.addProcess(200, 500);
        this.setState({ hasSelectedTables: true });
        this.registerAction('Se seleccionaron las tablas del conjunto de datos', 'selectTables', { hasSelectedTables: true });
        this.isSelectingTables = false;
    }

    async combineTables() {
        if (this.isCombiningTables || this.state.hasCombinedTables) return;
        this.isCombiningTables = true;

        const areValid = await this.checkPrerequisitesMet(300, 600);
        if (!areValid) {
            this.isCombiningTables = false;
            return this.setState({ error: new PrerequisitesError() }, false);
        }

        const queryExecuted1 = await this.queryDB('SELECT', 200, 500);
        if (!queryExecuted1) { 
            this.isCombiningTables = false;
            return this.setState({ error: new DBError('No fue posible combinar tablas del conjunto de datos (SELECT)')}, false);
        }

        const queryExecuted2 = await this.queryDB('INSERT', 200, 500);
        if (!queryExecuted2) { 
            this.isCombiningTables = false;
            return this.setState({ error: new DBError('No fue posible combinar tablas del conjunto de datos (INSERT)')}, false);
        }

        await this.addProcess(200, 500);
        this.setState({ hasCombinedTables: true }, false);
        this.registerAction('Se combinaron tablas del conjunto de datos', 'combineTables');
        this.isCombiningTables = false;
    }

    describeState(): string {
        return [
            this.name,
            (this.state.hasLoadedData ? 'Se' : 'No se') + ' han almacenado datos en la base de datos',
            (this.state.hasSelectedTables ? 'Se' : 'No se') + ' han seleccionado las tablas del conjunto de datos',
            (this.state.hasCombinedTables ? 'Se' : 'No se') + ' han combinado tablas del conjunto de datos'
        ].join('\n');
    }

    getStatus(): ComponentStatus {
        const hadError = this.resetError();
        if (hadError) return 'ERRORED';

        const { hasCombinedTables, hasLoadedData, hasSelectedTables } = this.state;
        if (hasLoadedData && hasSelectedTables && hasCombinedTables) {
            return 'READY';
        }

        if (hasLoadedData || hasSelectedTables || hasCombinedTables) {
            return 'CONFIGURING';
        }

        return 'INITIAL';
    }
}