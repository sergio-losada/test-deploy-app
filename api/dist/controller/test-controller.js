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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestController = void 0;
const test_service_1 = require("../service/test-service");
class TestController {
    constructor() {
        this.service = new test_service_1.TestService();
    }
    /**
     * Get a test response from the server.
     *
     * @param req - Express request object.
     * @param res - Express response object.
     * @returns JSON test response or an error response.
     */
    getTestResponse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.service.getTestResponse();
                if (response === null) {
                    res.status(404).json({ error: 'Requested response does not exist' });
                    return; // Solo se retorna en este caso
                }
                res.status(200).json(response);
            }
            catch (error) {
                res.status(500).json({ error: "Unexpected API error" });
            }
        });
    }
}
exports.TestController = TestController;
