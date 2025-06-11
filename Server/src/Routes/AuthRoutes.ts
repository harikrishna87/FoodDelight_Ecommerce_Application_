import express, { Router } from 'express';
import { register, login, logout, getMe } from '../Controller/AuthController';
import { protect } from '../Middleware/AuthMiddleWare';

const router: Router = express.Router();

router.post('/register', register as express.RequestHandler);
router.post('/login', login as express.RequestHandler);
router.post('/logout', logout as express.RequestHandler);
router.get('/me', protect as express.RequestHandler, getMe as express.RequestHandler);

export default router;