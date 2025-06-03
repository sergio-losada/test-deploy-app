import express from 'express';
import { TestController } from '../controller/test-controller';

const router = express.Router();
const controller = new TestController();

// Llamada GET genérica al controlador
router.get('/', (req, res) => controller.getTestResponse(req, res));

export = router;