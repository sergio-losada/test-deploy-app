import express from 'express';
import { AuthController } from '../controller/auth-controller';

const router = express.Router();
const controller = new AuthController();

router.post('/login', (req, res) => controller.login(req, res));

export = router;