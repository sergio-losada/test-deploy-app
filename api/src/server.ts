import http from 'http';
import express from 'express';
import morgan from 'morgan';
import chalk from 'chalk';
import routes from './routes/test-routes';
import authRoutes from './routes/auth-routes';
import { authenticateToken } from './middleware/auth';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'http://localhost:9200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


/** Logging */
morgan.token('methodColored', (req) => {
    const method = req.method;
    switch (method) {
        case 'GET':
            return chalk.green(method);
        case 'POST':
            return chalk.blue(method);
        case 'PUT':
            return chalk.yellow(method);
        case 'DELETE':
            return chalk.red(method);
        case 'PATCH':
            return chalk.magenta(method);
        default:
            return chalk.white(method);
    }
});

app.use(morgan(':methodColored :url :status :res[content-length] - :response-time ms'));

/** Request parsing */
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Rutas públicas
app.use('/auth', authRoutes);

// Rutas protegidas
// app.use('/', authenticateToken, routes);
app.use('/', routes);

/** Error handling */
app.use((req, res, next) => {
    const error = new Error('Not found');
    next(error);
});
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(404).json({
        message: err.message
    });
});

/** Server */
const httpServer = http.createServer(app);
const PORT: any = process.env.PORT ?? 9090;
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));
