class SuggestionInterface {
    static get Instance() {
        return SuggestionInterface.instance;
    }
    static suggestAction(suggestion) {
        var _a;
        return (_a = this.instance) === null || _a === void 0 ? void 0 : _a.suggestAction(suggestion);
    }
    static showMessage(message) {
        var _a;
        return (_a = this.instance) === null || _a === void 0 ? void 0 : _a.showMessage(message);
    }
    constructor(parent, container) {
        if (SuggestionInterface.instance !== undefined) {
            throw new Error('No es posible instanciar una clase Singleton más de una vez.');
        }
        this.parent = parent;
        this.container = container;
        this.lastSuggestionAction = null;
        const suggestionDescription = document.createElement('p');
        suggestionDescription.classList.add('suggestion-description');
        const suggestionActionsContainer = document.createElement('div');
        suggestionActionsContainer.classList.add('suggestion-actions');
        const acceptButton = document.createElement('button');
        acceptButton.innerText = 'Aceptar';
        acceptButton.classList.add('suggestion-button');
        acceptButton.addEventListener('click', () => this.suggestionRespond(true));
        const rejectButton = document.createElement('button');
        rejectButton.innerText = 'Rechazar';
        rejectButton.classList.add('suggestion-button');
        rejectButton.addEventListener('click', () => this.suggestionRespond(false));
        suggestionActionsContainer.appendChild(acceptButton);
        suggestionActionsContainer.appendChild(rejectButton);
        this.suggestionDescription = suggestionDescription;
        this.suggestionActionsContainer = suggestionActionsContainer;
        this.showMessage('No se han generado sugerencias');
        SuggestionInterface.instance = this;
    }
    suggestionRespond(accepted) {
        const uiTriggerAction = accepted ? 'acceptSuggestion' : 'rejectSuggestion';
        this.parent.UITrigger(uiTriggerAction);
        if (accepted && this.lastSuggestionAction !== null) {
            this.parent.triggerMenuAction(this.lastSuggestionAction);
            this.lastSuggestionAction = null;
        }
        this.showMessage('No hay sugerencias activas');
    }
    showMessage(message) {
        this.container.innerHTML = '';
        this.suggestionDescription.innerText = message;
        this.suggestionDescription.classList.add('message-only');
        this.container.appendChild(this.suggestionDescription);
    }
    suggestAction(suggestion) {
        this.lastSuggestionAction = suggestion.action;
        this.container.innerHTML = '';
        this.suggestionDescription.innerText = suggestion.description;
        this.suggestionDescription.classList.remove('message-only');
        this.container.appendChild(this.suggestionDescription);
        this.container.appendChild(this.suggestionActionsContainer);
    }
}
SuggestionInterface.instance = undefined;
export default SuggestionInterface;
