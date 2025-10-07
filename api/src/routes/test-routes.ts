import express from 'express';
import { TestController } from '../controller/test-controller';

const router = express.Router();
const controller = new TestController();

// CRUD
router.get('/users', (req, res) => controller.getTestResponse(req, res));
router.get('/users/:id', (req, res) => controller.getOne(req, res));
router.post('/users', (req, res) => controller.create(req, res));
router.put('/users/:id', (req, res) => controller.update(req, res));
router.delete('/users/:id', (req, res) => controller.delete(req, res));

export default router;