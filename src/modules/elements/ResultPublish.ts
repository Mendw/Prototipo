import { BaseComponentState, BaseKDDComponent, ComponentStatus, DBError, PrerequisitesError } from '../common.js';
import ConsoleController from '../controllers/ConsoleController.js';

export interface ResultPublishState extends BaseComponentState {
    hasSelected: boolean;
    hasExported: boolean;
} 

export default class ResultPublish extends BaseKDDComponent<ResultPublishState> {
    name = 'Publicación de resul.';
    className = 'ResultPublish';

    isSelecting!: boolean;
    isExporting!: boolean;

    initialize() {
        this.UIActions.set('publishSelect', this.publishSelect);
        this.UIActions.set('publishExport', this.publishExport);

        this.isSelecting = false;
        this.isExporting = false;
    }
    
    getPrerequisites() {
        return { dbConnected: [true], hasEvaluated: [true] };
    }

    getInitialState(): ResultPublishState {
        return {
            hasSelected: false,
            hasExported: false  
        };
    }

    async publishSelect() {
        if (this.isSelecting || this.state.hasSelected) return;
        this.isSelecting = true;

        const areValid = await this.checkPrerequisitesMet(300, 600);
        if (!areValid) {
            this.isSelecting = false;
            return this.setState({ error: new PrerequisitesError() }, false);
        }

        const queryExecuted = await this.queryDB('SELECT', 200, 600);
        if (!queryExecuted) {
            this.isSelecting = false;
            return this.setState({ error: new DBError('No fue posible seleccionar los patrones que seran exportados') }, false);
        }

        await this.addProcess(200, 600);
        this.setState({ hasSelected: true }, false);
        this.registerAction('Se seleccionaron los patrones que seran exportados', 'publishSelect');

        this.isSelecting = false;
    }

    async publishExport() {
        if (this.isExporting || this.state.hasExported) return;
        if (!this.state.hasSelected) {
            return ConsoleController.log('No se han seleccionado los patrones que serán exportados', 'DEBUG');
        }

        this.isExporting = true;

        const areValid = await this.checkPrerequisitesMet(300, 600);
        if (!areValid) {
            this.isExporting = false;
            return this.setState({ error: new PrerequisitesError() }, false);
        }

        const queryExecuted = await this.queryDB('SELECT', 200, 600);
        if (!queryExecuted) {
            this.isExporting = false;
            return this.setState({ error: new DBError('No fue posible exportar los patrones') }, false);
        }

        await this.addProcess(2000, 3000);
        this.setState({ hasExported: true }, false);
        this.registerAction('Se exportaron los patrones obtenidos del proceso de KDD', 'publishExport');

        this.isExporting = false;
    }

    describeState() {
        return [
            this.name,
            ( this.state.hasSelected ? 'Se' : 'No se' ) + ' han seleccionado los patrones que serán exportados',
            ( this.state.hasExported ? 'Se' : 'No se' ) + ' han exportado los patrones obtenidos del proceso de KDD'
        ].join('\n');
    }

    

    getStatus(): ComponentStatus {
        const hadError = this.resetError();
        if (hadError) return 'ERRORED';

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