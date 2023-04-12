var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ConsoleController from './controllers/ConsoleController.js';
const COMPONENT_STATUS = {
    'INITIAL': '#999999',
    'CONFIGURING': '#FFA726',
    'READY': '#66BB6A',
    'ERRORED': '#F44336'
};
export const assets = new Map();
export class ImageWrapper {
    constructor(path, onload) {
        this.element = new Image();
        this.loaded = false;
        this.element.addEventListener('load', () => {
            this.loaded = true;
            onload === null || onload === void 0 ? void 0 : onload();
        });
        this.element.src = path;
    }
}
export class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static get zero() {
        return new Vector(0, 0);
    }
    static from(obj) {
        return new Vector(obj.x, obj.y);
    }
    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }
    scale(factor) {
        return new Vector(this.x * factor, this.y * factor);
    }
    substract(other) {
        return this.add(other.scale(-1));
    }
    get Size2() {
        return this.x * this.x + this.y * this.y;
    }
    get Size() {
        return Math.sqrt(this.Size2);
    }
    get Normalized() {
        return this.scale(1 / this.Size);
    }
}
export class Rectangle {
    constructor(x, y, w, h) {
        this.position = new Vector(x, y);
        this.size = new Vector(w, h);
        this.center = new Vector(x + w / 2, y + h / 2);
    }
    contains(point, offset, scale) {
        const absolutePoint = point.substract(offset).scale(1 / scale);
        return (absolutePoint.x >= this.position.x &&
            absolutePoint.x <= this.position.x + this.size.x &&
            absolutePoint.y >= this.position.y &&
            absolutePoint.y <= this.position.y + this.size.y);
    }
    get Bottom() {
        return this.position.y + this.size.y;
    }
    get Right() {
        return this.position.x + this.size.x;
    }
}
export class MessageBase {
    constructor(content, connector, callback = () => null) {
        this.content = content;
        this.connector = connector;
        this.duration = connector.getMessageDuration();
        this.callback = callback;
        this.progress = 0;
    }
    get Done() {
        return this.progress >= 1;
    }
    advance(deltaT) {
        const change = deltaT / this.duration;
        this.progress += change;
    }
}
export class Message extends MessageBase {
    respond(response) {
        const messageResponse = new MessageResponse(response, this.connector, this.callback);
        this.connector.addResponse(messageResponse);
    }
    get Position() {
        const { start, end, progress } = this.connector.messagePosition(this.progress);
        return start.add(end.substract(start).scale(progress));
    }
}
export class MessageResponse extends MessageBase {
    constructor(payload, connector, callback) {
        super({ action: 'response', payload }, connector, callback);
    }
    deliver() {
        if (this.content.payload === undefined)
            return;
        this.callback(this.content.payload);
    }
    get Position() {
        const { start, end, progress } = this.connector.responsePosition(this.progress);
        return start.add(end.substract(start).scale(progress));
    }
}
export class ConnectionPoint {
    constructor(element, start, end, tag) {
        this.element = element;
        this.start = start;
        this.end = end;
        this.tag = tag;
    }
}
class BaseElement {
    constructor(x, y, w, h, connectionPoints) {
        this.boundingBox = new Rectangle(x, y, w, h);
        this.connectionPoints = new Map();
        for (const { id, tag, start, end } of connectionPoints) {
            const startVector = Vector.from(start).add(this.boundingBox.position);
            const endVector = end ? Vector.from(end).add(this.boundingBox.position) : undefined;
            this.connectionPoints.set(id, new ConnectionPoint(this, startVector, endVector, tag));
        }
        this.connectors = new Map();
    }
    getConnectionPoint(connectionPointName) {
        return this.connectionPoints.get(connectionPointName);
    }
    sendMessage(target, content) {
        const connector = this.connectors.get(target);
        if (connector === undefined) {
            throw new Error(`Connector to '${target}' not found`);
        }
        return new Promise(resolve => {
            const message = new Message(content, connector, resolve);
            connector.addMessage(message);
        });
    }
    drawName(context, position) {
        context.save();
        context.font = '0.85rem sans-serif';
        context.textAlign = 'center';
        context.fillText(this.name, position.x, position.y);
        context.restore();
    }
    drawConnectionPoints(context) {
        context.save();
        const connectionPointCircles = new Path2D();
        const connectionPointLines = new Path2D();
        const { x: paddingX, y: paddingY } = BaseElement.tagPadding;
        for (const connectionPoint of this.connectionPoints.values()) {
            if (connectionPoint.end) {
                connectionPointLines.moveTo(connectionPoint.start.x, connectionPoint.start.y);
                connectionPointLines.lineTo(connectionPoint.end.x, connectionPoint.end.y);
                if (connectionPoint.tag) {
                    connectionPointCircles.moveTo(connectionPoint.end.x + BaseElement.connectionPointRadius, connectionPoint.end.y);
                    connectionPointCircles.arc(connectionPoint.end.x, connectionPoint.end.y, BaseElement.connectionPointRadius, 0, Math.PI * 2);
                    const tagDimensions = context.measureText(connectionPoint.tag);
                    const directionVector = connectionPoint.end.substract(connectionPoint.start).Normalized;
                    const tagPosition = connectionPoint.end.add(directionVector.scale(BaseElement.connectionPointRadius + tagDimensions.width * 2 / 3));
                    context.textAlign = 'center';
                    const height = tagDimensions.actualBoundingBoxAscent + tagDimensions.actualBoundingBoxDescent;
                    context.fillStyle = '#EFEFEF';
                    context.fillRect(tagPosition.x - tagDimensions.width / 2 - paddingX / 2, tagPosition.y - tagDimensions.actualBoundingBoxAscent - paddingY / 2, tagDimensions.width + paddingX, height + paddingY);
                    context.fillStyle = '#000000';
                    context.fillText(connectionPoint.tag, tagPosition.x, tagPosition.y);
                }
            }
        }
        context.fillStyle = '#FFFFFF';
        context.stroke(connectionPointLines);
        context.fill(connectionPointCircles);
        context.stroke(connectionPointCircles);
        context.restore();
    }
}
BaseElement.connectionPointRadius = 8;
BaseElement.tagPadding = new Vector(10, 8);
export { BaseElement };
export class Process {
    constructor(duration, resolve) {
        this.duration = duration;
        this.progress = 0;
        this.resolve = resolve;
    }
    advance(deltaT) {
        this.progress += deltaT / this.duration;
    }
    complete() {
        this.resolve();
    }
    get Done() {
        return this.progress > 1;
    }
}
class BaseComponent extends BaseElement {
    constructor(x, y, w, h, connectionPoints, parallelism = null) {
        super(x, y, w, h, connectionPoints);
        this.actions = new Map();
        this.UIActions = new Map();
        this.initialize();
        this.actions.set('undo', this.undo);
        this.state = this.getInitialState();
        this.status = this.getStatus();
        this.processes = [];
        this.parallelism = parallelism;
        this.gearRotation = 0;
        this.prevStates = [];
    }
    contains(point, offset, scale) {
        return this.boundingBox.contains(point, offset, scale);
    }
    trigger(message) {
        const action = this.actions.get(message.content.action);
        if (action === undefined) {
            console.error(`${message.content.action} no es una acción válida para ${this.name}`);
            return;
        }
        action.call(this, message);
    }
    UITrigger(action) {
        const uiAction = this.UIActions.get(action);
        if (uiAction === undefined) {
            console.error(`${action} no es una acción de interfaz válida para ${this.name}`);
            return;
        }
        uiAction.call(this);
    }
    fillBoundingBox(context, size) {
        context.save();
        context.fillStyle = '#FFFFFF';
        context.fillRect(this.boundingBox.position.x, this.boundingBox.position.y, size.x, size.y);
        context.restore();
    }
    drawStatus(context) {
        context.save();
        const right = this.boundingBox.Right - BaseComponent.statusWidth;
        const top = this.boundingBox.position.y;
        const height = this.boundingBox.size.y;
        context.fillStyle = COMPONENT_STATUS[this.status];
        context.fillRect(right, top, BaseComponent.statusWidth, height);
        context.beginPath();
        context.moveTo(right, top);
        context.lineTo(right, top + height);
        context.stroke();
        context.restore();
    }
    strokeBoundingBox(context, size) {
        context.save();
        context.strokeStyle = '#000000';
        context.strokeRect(this.boundingBox.position.x, this.boundingBox.position.y, size.x, size.y);
        context.restore();
    }
    advanceProcesses(deltaT) {
        let processesNeedRedraw = false;
        const processing = Math.min(this.processes.length, this.parallelism || Infinity);
        for (let index = 0; index < processing; index++) {
            const process = this.processes[index];
            process.advance(deltaT);
            if (process.Done) {
                process.complete();
                processesNeedRedraw = true;
            }
        }
        this.processes = this.processes.filter(process => !process.Done);
        return processesNeedRedraw;
    }
    drawProcessAmmount(context, position) {
        context.save();
        context.font = '.75rem sans-serif';
        context.textBaseline = 'middle';
        context.textAlign = 'left';
        context.fillText(`${this.processes.length}`, position.x, position.y);
        context.restore();
    }
    drawGear(context, position, icon) {
        context.save();
        context.translate(position.x, position.y);
        context.rotate(this.gearRotation * Math.PI * 2 / BaseComponent.rotationDuration);
        context.drawImage(icon.element, -icon.element.width / 2, -icon.element.height / 2);
        context.restore();
    }
    draw(context, deltaT) {
        let isAnimating = false;
        const { size } = this.boundingBox;
        const center = this.boundingBox.position.add(size.scale(1 / 2));
        this.fillBoundingBox(context, size);
        this.drawStatus(context);
        this.strokeBoundingBox(context, size);
        this.drawName(context, center.add(new Vector(0, 21 - size.y / 2)));
        this.drawConnectionPoints(context);
        const processesNeedRedraw = this.advanceProcesses(deltaT);
        isAnimating || (isAnimating = processesNeedRedraw);
        const progressIcon = assets.get('gear');
        if (progressIcon === undefined || !progressIcon.loaded) {
            return isAnimating;
        }
        const gearPosition = center.add(new Vector(-progressIcon.element.width / 2, 9));
        if (this.processes.length > 0) {
            isAnimating = true;
            this.gearRotation += deltaT;
            this.drawProcessAmmount(context, gearPosition.add(new Vector(progressIcon.element.width - 7, 0)));
        }
        this.drawGear(context, gearPosition, progressIcon);
        return isAnimating;
    }
    addProcess(min, max) {
        const duration = max ? this.randomDuration(min, max) : min;
        return new Promise(resolve => {
            const process = new Process(duration, resolve);
            this.processes.push(process);
        });
    }
    setState(state, save = true) {
        if (save) {
            this.prevStates.push(Object.assign({}, this.state));
            if (this.prevStates.length >= BaseComponent.historyLength) {
                this.prevStates.splice(0, 1);
            }
        }
        this.state = Object.assign(this.state, state);
        this.status = this.getStatus();
    }
    undo(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.addProcess(300, 500);
            if (this.prevStates.length === 0) {
                console.log('No hay más estados anteriores');
                const state = this.getInitialState();
                this.setState(state, false);
            }
            else {
                const state = this.prevStates.pop();
                this.setState(state || this.getInitialState(), false);
            }
            message.respond({ newComponentState: this.state });
        });
    }
    randomDuration(min, max) {
        return min + Math.random() * (max - min);
    }
    randomPick(values) {
        return values[Math.floor(Math.random() * values.length)];
    }
    click() { return false; }
}
BaseComponent.rotationDuration = 2000;
BaseComponent.statusWidth = 10;
BaseComponent.historyLength = 100;
export { BaseComponent };
export class BaseComponentError {
    constructor(reason, description) {
        this.reason = reason;
        this.description = description;
    }
}
export class PrerequisitesError extends BaseComponentError {
    constructor() {
        super('prerequisites', 'No se cumplen los requisitos para realizar esta accion');
    }
}
export class DBError extends BaseComponentError {
    constructor(description) {
        super('DBConnection', description);
    }
}
export class BaseKDDComponent extends BaseComponent {
    constructor(x, y, w, h, connectionPoints, parallelism = null) {
        super(x, y, w, h, connectionPoints, parallelism);
        this.prerequisites = this.getPrerequisites();
    }
    checkPrerequisitesMet(min, max) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.addProcess(min, max);
            const response = yield this.checkPrerequisites();
            return response !== undefined && response.allTrue;
        });
    }
    checkPrerequisites(prerequisites) {
        return __awaiter(this, void 0, void 0, function* () {
            const { response } = yield this.sendMessage('ActionRegistration', {
                action: 'checkPrerequisites',
                payload: prerequisites || this.prerequisites
            });
            return response;
        });
    }
    _queryDB(queryType, min, max) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.addProcess(min, max);
            return yield this.sendMessage('DBConnection', {
                action: 'query',
                payload: { queryType }
            });
        });
    }
    queryDB(queryType, min, max) {
        return __awaiter(this, void 0, void 0, function* () {
            const { result } = yield this._queryDB(queryType, min, max);
            return result === 'success';
        });
    }
    registerAction(description, action, stateChange) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sendMessage('ActionRegistration', {
                action: 'register',
                payload: { element: this.className, description, stateChange, action },
            });
        });
    }
    isBaseComponentState(state) {
        const { error } = state;
        if (error === undefined)
            return false;
        const { reason, description } = error;
        return !(reason === undefined || description === undefined);
    }
    resetError() {
        const state = this.state;
        if (this.isBaseComponentState(state)) {
            if (state.error === undefined)
                return false;
            ConsoleController.log(`${this.name}: ${state.error.description}`, 'ERROR');
            state.error = undefined;
            return true;
        }
        return false;
    }
    click() {
        this.logState();
        return true;
    }
    logState() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.addProcess(300, 400);
            ConsoleController.log(this.describeState(), 'DEBUG');
        });
    }
}
class Connector {
    constructor(origin, target, drawLine) {
        var _a, _b;
        this.origin = origin;
        this.target = target;
        this.messages = [];
        this.responses = [];
        this.drawLine = drawLine !== null && drawLine !== void 0 ? drawLine : true;
        this.mainSegmentStart = this.origin.end || this.origin.start;
        this.mainSegmentEnd = this.target.end || this.target.start;
        const mainSegmentSize = this.mainSegmentEnd.substract(this.mainSegmentStart).Size;
        const firstSegmentSize = (_a = this.origin.end) === null || _a === void 0 ? void 0 : _a.substract(this.origin.start).Size;
        const secondSegmentSize = (_b = this.target.end) === null || _b === void 0 ? void 0 : _b.substract(this.target.start).Size;
        this.thresholds = [];
        this.totalLength = mainSegmentSize + (firstSegmentSize !== null && firstSegmentSize !== void 0 ? firstSegmentSize : 0) + (secondSegmentSize !== null && secondSegmentSize !== void 0 ? secondSegmentSize : 0);
        if (firstSegmentSize === undefined && secondSegmentSize === undefined) {
            return;
        }
        if (firstSegmentSize !== undefined && secondSegmentSize !== undefined) {
            const totalLength = mainSegmentSize + firstSegmentSize + secondSegmentSize;
            this.thresholds.push(firstSegmentSize / totalLength, (totalLength - secondSegmentSize) / totalLength);
            return;
        }
        if (firstSegmentSize !== undefined) {
            const totalLength = mainSegmentSize + firstSegmentSize;
            this.thresholds.push(firstSegmentSize / totalLength);
            return;
        }
        if (secondSegmentSize !== undefined) {
            const totalLength = mainSegmentSize + secondSegmentSize;
            this.thresholds.push(mainSegmentSize / totalLength);
        }
    }
    draw(ctx, deltaT) {
        if (this.drawLine) {
            ctx.beginPath();
            ctx.moveTo(this.mainSegmentStart.x, this.mainSegmentStart.y);
            ctx.lineTo(this.mainSegmentEnd.x, this.mainSegmentEnd.y);
            ctx.stroke();
        }
        for (const message of this.messages) {
            message.advance(deltaT);
            if (message.Done) {
                this.target.element.trigger(message);
                continue;
            }
            const position = message.Position;
            ctx.beginPath();
            ctx.ellipse(position.x, position.y, 5, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        let responseInitiated = false;
        for (const response of this.responses) {
            response.advance(deltaT);
            if (response.Done) {
                response.deliver();
                responseInitiated = true;
                continue;
            }
            const position = response.Position;
            ctx.beginPath();
            ctx.ellipse(position.x, position.y, 5, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        this.messages = this.messages.filter(message => !message.Done);
        this.responses = this.responses.filter(response => !response.Done);
        return responseInitiated || (this.messages.length + this.responses.length > 0);
    }
    get Type() {
        if (this.origin.end === undefined && this.target.end === undefined) {
            return 'NN';
        }
        if (this.origin.end === undefined && this.target.end !== undefined) {
            return 'NC';
        }
        if (this.origin.end !== undefined && this.target.end === undefined) {
            return 'CN';
        }
        return 'CC';
    }
    messagePosition(progress) {
        const type = this.Type;
        if (type == 'NN') {
            return { start: this.mainSegmentStart, end: this.mainSegmentEnd, progress };
        }
        if (type == 'NC') {
            const threshold = this.thresholds[0];
            if (progress < threshold) {
                return { start: this.mainSegmentStart, end: this.mainSegmentEnd, progress: progress / threshold };
            }
            return { start: this.mainSegmentEnd, end: this.target.start, progress: (progress - threshold) / (1 - threshold) };
        }
        if (type == 'CN') {
            const threshold = this.thresholds[0];
            if (progress < threshold) {
                return { start: this.origin.start, end: this.mainSegmentStart, progress: progress / threshold };
            }
            return { start: this.mainSegmentStart, end: this.mainSegmentEnd, progress: (progress - threshold) / (1 - threshold) };
        }
        if (type == 'CC') {
            const firstThreshold = this.thresholds[0];
            const secondThreshold = this.thresholds[1];
            if (progress < firstThreshold) {
                return { start: this.origin.start, end: this.mainSegmentStart, progress: progress / firstThreshold };
            }
            if (progress < secondThreshold) {
                return { start: this.mainSegmentStart, end: this.mainSegmentEnd, progress: (progress - firstThreshold) / (secondThreshold - firstThreshold) };
            }
            return { start: this.mainSegmentEnd, end: this.target.start, progress: (progress - secondThreshold) / (1 - secondThreshold) };
        }
        throw new Error('Uno de los conectores era de tipo indefinido');
    }
    responsePosition(progress) {
        const type = this.Type;
        if (type == 'NN') {
            return { start: this.mainSegmentEnd, end: this.mainSegmentStart, progress };
        }
        if (type == 'NC') {
            const threshold = 1 - this.thresholds[0];
            if (progress < threshold) {
                return { start: this.target.start, end: this.mainSegmentEnd, progress: progress / threshold };
            }
            return { start: this.mainSegmentEnd, end: this.mainSegmentStart, progress: (progress - threshold) / (1 - threshold) };
        }
        if (type == 'CN') {
            const threshold = 1 - this.thresholds[0];
            if (progress < threshold) {
                return { start: this.mainSegmentEnd, end: this.mainSegmentStart, progress: progress / threshold };
            }
            return { start: this.mainSegmentStart, end: this.origin.start, progress: (progress - threshold) / (1 - threshold) };
        }
        if (type == 'CC') {
            const firstThreshold = 1 - this.thresholds[1];
            const secondThreshold = 1 - this.thresholds[0];
            if (progress < firstThreshold) {
                return { start: this.target.start, end: this.mainSegmentEnd, progress: progress / firstThreshold };
            }
            if (progress < secondThreshold) {
                return { start: this.mainSegmentEnd, end: this.mainSegmentStart, progress: (progress - firstThreshold) / (secondThreshold - firstThreshold) };
            }
            return { start: this.mainSegmentStart, end: this.origin.start, progress: (progress - secondThreshold) / (1 - secondThreshold) };
        }
        throw new Error('Uno de los conectores era de tipo indefinido');
    }
    getMessageDuration() {
        return Math.sqrt(this.totalLength * 100) / Connector.messageSpeed;
    }
    addMessage(message) {
        this.messages.push(message);
    }
    addResponse(response) {
        this.responses.push(response);
    }
}
Connector.messageSpeed = 0.5;
export { Connector };
