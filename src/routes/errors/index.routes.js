import {Router} from 'express';
const router = Router();
import controlador_gestionar_errors from '../../controllers/errors/index.js';

export default router
    .get('/', controlador_gestionar_errors.index)