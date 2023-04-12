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
export default class OperationHistory extends BaseComponent {
    constructor() {
        super(...arguments);
        this.name = 'Historial de Operaciones';
    }
    initialize() {
        this.actions.set('push', this.push);
        this.UIActions.set('undo', this.pop);
    }
    getInitialState() {
        return {
            operations: []
        };
    }
    push(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { element } = message.content.payload;
            if (element === undefined) {
                console.error(`El componente ${this.name} recibió un mensaje con el contenido incorrecto`);
                return;
            }
            yield this.addProcess(500, 700);
            const operations = Array.from(this.state.operations);
            operations.push({ className: element });
            this.setState({ operations }, false);
        });
    }
    pop() {
        return __awaiter(this, void 0, void 0, function* () {
            const operations = this.state.operations;
            const operation = operations.pop();
            if (operation === undefined)
                return;
            yield this.addProcess(1000, 1500);
            this.sendMessage('ActionRegistration', {
                action: 'undo',
                payload: operation
            });
            this.setState({ operations }, false);
        });
    }
    getStatus() {
        return 'READY';
    }
}
