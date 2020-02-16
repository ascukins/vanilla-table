"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var ItemTable_1 = require("./api/ItemTable");
var apiServer = express_1.default();
var apiPort = process.env.APIPORT || 3000;
var htmlServer = express_1.default();
var htmlPort = process.env.HTMLPORT || 4200;
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};
var itemTable = new ItemTable_1.ItemTable();
//-------------------------------------------------------------------------------
apiServer.use(express_1.default.json());
apiServer.use(allowCrossDomain);
apiServer.get('/api/items', function (req, res) {
    res.send(itemTable.getAll());
});
apiServer.get('/api/items/:id', function (req, res) {
    res.send(itemTable.getById(Number(req.params.id)));
});
apiServer.delete('/api/items/:id', function (req, res) {
    itemTable.deleteById(Number(req.params.id));
    res.send();
});
apiServer.put('/api/items/:id', function (req, res) {
    if (req && req.body) {
        var item = req.body;
        item.id = Number(req.params.id);
        itemTable.putItem(item);
        res.send();
    }
    else {
        res.status(400).send();
    }
});
apiServer.post('/api/items', function (req, res) {
    if (req && req.body) {
        var item = req.body;
        itemTable.putItem(item);
        res.send();
    }
    else {
        res.status(400).send();
    }
});
apiServer.get('/*', function (req, res) {
    res.status(501).send('');
});
apiServer.listen(apiPort, function () { return console.log('API is on port ' + apiPort); });
//-------------------------------------------------------------------------------
htmlServer.use('/css', express_1.default.static(__dirname + '\\html\\css'));
htmlServer.use('/js', express_1.default.static(__dirname + '\\html\\js'));
htmlServer.use(express_1.default.static(__dirname + '\\html'));
htmlServer.get('/', function (req, res) {
    res.sendFile(__dirname + '\\html\\index.html');
});
htmlServer.listen(htmlPort, function () { return console.log('HTML is on port ' + htmlPort); });
