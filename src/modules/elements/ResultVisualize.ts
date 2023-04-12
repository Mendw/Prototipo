import { BaseComponentState, BaseKDDComponent, ComponentStatus, DBError, PrerequisitesError } from '../common.js';
import ConsoleController from '../controllers/ConsoleController.js';

export interface ResultInterpretState extends BaseComponentState {
    hasVisualized: boolean;
    hasSelectedResults: boolean;
    hasEvaluated: boolean;
} 

export default class ResultVisualize extends BaseKDDComponent<ResultInterpretState> {
    name = 'Visualización de resul.';
    className = 'ResultVisualize';
    
    isVisualizing!: boolean;
    isSelecting!: boolean;
    isEvaluating!: boolean;

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

    getInitialState(): ResultInterpretState {
        return {
            hasSelectedResults: false,
            hasVisualized: false,
            hasEvaluated: false
        };
    }

    async visualizeResults() {
        if (this.isVisualizing || this.state.hasVisualized) return;
        this.isVisualizing = true;

        const areValid = await this.checkPrerequisitesMet(300, 600);
        if (!areValid) {
            this.isVisualizing = false;
            return this.setState({ error: new PrerequisitesError() }, false);
        }

        const queryExecuted = await this.queryDB('SELECT', 300, 600);
        if (!queryExecuted) {
            this.isVisualizing = false;
            return this.setState({ error: new DBError('No fue posible visualizar los resultados del proceso de KDD') }, false);
        }

        await this.addProcess(200, 500);
        this.setState({ hasVisualized: true }, false);
        this.registerAction('Se visualizaron los resultados del proceso de KDD', 'visualizeResults');
        this.isVisualizing = false;
    }

    async visualizeSelect() {
        if (this.isSelecting || this.state.hasSelectedResults) return;
        
        if (!this.state.hasVisualized) {
            return ConsoleController.log('No se han visualizado los resultados del proceso de KDD', 'DEBUG');
        }
        
        this.isSelecting = true;
        const areValid = await this.checkPrerequisitesMet(300, 600);
        if (!areValid) {
            this.isSelecting = false;
            return this.setState({ error: new PrerequisitesError() }, false);
        }

        const queryExecuted = await this.queryDB('SELECT', 300, 600);
        if (!queryExecuted) {
            this.isSelecting = false;
            return this.setState({ error: new DBError('No fue posible seleccionar los patrones obtenidos') }, false);
        }

        await this.addProcess(200, 500);
        this.setState({ hasSelectedResults: true }, false);
        this.registerAction('Se seleccionaron los patrones obtenidos del proceso de KDD', 'visualizeSelect');
        this.isSelecting = false;
    }

    async visualizeEvaluate() {
        if (this.isEvaluating || this.state.hasEvaluated) return;
        if (!this.state.hasSelectedResults) {
            return ConsoleController.log('No se han seleccionado los patrones obtenidos del proceso de KDD', 'DEBUG');
        }

        this.isEvaluating = true;

        const areValid = await this.checkPrerequisitesMet(300, 600);
        if (!areValid) {
            this.isEvaluating = false;
            return this.setState({ error: new PrerequisitesError() }, false);
        }

        const queryExecuted = await this.queryDB('SELECT', 300, 600);
        if (!queryExecuted) {
            this.isEvaluating = false;
            return this.setState({ error: new DBError('No fue posible evaluar los patrones obtenidos') }, false);
        }

        await this.addProcess(200, 500);
        this.setState({ hasEvaluated: true }, false);
        this.registerAction('Se evaluaron los patrones obtenidos del proceso de KDD', 'visualizeEvaluate', { hasEvaluated: true });
        this.isEvaluating = false;
    }
    
    describeState() {
        return [
            this.name,
            (this.state.hasVisualized ? 'Se' : 'No se' ) + ' han visualizado los patrones obtenidos del proceso de KDD',
            (this.state.hasSelectedResults ? 'Se' : 'No se' ) + ' han seleccionado los patrones mas relevantes',
            (this.state.hasEvaluated ? 'Se' : 'No se' ) + ' han evaluado los patrones seleccionados'
        ].join('\n');
    }

    getStatus(): ComponentStatus {
        const hadError = this.resetError();
        if (hadError) return 'ERRORED';

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