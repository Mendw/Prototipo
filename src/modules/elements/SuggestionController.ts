import { BaseComponent, ComponentStatus, Message } from '../common.js';
import SuggestionInterface, { SuggestionMessage } from '../controllers/SuggestionInterface.js';
import { UserResponse } from './IntelligentAgent.js';

interface SuggestionControllerState {
    lastSuggestion: SuggestionMessage | null;
}

export default class SuggestionController extends BaseComponent<SuggestionControllerState> {
    name = 'Gestion Sugerencias';
    
    initialize() {
        this.actions.set('suggestAction', this.suggestAction);

        this.UIActions.set('acceptSuggestion', this.acceptSuggestion);
        this.UIActions.set('rejectSuggestion', this.rejectSuggestion);
    }

    getInitialState(): SuggestionControllerState {
        return { lastSuggestion: null };
    }

    suggestAction(message: Message) {
        const suggestion = message.content.payload as SuggestionMessage;
        SuggestionInterface.suggestAction(suggestion);

        this.setState({ lastSuggestion: suggestion }, false);
    }

    async suggestionRespond(accepted: boolean) {
        if (this.state.lastSuggestion === null) return;
        await this.addProcess(300, 600);

        const payload: UserResponse = {
            response: accepted ? 'ACCEPTED' : 'REJECTED',
            suggestion: this.state.lastSuggestion
        };

        this.sendMessage('IntelligentAgent', { action: 'suggestionRespond', payload });
    }

    async acceptSuggestion() {
        this.suggestionRespond(true);
    }

    async rejectSuggestion() {
        this.suggestionRespond(false);
    }

    getStatus(): ComponentStatus {
        return 'READY';
    }
}