import {Router} from 'express';
const router = Router();
import controlador_gestionar_turno from '../../controllers/turno/index.js';

export default router
    .get('/', controlador_gestionar_turno.index)
    .get('/create', controlador_gestionar_turno.create)
    .post('/create', controlador_gestionar_turno.store)
    .post('/delete', controlador_gestionar_turno.destroy);