import { BaseComponent, ComponentStatus, Message } from '../common.js';

interface Operation {
    className: string;
}

interface OperationHistoryState {
    operations: Operation[]
}

type OperationMessagePayload = {
    element?: string;
}

export default class OperationHistory extends BaseComponent<OperationHistoryState> {
    name = 'Historial de Operaciones';

    initialize() {
        this.actions.set('push', this.push);
        this.UIActions.set('undo', this.pop);
    }

    getInitialState(): OperationHistoryState {
        return {
            operations: []
        };
    }

    async push(message: Message) {
        const { element } = message.content.payload as OperationMessagePayload;
        if (element === undefined) {
            console.error(`El componente ${this.name} recibió un mensaje con el contenido incorrecto`);
            return;
        }

        await this.addProcess(500, 700);
        const operations = Array.from(this.state.operations);
        operations.push({ className: element });

        this.setState({ operations }, false);
    }

    async pop() {
        const operations = this.state.operations;
        
        const operation = operations.pop();
        if (operation === undefined) return;
        
        await this.addProcess(1000, 1500);
        this.sendMessage('ActionRegistration', {
            action: 'undoAction',
            payload: operation
        });

        this.setState({ operations }, false);
    }

    getStatus(): ComponentStatus {
        return 'READY';
    }
}