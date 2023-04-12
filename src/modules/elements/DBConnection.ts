import { Message, ComponentStatus, MessageContent, BaseComponent } from '../common.js';
import ConsoleController from '../controllers/ConsoleController.js';

interface DBConnectionState {
    dbConnected: boolean;
}

interface QueryMessageContent extends MessageContent {
    action: string;
    payload: { queryType: string };
}

function isValidQueryMessageContent(content: MessageContent): content is QueryMessageContent {
    return (content as QueryMessageContent).payload.queryType !== undefined &&
        typeof (content as QueryMessageContent).payload.queryType === 'string';
}

export default class DBConnection extends BaseComponent<DBConnectionState> {
    name = 'Conexión a BD';

    initialize() {
        this.actions.set('query', this.query);

        this.UIActions.set('dbConnect', this.dbConnect);
        this.UIActions.set('dbDisconnect', this.dbDisconnect);
    }

    getInitialState(): DBConnectionState {
        return {
            dbConnected: false
        };
    }

    async query(message: Message) {
        await this.addProcess(300, 600);
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
        await this.addProcess(1000, 1500);
        message.respond({ result: 'success' });
    }

    async dbConnect() {
        if (this.state.dbConnected) return;

        await this.addProcess(1000, 2000);
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
    }

    async dbDisconnect() {
        if (!this.state.dbConnected) return;

        await this.addProcess(500, 1000);
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
    }

    getStatus(): ComponentStatus {
        if (this.state.dbConnected) return 'READY';
        return 'INITIAL';
    }
}

