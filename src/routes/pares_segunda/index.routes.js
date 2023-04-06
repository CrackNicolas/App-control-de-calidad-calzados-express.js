import {Router} from 'express';
const router = Router();
import controlador_gestionar_pares_segunda from '../../controllers/pares_segunda/index.js';

export default router
    .get('/', controlador_gestionar_pares_segunda.index)
    .get('/create', controlador_gestionar_pares_segunda.create)
    .post('/create', controlador_gestionar_pares_segunda.store);