var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BaseKDDComponent, DBError, PrerequisitesError } from '../common.js';
export default class DataSelection extends BaseKDDComponent {
    constructor() {
        super(...arguments);
        this.name = 'Selección de datos';
        this.className = 'DataSelection';
    }
    initialize() {
        this.UIActions.set('loadData', this.loadData);
        this.UIActions.set('selectTables', this.selectTables);
        this.UIActions.set('combineTables', this.combineTables);
        this.isLoadingData = false;
        this.isSelectingTables = false;
        this.isCombiningTables = false;
    }
    getInitialState() {
        return {
            hasLoadedData: false,
            hasSelectedTables: false,
            hasCombinedTables: false
        };
    }
    getPrerequisites() {
        return { dbConnected: [true] };
    }
    loadData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isLoadingData)
                return;
            this.isLoadingData = true;
            const areValid = yield this.checkPrerequisitesMet(300, 600);
            if (!areValid) {
                this.isLoadingData = false;
                return this.setState({ error: new PrerequisitesError() }, false);
            }
            const queryExecuted = yield this.queryDB('INSERT', 200, 500);
            if (!queryExecuted) {
                this.isLoadingData = false;
                return this.setState({ error: new DBError('No fue posible cargar datos al conjunto de datos') }, false);
            }
            yield this.addProcess(200, 500);
            this.setState({ hasLoadedData: true });
            this.registerAction('Nuevos datos almacenados en la base de datos', 'loadData', { hasLoadedData: true });
            this.isLoadingData = false;
        });
    }
    selectTables() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isSelectingTables || this.state.hasSelectedTables)
                return;
            this.isSelectingTables = true;
            const areValid = yield this.checkPrerequisitesMet(300, 600);
            if (!areValid) {
                this.isSelectingTables = false;
                return this.setState({ error: new PrerequisitesError() }, false);
            }
            const queryExecuted = yield this.queryDB('SELECT', 200, 500);
            if (!queryExecuted) {
                this.isSelectingTables = false;
                return this.setState({ error: new DBError('No fue posible seleccionar tablas del conjunto de datos') }, false);
            }
            yield this.addProcess(200, 500);
            this.setState({ hasSelectedTables: true });
            this.registerAction('Se seleccionaron las tablas del conjunto de datos', 'selectTables', { hasSelectedTables: true });
            this.isSelectingTables = false;
        });
    }
    combineTables() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isCombiningTables || this.state.hasCombinedTables)
                return;
            this.isCombiningTables = true;
            const areValid = yield this.checkPrerequisitesMet(300, 600);
            if (!areValid) {
                this.isCombiningTables = false;
                return this.setState({ error: new PrerequisitesError() }, false);
            }
            const queryExecuted1 = yield this.queryDB('SELECT', 200, 500);
            if (!queryExecuted1) {
                this.isCombiningTables = false;
                return this.setState({ error: new DBError('No fue posible combinar tablas del conjunto de datos (SELECT)') }, false);
            }
            const queryExecuted2 = yield this.queryDB('INSERT', 200, 500);
            if (!queryExecuted2) {
                this.isCombiningTables = false;
                return this.setState({ error: new DBError('No fue posible combinar tablas del conjunto de datos (INSERT)') }, false);
            }
            yield this.addProcess(200, 500);
            this.setState({ hasCombinedTables: true }, false);
            this.registerAction('Se combinaron tablas del conjunto de datos', 'combineTables');
            this.isCombiningTables = false;
        });
    }
    describeState() {
        return [
            this.name,
            (this.state.hasLoadedData ? 'Se' : 'No se') + ' han almacenado datos en la base de datos',
            (this.state.hasSelectedTables ? 'Se' : 'No se') + ' han seleccionado las tablas del conjunto de datos',
            (this.state.hasCombinedTables ? 'Se' : 'No se') + ' han combinado tablas del conjunto de datos'
        ].join('\n');
    }
    getStatus() {
        const hadError = this.resetError();
        if (hadError)
            return 'ERRORED';
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
