"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const test_controller_1 = require("../controller/test-controller");
const router = express_1.default.Router();
const controller = new test_controller_1.TestController();
// Llamada GET genérica al controlador
router.get('/', (req, res) => controller.getTestResponse(req, res));
module.exports = router;
