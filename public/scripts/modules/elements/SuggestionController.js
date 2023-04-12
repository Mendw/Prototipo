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
import SuggestionInterface from '../controllers/SuggestionInterface.js';
export default class SuggestionController extends BaseComponent {
    constructor() {
        super(...arguments);
        this.name = 'Gestion Sugerencias';
    }
    initialize() {
        this.actions.set('suggestAction', this.suggestAction);
        this.UIActions.set('acceptSuggestion', this.acceptSuggestion);
        this.UIActions.set('rejectSuggestion', this.rejectSuggestion);
    }
    getInitialState() {
        return { lastSuggestion: null };
    }
    suggestAction(message) {
        const suggestion = message.content.payload;
        SuggestionInterface.suggestAction(suggestion);
        this.setState({ lastSuggestion: suggestion }, false);
    }
    suggestionRespond(accepted) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state.lastSuggestion === null)
                return;
            yield this.addProcess(300, 600);
            const payload = {
                response: accepted ? 'ACCEPTED' : 'REJECTED',
                suggestion: this.state.lastSuggestion
            };
            this.sendMessage('IntelligentAgent', { action: 'suggestionRespond', payload });
        });
    }
    acceptSuggestion() {
        return __awaiter(this, void 0, void 0, function* () {
            this.suggestionRespond(true);
        });
    }
    rejectSuggestion() {
        return __awaiter(this, void 0, void 0, function* () {
            this.suggestionRespond(false);
        });
    }
    getStatus() {
        return 'READY';
    }
}
