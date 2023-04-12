import SimulationController from './SimulationController.js';

const LOG_LEVELS = {
    'DEBUG': 0,
    'INFO': 1,
    'WARNING': 2,
    'ERROR': 3
} as const;

interface ConsoleMessage {
    content: string;
    level: LogLevel
}

export type LogLevel = keyof typeof LOG_LEVELS;
export default class ConsoleController {
    private static instance?: ConsoleController = undefined;
    private messages: ConsoleMessage[];
    private container: HTMLElement;
    private parent: SimulationController;

    private messagesContainerWrapper: HTMLElement;
    private messagesContainer: HTMLElement;
    private levelSelect: HTMLSelectElement;

    private level: LogLevel = 'DEBUG';

    static get Instance() {
        return ConsoleController.instance;
    }

    static log(content: string, level: LogLevel = 'INFO') {
        this.instance?.log(content, level);
    }

    log(content: string, level: LogLevel) {
        this.messages.push({ content, level });
        
        this.renderMessages();
    }

    clearContainer() {
        this.messagesContainer.innerHTML = '';
    }

    clearMessages() {
        this.messages.length = 0;
    }

    renderMessage(message: ConsoleMessage) {
        const consoleMessage = document.createElement('div');
        consoleMessage.innerText = message.content;
        consoleMessage.classList.add('console-message', message.level.toLowerCase());

        this.messagesContainer.appendChild(consoleMessage);
    }

    renderEmptyMessage() {
        const consoleMessage = document.createElement('div');
        consoleMessage.innerText = this.messages.length === 0 ? 'Aún no hay mensajes en la consola' : `Aun no hay mensajes del nivel ${this.level} o superior`;
        consoleMessage.classList.add('no-messages');

        this.messagesContainer.appendChild(consoleMessage);
    }

    renderMessages() {
        this.clearContainer();
        let isEmpty = true;

        const selectedLevel = LOG_LEVELS[this.level];
        for (const message of this.messages) {
            if (LOG_LEVELS[message.level] >= selectedLevel) {
                this.renderMessage(message);
                isEmpty = false;
            }
        }

        if (isEmpty) { this.renderEmptyMessage(); }
        this.messagesContainerWrapper.scrollTo({
            top: this.messagesContainerWrapper.scrollHeight,
            behavior: 'smooth'
        });
    }

    setLevel(level: LogLevel) {
        this.level = level;
        this.renderMessages();
    }

    handleLevelChange() {
        const level = this.levelSelect.value as LogLevel;
        this.setLevel(level);
    }
    
    constructor(parent: SimulationController, container: HTMLElement) {
        if (ConsoleController.instance !== undefined) {
            throw new Error('No es posible instanciar una clase Singleton más de una vez.');
        }

        this.parent = parent;
        this.container = container;

        const messagesContainerWrapper = this.container.querySelector('div#messages-container-wrapper') as HTMLElement | null;
        if (messagesContainerWrapper === null) {
            throw new Error('Error durante la inicialización del componente \'ConsoleController\': no fue posible obtener el elemento \'div#messages-container-wrapper\'');
        }
        this.messagesContainerWrapper = messagesContainerWrapper;

        const messagesContainer = this.container.querySelector('div#messages-container') as HTMLElement | null;
        if (messagesContainer === null) {
            throw new Error('Error durante la inicialización del componente \'ConsoleController\': no fue posible obtener el elemento \'div#messages-container\'');
        }
        this.messagesContainer = messagesContainer;

        const levelSelect = this.container.querySelector('select#level-select') as HTMLSelectElement | null;
        if (levelSelect === null) {
            throw new Error('Error durante la inicialización del componente \'ConsoleController\': no fue posible obtener el elemento \'select#level-select\'');
        }

        levelSelect.addEventListener('input', () => this.handleLevelChange());
        this.levelSelect = levelSelect;

        this.messages = [];
        ConsoleController.instance = this;
        this.renderMessages();
    }
}