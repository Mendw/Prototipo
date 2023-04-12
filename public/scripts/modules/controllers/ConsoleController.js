const LOG_LEVELS = {
    'DEBUG': 0,
    'INFO': 1,
    'WARNING': 2,
    'ERROR': 3
};
class ConsoleController {
    static get Instance() {
        return ConsoleController.instance;
    }
    static log(content, level = 'INFO') {
        var _a;
        (_a = this.instance) === null || _a === void 0 ? void 0 : _a.log(content, level);
    }
    log(content, level) {
        this.messages.push({ content, level });
        this.renderMessages();
    }
    clearContainer() {
        this.messagesContainer.innerHTML = '';
    }
    clearMessages() {
        this.messages.length = 0;
    }
    renderMessage(message) {
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
        if (isEmpty) {
            this.renderEmptyMessage();
        }
        this.messagesContainerWrapper.scrollTo({
            top: this.messagesContainerWrapper.scrollHeight,
            behavior: 'smooth'
        });
    }
    setLevel(level) {
        this.level = level;
        this.renderMessages();
    }
    handleLevelChange() {
        const level = this.levelSelect.value;
        this.setLevel(level);
    }
    constructor(parent, container) {
        this.level = 'DEBUG';
        if (ConsoleController.instance !== undefined) {
            throw new Error('No es posible instanciar una clase Singleton más de una vez.');
        }
        this.parent = parent;
        this.container = container;
        const messagesContainerWrapper = this.container.querySelector('div#messages-container-wrapper');
        if (messagesContainerWrapper === null) {
            throw new Error('Error durante la inicialización del componente \'ConsoleController\': no fue posible obtener el elemento \'div#messages-container-wrapper\'');
        }
        this.messagesContainerWrapper = messagesContainerWrapper;
        const messagesContainer = this.container.querySelector('div#messages-container');
        if (messagesContainer === null) {
            throw new Error('Error durante la inicialización del componente \'ConsoleController\': no fue posible obtener el elemento \'div#messages-container\'');
        }
        this.messagesContainer = messagesContainer;
        const levelSelect = this.container.querySelector('select#level-select');
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
ConsoleController.instance = undefined;
export default ConsoleController;
