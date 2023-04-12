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
import ConsoleController from '../controllers/ConsoleController.js';
export default class ResultPublish extends BaseKDDComponent {
    constructor() {
        super(...arguments);
        this.name = 'Publicación de resul.';
        this.className = 'ResultPublish';
    }
    initialize() {
        this.UIActions.set('publishSelect', this.publishSelect);
        this.UIActions.set('publishExport', this.publishExport);
        this.isSelecting = false;
        this.isExporting = false;
    }
    getPrerequisites() {
        return { dbConnected: [true], hasEvaluated: [true] };
    }
    getInitialState() {
        return {
            hasSelected: false,
            hasExported: false
        };
    }
    publishSelect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isSelecting || this.state.hasSelected)
                return;
            this.isSelecting = true;
            const areValid = yield this.checkPrerequisitesMet(300, 600);
            if (!areValid) {
                this.isSelecting = false;
                return this.setState({ error: new PrerequisitesError() }, false);
            }
            const queryExecuted = yield this.queryDB('SELECT', 200, 600);
            if (!queryExecuted) {
                this.isSelecting = false;
                return this.setState({ error: new DBError('No fue posible seleccionar los patrones que seran exportados') }, false);
            }
            yield this.addProcess(200, 600);
            this.setState({ hasSelected: true }, false);
            this.registerAction('Se seleccionaron los patrones que seran exportados', 'publishSelect');
            this.isSelecting = false;
        });
    }
    publishExport() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isExporting || this.state.hasExported)
                return;
            if (!this.state.hasSelected) {
                return ConsoleController.log('No se han seleccionado los patrones que serán exportados', 'DEBUG');
            }
            this.isExporting = true;
            const areValid = yield this.checkPrerequisitesMet(300, 600);
            if (!areValid) {
                this.isExporting = false;
                return this.setState({ error: new PrerequisitesError() }, false);
            }
            const queryExecuted = yield this.queryDB('SELECT', 200, 600);
            if (!queryExecuted) {
                this.isExporting = false;
                return this.setState({ error: new DBError('No fue posible exportar los patrones') }, false);
            }
            yield this.addProcess(2000, 3000);
            this.setState({ hasExported: true }, false);
            this.registerAction('Se exportaron los patrones obtenidos del proceso de KDD', 'publishExport');
            this.isExporting = false;
        });
    }
    describeState() {
        return [
            this.name,
            (this.state.hasSelected ? 'Se' : 'No se') + ' han seleccionado los patrones que serán exportados',
            (this.state.hasExported ? 'Se' : 'No se') + ' han exportado los patrones obtenidos del proceso de KDD'
        ].join('\n');
    }
    getStatus() {
        const hadError = this.resetError();
        if (hadError)
            return 'ERRORED';
        const { hasSelected, hasExported } = this.state;
        if ([hasSelected, hasExported].every(value => value)) {
            return 'READY';
        }
        if ([hasSelected, hasExported].some(value => value)) {
            return 'CONFIGURING';
        }
        return 'INITIAL';
    }
}
