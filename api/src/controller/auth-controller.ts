import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET_KEY } from '../config';

const SECRET_KEY = JWT_SECRET_KEY;

// Usuario simulado con contraseña hasheada
const fakeUser = {
  id: 1,
  username: 'admin',
  passwordHash: bcrypt.hashSync('123456', 10)
};

class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    console.log("GOLA")
    console.log(req.body)
    const { username, password } = req.body;

    if (username !== fakeUser.username) {
      res.status(401).json({ error: 'Usuario inválido' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, fakeUser.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Contraseña incorrecta' });
      return;
    }

    const token = jwt.sign({ id: fakeUser.id, username: fakeUser.username }, SECRET_KEY, {
      expiresIn: '1h'
    });

    res.json({ token });
  }
}

export { AuthController };

