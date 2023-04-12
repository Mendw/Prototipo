import { SimulationConfig } from './common.js';

const CONFIG: SimulationConfig = {
    elements: [
        {
            className: 'DBConnection',
            boundingBox: [1350, 80, 180, 80],
            connectionPoints: [
                { id: 'W', tag: 'PSQLf', start: { x:  0, y: 40 }, end: { x: -50, y: 40 } },
                { id: 'S', start: { x: 80, y: 80 } }
            ]
        },
        {
            className: 'DataSelection',
            boundingBox: [30, 150, 180, 80],
            connectionPoints: [
                { id: 'N', start: { x:  90, y:  0  }, end: { x: 90, y: -30 } },
                { id: 'S', start: { x:  90, y: 80  }, end: { x: 90, y: 110 } }
            ]
        }, {
            className: 'DataPreprocess',
            boundingBox: [240, 150, 180, 80],
            connectionPoints: [
                { id: 'N', start: { x:  90, y:  0  }, end: { x: 90, y: -30 } },
                { id: 'S', start: { x:  90, y: 80  }, end: { x: 90, y: 110 } }
            ]
        },
        {
            className: 'DataTransform',
            boundingBox: [450, 150, 180, 80],
            connectionPoints: [
                { id: 'N', start: { x:  90, y:  0  }, end: { x: 90, y: -30 } },
                { id: 'S', start: { x:  90, y: 80  }, end: { x: 90, y: 110 } }
            ]
        },
        {
            className: 'DataMining',
            boundingBox: [660, 150, 180, 80],
            connectionPoints: [
                { id: 'N', start: { x:  90, y:  0  }, end: { x: 90, y: -30 } },
                { id: 'S', start: { x:  90, y: 80  }, end: { x: 90, y: 110 } }
            ]
        },
        {
            className: 'ResultVisualize',
            boundingBox: [870, 150, 180, 80],
            connectionPoints: [
                { id: 'N', start: { x:  90, y:  0  }, end: { x: 90, y: -30 } },
                { id: 'S', start: { x:  90, y: 80  }, end: { x: 90, y: 110 } }
            ]
        },
        {
            className: 'ResultPublish',
            boundingBox: [1080, 150, 180, 80],
            connectionPoints: [
                { id: 'N', start: { x:  90, y:  0  }, end: { x: 90, y: -30 } },
                { id: 'S', start: { x:  90, y: 80  }, end: { x: 90, y: 110 } }
            ]
        },
        {
            className: 'IntelligentAgent',
            boundingBox: [890, 310, 180, 80],
            connectionPoints: [
                { id: 'SE', start: {x: 150, y:  80 } },
                { id: 'NE',  start: {x: 180, y:  0 } },
                { id: 'EN', tag: 'AI', start: {x: 180, y: 20 }, end: { x: 240, y: 20 } },
                { id: 'ES', start: { x: 180, y: 60 }, end: { x: 240, y: 60 } }
            ]
        },
        {
            className: 'ActionRegistration',
            boundingBox: [1340, 290, 180, 80],
            connectionPoints: [
                { id: 'N' , tag: 'RAU', start: {x:  90, y: 0   }, end: { x: 90, y: -30 } },
                { id: 'S' , tag: 'RAU', start: {x:  90, y: 80 }, end: { x: 90, y: 120 } },
                { id: 'NE', start: {x:  150, y: 0   }, end: { x: 150, y: -30 }},
                { id: 'W' , start: {x:   0, y: 40  } }
            ]
        },
        {
            className: 'SuggestionController',
            boundingBox: [1200, 400, 180, 80],
            connectionPoints: [
                { id: 'N' , start: {x:  90, y:  0 }, end: { x: 90, y: -70 } },
                { id: 'ES' , start: {x: 180, y: 60}, end: { x: 230, y: 60 }},
                { id: 'W', tag: 'GS', start: {x: 0, y: 40 }, end: { x: -40, y: 40 } },
            ]
        },
        {
            className: 'KnowledgeBase',
            boundingBox: [1200, 510, 180, 80],
            connectionPoints: [
                { id: 'W', tag: 'BC', start: {x: 0, y: 40 }, end: { x: -40, y: 40 } },
                { id: 'E', start: {x: 180, y: 40}, end: { x: 230, y: 40 }}
            ]
        },
        {
            className: 'OperationHistory',
            boundingBox: [1560, 290, 180, 80],
            connectionPoints: [
                { id: 'N', tag: 'HO', start: { x: 90, y:  0 }, end: { x:  90, y: -30 } },
                { id: 'S', start: {x:  90, y: 80 }, end: { x: 90, y: 120 } },
            ]
        },
    ],
    connectors: [
        { origin: ['DataSelection', 'N'], target: ['DBConnection', 'W'] },
        { origin: ['DataPreprocess', 'N'], target: ['DBConnection', 'W'] },
        { origin: ['DataTransform', 'N'], target: ['DBConnection', 'W'] },
        { origin: ['DataMining', 'N'], target: ['DBConnection', 'W'] },
        { origin: ['ResultVisualize', 'N'], target: ['DBConnection', 'W'] },
        { origin: ['ResultPublish', 'N'], target: ['DBConnection', 'W'] },

        { origin: ['DBConnection', 'S'], target: ['ActionRegistration', 'N'] },
        { origin: ['DataSelection', 'S'], target: ['ActionRegistration', 'N'] },
        { origin: ['DataPreprocess', 'S'], target: ['ActionRegistration', 'N'] },
        { origin: ['DataTransform', 'S'], target: ['ActionRegistration', 'N'] },
        { origin: ['DataMining', 'S'], target: ['ActionRegistration', 'N'] },
        { origin: ['ResultVisualize', 'S'], target: ['ActionRegistration', 'N'] },
        { origin: ['ResultPublish', 'S'], target: ['ActionRegistration', 'N'] },

        { origin: ['ActionRegistration', 'N'], target: ['DBConnection', 'S'], draw: false },
        { origin: ['ActionRegistration', 'N'], target: ['DataSelection', 'S'], draw: false },
        { origin: ['ActionRegistration', 'N'], target: ['DataPreprocess', 'S'], draw: false },
        { origin: ['ActionRegistration', 'N'], target: ['DataTransform', 'S'], draw: false },
        { origin: ['ActionRegistration', 'N'], target: ['DataMining', 'S'], draw: false },
        { origin: ['ActionRegistration', 'N'], target: ['ResultVisualize', 'S'], draw: false },
        { origin: ['ActionRegistration', 'N'], target: ['ResultPublish', 'S'], draw: false },


        { origin: ['IntelligentAgent', 'SE'], target: ['KnowledgeBase', 'W'] },
        
        { origin: ['ActionRegistration', 'NE'], target: ['OperationHistory', 'N'] },
        { origin: ['ActionRegistration', 'W'], target: ['IntelligentAgent', 'EN'] },

        { origin: ['OperationHistory', 'S'], target: ['ActionRegistration', 'S'] },

        { origin: ['SuggestionController', 'N'], target: ['IntelligentAgent', 'EN'] },
        { origin: ['SuggestionController', 'ES'], target: ['ActionRegistration', 'S'] },
        { origin: ['KnowledgeBase', 'E'], target: ['ActionRegistration', 'S'] },
        { origin: ['IntelligentAgent', 'ES'], target: ['SuggestionController', 'W'] },
    ],
    menu: [
        {
            name: 'Simulacion',
            className: 'SimulationController',
            options: [
                { title: 'Pausar', action: 'simPause' },
                { title: 'Velocidad x0.5', action: 'simSlow' },
                { title: 'Velocidad x1.0', action: 'simNormal' },
                { title: 'Velocidad x2.0', action: 'simFast' },
                { title: 'Deshacer', action: 'simUndo' },
                { title: 'Reiniciar', action: 'simReset' }
            ]
        },
        {
            name: 'Base de Datos',
            className: 'DBConnection',
            options: [
                { title: 'Conectar', action: 'dbConnect' },
                { title: 'Desconectar', action: 'dbDisconnect' }
            ]
        },
        {
            name: 'Selección',
            className: 'DataSelection',
            options: [
                { title: 'Cargar datos', action: 'loadData' },
                { title: 'Seleccionar Tablas', action: 'selectTables' },
                { title: 'Combinar Tablas', action: 'combineTables' },
            ]
        },
        {
            name: 'Preprocesamiento',
            className: 'DataPreprocess',
            options: [
                { title: 'Detectar Anomalías', action: 'outlierDetect' },
                { title: 'Eliminar Anomalías', action: 'outlierRemove' },
                { title: 'Contar valores faltantes', action: 'countMissing' },
                { title: 'Estimar valores faltantes', action: 'estimateMissing' },
            ]
        },
        {
            name: 'Transformación',
            className: 'DataTransform',
            options: [
                { title: 'Examinar conjunto de datos', action: 'transformExamine' },
                { title: 'Editar tipos de datos', action: 'transformEdit' },
                { title: 'Filtrar datos', action: 'transformFilter' },
                { title: 'Reducir dimensionalidad', action: 'transformReduce' }
            ]
        },
        {
            name: 'Minería',
            className: 'DataMining',
            options: [
                { title: 'Seleccionar Algoritmo', action: 'mineSelect' },
                { title: 'Configurar Algoritmo', action: 'mineConfigure' },
                { title: 'Ejecutar Algoritmo', action: 'mineExecute' }
            ]
        }, {
            name: 'Visualización',
            className: 'ResultVisualize',
            options: [
                { title: 'Explorar patrones', action: 'visualizeResults' },
                { title: 'Seleccionar patrones', action: 'visualizeSelect' },
                { title: 'Evaluar patrones', action: 'visualizeEvaluate' },
            ]
        },
        {
            name: 'Publicacion',
            className: 'ResultPublish',
            options: [
                { title: 'Seleccionar formato', action: 'publishSelect' },
                { title: 'Exportar patrones', action: 'publishExport' },
            ]
        }
    ]
};

export default CONFIG;