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
function isValidQueryMessageContent(content) {
    return content.payload.queryType !== undefined &&
        typeof content.payload.queryType === 'string';
}
export default class DBConnection extends BaseComponent {
    constructor() {
        super(...arguments);
        this.name = 'Conexión a BD';
    }
    initialize() {
        this.actions.set('query', this.query);
        this.UIActions.set('dbConnect', this.dbConnect);
        this.UIActions.set('dbDisconnect', this.dbDisconnect);
    }
    getInitialState() {
        return {
            dbConnected: false
        };
    }
    query(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.addProcess(300, 600);
            if (!this.state.dbConnected) {
                message.respond({ result: 'error' });
                return;
            }
            const { content } = message;
            if (!isValidQueryMessageContent(content)) {
                message.respond({ result: 'error' });
                return;
            }
            ConsoleController.log(`Ejecutando sentencia de tipo ${content.payload.queryType}`, 'DEBUG');
            yield this.addProcess(1000, 1500);
            message.respond({ result: 'success' });
        });
    }
    dbConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state.dbConnected)
                return;
            yield this.addProcess(1000, 2000);
            this.setState({ dbConnected: true });
            this.sendMessage('ActionRegistration', {
                action: 'register',
                payload: {
                    element: 'DBConnection',
                    action: 'dbConnect',
                    stateChange: { dbConnected: true },
                    description: 'Conexión establecida con la base de datos'
                },
            });
        });
    }
    dbDisconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.state.dbConnected)
                return;
            yield this.addProcess(500, 1000);
            this.setState({ dbConnected: false });
            this.sendMessage('ActionRegistration', {
                action: 'register',
                payload: {
                    element: 'DBConnection',
                    action: 'dbDisconnect',
                    stateChange: { dbConnected: false },
                    description: 'Conexión terminada con la base de datos'
                }
            });
        });
    }
    getStatus() {
        if (this.state.dbConnected)
            return 'READY';
        return 'INITIAL';
    }
}
