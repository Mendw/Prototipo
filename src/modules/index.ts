import { BaseElement, ConnectionPointDescription } from './common.js';
import ActionRegistration from './elements/ActionRegistration.js';
import ResultVisualize from './elements/ResultVisualize.js';
import ResultPublish from './elements/ResultPublish.js';
import DataMining from './elements/DataMining.js';
import DataPreprocess from './elements/DataPreprocess.js';
import DataSelection from './elements/DataSelection.js';
import DataTransform from './elements/DataTransform.js';
import DBConnection from './elements/DBConnection.js';
import IntelligentAgent from './elements/IntelligentAgent.js';
import KnowledgeBase from './elements/KnowledgeBase.js';
import OperationHistory from './elements/OperationHistory.js';
import SuggestionController from './elements/SuggestionController.js';

const ElementMap: Map<string, new (x: number, y: number, w: number, h: number, connectionPoints: ConnectionPointDescription[]) => BaseElement> = new Map();

ElementMap.set('ActionRegistration', ActionRegistration);
ElementMap.set('ResultVisualize', ResultVisualize);
ElementMap.set('ResultPublish', ResultPublish);
ElementMap.set('DataMining', DataMining);
ElementMap.set('DataSelection', DataSelection);
ElementMap.set('DataPreprocess', DataPreprocess);
ElementMap.set('DataTransform', DataTransform);
ElementMap.set('DBConnection', DBConnection);
ElementMap.set('IntelligentAgent', IntelligentAgent);
ElementMap.set('KnowledgeBase', KnowledgeBase);
ElementMap.set('OperationHistory', OperationHistory);
ElementMap.set('SuggestionController', SuggestionController);

export default ElementMap;

