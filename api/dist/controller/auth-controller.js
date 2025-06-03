"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../config");
const SECRET_KEY = config_1.JWT_SECRET_KEY;
// Usuario simulado con contraseña hasheada
const fakeUser = {
    id: 1,
    username: 'admin',
    passwordHash: bcryptjs_1.default.hashSync('123456', 10)
};
class AuthController {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("GOLA");
            console.log(req.body);
            const { username, password } = req.body;
            if (username !== fakeUser.username) {
                res.status(401).json({ error: 'Usuario inválido' });
                return;
            }
            const passwordMatch = yield bcryptjs_1.default.compare(password, fakeUser.passwordHash);
            if (!passwordMatch) {
                res.status(401).json({ error: 'Contraseña incorrecta' });
                return;
            }
            const token = jsonwebtoken_1.default.sign({ id: fakeUser.id, username: fakeUser.username }, SECRET_KEY, {
                expiresIn: '1h'
            });
            res.json({ token });
        });
    }
}
exports.AuthController = AuthController;
