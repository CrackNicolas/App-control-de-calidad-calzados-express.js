import {Router} from 'express';
const router = Router();
import controlador_gestionar_pares_primera from '../../controllers/pares_primera/index.js';

export default router
    .get('/', controlador_gestionar_pares_primera.index)
    .get('/create', controlador_gestionar_pares_primera.create)
    .post('/create', controlador_gestionar_pares_primera.store);