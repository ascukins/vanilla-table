import express from 'express';
import { ItemTable } from './api/ItemTable';
const apiServer = express();
const apiPort = process.env.APIPORT || 3000;
const htmlServer = express();
const htmlPort = process.env.HTMLPORT || 4200;
const allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

const itemTable = new ItemTable();

//-------------------------------------------------------------------------------
apiServer.use(express.json());
apiServer.use(allowCrossDomain);
apiServer.get('/api/items', (req: any, res: any) => {
    res.send(itemTable.getAll());
});
apiServer.get('/api/items/:id', (req: any, res: any) => {
    res.send(itemTable.getById(Number(req.params.id)));
});
apiServer.delete('/api/items/:id', (req: any, res: any) => {
    itemTable.deleteById(Number(req.params.id));
    res.send();
});
apiServer.put('/api/items/:id', (req: any, res: any) => {
    if (req && req.body) {
        const item = req.body;
        item.id = Number(req.params.id);
        itemTable.putItem(item);
        res.send();
    } else {
        res.status(400).send();
    }
});
apiServer.post('/api/items', (req: any, res: any) => {
    if (req && req.body) {
        const item = req.body;
        itemTable.putItem(item);
        res.send();
    } else {
        res.status(400).send();
    }
});
apiServer.get('/*', function (req, res) {
    res.status(501).send('');
});
apiServer.listen(apiPort, () => console.log('API is on port ' + apiPort));

//-------------------------------------------------------------------------------
htmlServer.use('/css', express.static(__dirname + '\\html\\css'));
htmlServer.use('/js', express.static(__dirname + '\\html\\js'));
htmlServer.use(express.static(__dirname + '\\html'));
htmlServer.get('/', function (req, res) {
    res.sendFile(__dirname + '\\html\\index.html');
});

htmlServer.listen(htmlPort, () => console.log('HTML is on port ' + htmlPort));
