import { SuggestionAction } from '../elements/KnowledgeBase.js';
import SimulationController from './SimulationController.js';

export interface SuggestionMessage {
    action: SuggestionAction;
    description: string;
}


export default class SuggestionInterface {
    private parent: SimulationController;
    private container: HTMLElement;
    private suggestionDescription: HTMLElement;
    private suggestionActionsContainer: HTMLElement;

    private lastSuggestionAction: string | null;

    private static instance?: SuggestionInterface = undefined;
    static get Instance() {
        return SuggestionInterface.instance;
    }
    
    static suggestAction(suggestion: SuggestionMessage) {
        return this.instance?.suggestAction(suggestion);
    }
    
    static showMessage(message: string) {
        return this.instance?.showMessage(message);
    }
    
    constructor(parent: SimulationController, container: HTMLElement) {
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

    suggestionRespond(accepted: boolean) {
        const uiTriggerAction = accepted ? 'acceptSuggestion' : 'rejectSuggestion';
        this.parent.UITrigger(uiTriggerAction);
        if (accepted && this.lastSuggestionAction !== null) {
            this.parent.triggerMenuAction(this.lastSuggestionAction);
            this.lastSuggestionAction = null;
        }

        this.showMessage('No hay sugerencias activas');
    }

    showMessage(message: string) {
        this.container.innerHTML = '';
        this.suggestionDescription.innerText = message;
        this.suggestionDescription.classList.add('message-only');
        this.container.appendChild(this.suggestionDescription);
    }


    suggestAction(suggestion: SuggestionMessage) {
        this.lastSuggestionAction = suggestion.action;
        this.container.innerHTML = '';
        this.suggestionDescription.innerText = suggestion.description;
        this.suggestionDescription.classList.remove('message-only');
        
        this.container.appendChild(this.suggestionDescription);
        this.container.appendChild(this.suggestionActionsContainer);
    }
}