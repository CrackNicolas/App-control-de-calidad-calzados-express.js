import {Router} from 'express';
const router = Router();
import controlador_gestionar_defecto from '../../controllers/defecto/index.js';

export default router
    .get('/', controlador_gestionar_defecto.index)
    .get('/create', controlador_gestionar_defecto.create)
    .post('/create', controlador_gestionar_defecto.store)
    .post('/delete', controlador_gestionar_defecto.destroy);