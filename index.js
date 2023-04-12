import express, { static as express_static } from 'express';
import { join, resolve } from 'path';

const app = express();
const port = 8081;

app.use('/', express_static(join(resolve(), 'public')));
app.get('/api/history', ((_, res) => {
    res.send('Pending');
}));

app.listen(port, () => {
    console.log(`> http://localhost:${port}`);
});