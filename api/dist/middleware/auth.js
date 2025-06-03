"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const SECRET_KEY = config_1.JWT_SECRET_KEY;
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
        res.status(401).json({ error: 'Token requerido' });
        return;
    }
    jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            res.status(403).json({ error: 'Token inválido' });
            return;
        }
        req.user = user;
        next();
    });
}
