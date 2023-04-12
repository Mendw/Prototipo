import { BaseComponent, ComponentStatus, Message } from '../common.js';
import ConsoleController from '../controllers/ConsoleController.js';
import SuggestionInterface, { SuggestionMessage } from '../controllers/SuggestionInterface.js';
import { ActionRegistrationState } from './ActionRegistration.js';
import { SuggestionAction } from './KnowledgeBase.js';

interface UserFeedback {
    suggestion: Suggestion;
    response: SuggestionResponse;
}

interface Suggestion {
    action: SuggestionAction;
    state: ActionRegistrationState;
}

interface IntelligentAgentState {
    activeSuggestion: Suggestion | null;
    userFeedback: UserFeedback[];
}

interface KnowledgeBaseResponse {
    response?: {
        canSuggest: boolean;
        suggestion?: SuggestionMessage 
    }
}

export interface UserResponse {
    suggestion: SuggestionMessage;
    response: SuggestionResponse;
}

type SuggestionResponse = 'ACCEPTED' | 'REJECTED' | 'IGNORED';
export default class IntelligentAgent extends BaseComponent<IntelligentAgentState> {
    name = 'Agente intelitente';

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

    async processAction(message: Message) {
        const { state, action } = message.content.payload as Suggestion;
        console.dir(state);
        const activeSuggestion = this.state.activeSuggestion;

        SuggestionInterface.showMessage('Generando sugerencia');

        if (activeSuggestion !== null && activeSuggestion.action !== action) {
            await this.addProcess(300, 600);
            this.setState({
                activeSuggestion: null,
                userFeedback: [...this.state.userFeedback, { suggestion: activeSuggestion, response: 'IGNORED' }]
            }, false);
    
            ConsoleController.log(`Sugerencia ignorada: ${activeSuggestion.action}`);
        }
        
        await this.addProcess(300, 600);
        const { response: KBResponse } = await this.sendMessage('KnowledgeBase', {
            action: 'query',
            payload: state
        }) as KnowledgeBaseResponse;

        if (KBResponse === undefined) {
            SuggestionInterface.showMessage('No fue posible generar una sugerencia');
            ConsoleController.log('No fue posible consultar la Base de Conocimientos', 'WARNING');

            return;
        }
        if (!KBResponse.canSuggest || KBResponse.suggestion === undefined) {
            SuggestionInterface.showMessage('No fue posible generar una sugerencia');   
            return;
        }

        await this.addProcess(600, 1200);
        this.setState({ activeSuggestion: { action: KBResponse.suggestion.action, state: state } }, false);
        this.sendMessage('SuggestionController', {
            action: 'suggestAction',
            payload: KBResponse.suggestion
        });
    }

    async suggestionRespond(message: Message) {
        const { suggestion, response } = message.content.payload as UserResponse;
        
        const suggestionDescription = suggestion.description;
        const activeSuggestion = this.state.activeSuggestion;
        if (activeSuggestion === null) return ConsoleController.log('No existe una sugerencia activa', 'WARNING');
        
        await this.addProcess(500, 700);
        this.setState({
            activeSuggestion: null,
            userFeedback: [...this.state.userFeedback, { suggestion: activeSuggestion, response }]
        }, false);

        ConsoleController.log(response === 'ACCEPTED' ? `Sugerencia aceptada: ${suggestionDescription}` : `Sugerencia rechazada: ${suggestionDescription}`);
    }

    getStatus(): ComponentStatus {
        return 'READY';
    }

    click() {
        this.logState();
        return true;
    }

    async logState() {
        if (this.isClicked) return;
        this.isClicked = true;

        let acceptedAmmount = 0;
        let rejectedAmmount = 0;
        let ignoredAmmount = 0;

        this.state.userFeedback.forEach(feedback => {
            switch (feedback.response) {
                case 'ACCEPTED':
                    acceptedAmmount++;
                    break;
                case 'REJECTED':
                    rejectedAmmount++;
                    break;
                case 'IGNORED':
                    ignoredAmmount++;
                    break;
            }
        });
        
        await this.addProcess(500, 700);
        ConsoleController.log(`Sugerencias:
            Aceptadas: ${acceptedAmmount}
            Rechazadas: ${rejectedAmmount}
            Ignoradas: ${ignoredAmmount}`
        , 'DEBUG');

        this.isClicked = false;
    }
}