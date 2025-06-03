"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const chalk_1 = __importDefault(require("chalk"));
const test_routes_1 = __importDefault(require("./routes/test-routes"));
const auth_routes_1 = __importDefault(require("./routes/auth-routes"));
const auth_1 = require("./middleware/auth");
const app = (0, express_1.default)();
/** Logging */
morgan_1.default.token('methodColored', (req) => {
    const method = req.method;
    switch (method) {
        case 'GET':
            return chalk_1.default.green(method);
        case 'POST':
            return chalk_1.default.blue(method);
        case 'PUT':
            return chalk_1.default.yellow(method);
        case 'DELETE':
            return chalk_1.default.red(method);
        case 'PATCH':
            return chalk_1.default.magenta(method);
        default:
            return chalk_1.default.white(method);
    }
});
app.use((0, morgan_1.default)(':methodColored :url :status :res[content-length] - :response-time ms'));
/** Request parsing */
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
// Rutas públicas
app.use('/auth', auth_routes_1.default);
// Rutas protegidas
app.use('/', auth_1.authenticateToken, test_routes_1.default);
/** Error handling */
app.use((req, res, next) => {
    const error = new Error('Not found');
    next(error);
});
app.use((err, req, res, next) => {
    res.status(404).json({
        message: err.message
    });
});
/** Server */
const httpServer = http_1.default.createServer(app);
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 9090;
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));
