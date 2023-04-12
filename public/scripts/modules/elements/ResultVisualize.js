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
export default class ResultVisualize extends BaseKDDComponent {
    constructor() {
        super(...arguments);
        this.name = 'Visualización de resul.';
        this.className = 'ResultVisualize';
    }
    initialize() {
        this.UIActions.set('visualizeResults', this.visualizeResults);
        this.UIActions.set('visualizeSelect', this.visualizeSelect);
        this.UIActions.set('visualizeEvaluate', this.visualizeEvaluate);
        this.isVisualizing = false;
        this.isSelecting = false;
        this.isEvaluating = false;
    }
    getPrerequisites() {
        return { dbConnected: [true], dataMined: [true] };
    }
    getInitialState() {
        return {
            hasSelectedResults: false,
            hasVisualized: false,
            hasEvaluated: false
        };
    }
    visualizeResults() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isVisualizing || this.state.hasVisualized)
                return;
            this.isVisualizing = true;
            const areValid = yield this.checkPrerequisitesMet(300, 600);
            if (!areValid) {
                this.isVisualizing = false;
                return this.setState({ error: new PrerequisitesError() }, false);
            }
            const queryExecuted = yield this.queryDB('SELECT', 300, 600);
            if (!queryExecuted) {
                this.isVisualizing = false;
                return this.setState({ error: new DBError('No fue posible visualizar los resultados del proceso de KDD') }, false);
            }
            yield this.addProcess(200, 500);
            this.setState({ hasVisualized: true }, false);
            this.registerAction('Se visualizaron los resultados del proceso de KDD', 'visualizeResults');
            this.isVisualizing = false;
        });
    }
    visualizeSelect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isSelecting || this.state.hasSelectedResults)
                return;
            if (!this.state.hasVisualized) {
                return ConsoleController.log('No se han visualizado los resultados del proceso de KDD', 'DEBUG');
            }
            this.isSelecting = true;
            const areValid = yield this.checkPrerequisitesMet(300, 600);
            if (!areValid) {
                this.isSelecting = false;
                return this.setState({ error: new PrerequisitesError() }, false);
            }
            const queryExecuted = yield this.queryDB('SELECT', 300, 600);
            if (!queryExecuted) {
                this.isSelecting = false;
                return this.setState({ error: new DBError('No fue posible seleccionar los patrones obtenidos') }, false);
            }
            yield this.addProcess(200, 500);
            this.setState({ hasSelectedResults: true }, false);
            this.registerAction('Se seleccionaron los patrones obtenidos del proceso de KDD', 'visualizeSelect');
            this.isSelecting = false;
        });
    }
    visualizeEvaluate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isEvaluating || this.state.hasEvaluated)
                return;
            if (!this.state.hasSelectedResults) {
                return ConsoleController.log('No se han seleccionado los patrones obtenidos del proceso de KDD', 'DEBUG');
            }
            this.isEvaluating = true;
            const areValid = yield this.checkPrerequisitesMet(300, 600);
            if (!areValid) {
                this.isEvaluating = false;
                return this.setState({ error: new PrerequisitesError() }, false);
            }
            const queryExecuted = yield this.queryDB('SELECT', 300, 600);
            if (!queryExecuted) {
                this.isEvaluating = false;
                return this.setState({ error: new DBError('No fue posible evaluar los patrones obtenidos') }, false);
            }
            yield this.addProcess(200, 500);
            this.setState({ hasEvaluated: true }, false);
            this.registerAction('Se evaluaron los patrones obtenidos del proceso de KDD', 'visualizeEvaluate', { hasEvaluated: true });
            this.isEvaluating = false;
        });
    }
    describeState() {
        return [
            this.name,
            (this.state.hasVisualized ? 'Se' : 'No se') + ' han visualizado los patrones obtenidos del proceso de KDD',
            (this.state.hasSelectedResults ? 'Se' : 'No se') + ' han seleccionado los patrones mas relevantes',
            (this.state.hasEvaluated ? 'Se' : 'No se') + ' han evaluado los patrones seleccionados'
        ].join('\n');
    }
    getStatus() {
        const hadError = this.resetError();
        if (hadError)
            return 'ERRORED';
        const { hasVisualized, hasSelectedResults, hasEvaluated } = this.state;
        if ([hasVisualized, hasSelectedResults, hasEvaluated].every(value => value)) {
            return 'READY';
        }
        if ([hasVisualized, hasSelectedResults, hasEvaluated].some(value => value)) {
            return 'CONFIGURING';
        }
        return 'INITIAL';
    }
}
