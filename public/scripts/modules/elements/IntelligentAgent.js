var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BaseComponent } from '../common.js';
import ConsoleController from '../controllers/ConsoleController.js';
import SuggestionInterface from '../controllers/SuggestionInterface.js';
export default class IntelligentAgent extends BaseComponent {
    constructor() {
        super(...arguments);
        this.name = 'Agente intelitente';
    }
    initialize() {
        this.actions.set('processAction', this.processAction);
        this.actions.set('suggestionRespond', this.suggestionRespond);
    }
    getInitialState() {
        return {
            activeSuggestion: null,
            userFeedback: []
        };
    }
    processAction(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { state, action } = message.content.payload;
            console.dir(state);
            const activeSuggestion = this.state.activeSuggestion;
            SuggestionInterface.showMessage('Generando sugerencia');
            if (activeSuggestion !== null && activeSuggestion.action !== action) {
                yield this.addProcess(300, 600);
                this.setState({
                    activeSuggestion: null,
                    userFeedback: [...this.state.userFeedback, { suggestion: activeSuggestion, response: 'IGNORED' }]
                }, false);
                ConsoleController.log(`Sugerencia ignorada: ${activeSuggestion.action}`);
            }
            yield this.addProcess(300, 600);
            const { response: KBResponse } = yield this.sendMessage('KnowledgeBase', {
                action: 'query',
                payload: state
            });
            if (KBResponse === undefined) {
                SuggestionInterface.showMessage('No fue posible generar una sugerencia');
                ConsoleController.log('No fue posible consultar la Base de Conocimientos', 'WARNING');
                return;
            }
            if (!KBResponse.canSuggest || KBResponse.suggestion === undefined) {
                SuggestionInterface.showMessage('No fue posible generar una sugerencia');
                return;
            }
            yield this.addProcess(600, 1200);
            this.setState({ activeSuggestion: { action: KBResponse.suggestion.action, state: state } }, false);
            this.sendMessage('SuggestionController', {
                action: 'suggestAction',
                payload: KBResponse.suggestion
            });
        });
    }
    suggestionRespond(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { suggestion, response } = message.content.payload;
            const suggestionDescription = suggestion.description;
            const activeSuggestion = this.state.activeSuggestion;
            if (activeSuggestion === null)
                return ConsoleController.log('No existe una sugerencia activa', 'WARNING');
            yield this.addProcess(500, 700);
            this.setState({
                activeSuggestion: null,
                userFeedback: [...this.state.userFeedback, { suggestion: activeSuggestion, response }]
            }, false);
            ConsoleController.log(response === 'ACCEPTED' ? `Sugerencia aceptada: ${suggestionDescription}` : `Sugerencia rechazada: ${suggestionDescription}`);
        });
    }
    getStatus() {
        return 'READY';
    }
}
