"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controller/auth-controller");
const router = express_1.default.Router();
const controller = new auth_controller_1.AuthController();
router.post('/login', (req, res) => controller.login(req, res));
module.exports = router;
