import {Router} from 'express';
const router = Router();
import controlador_gestionar_pantalla from '../../controllers/pantalla/index.js';

export default router.
    get('/', controlador_gestionar_pantalla.index);