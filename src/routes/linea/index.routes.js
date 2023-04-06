import {Router} from 'express';
const router = Router();
import controlador_gestionar_linea from '../../controllers/linea/index.js';

export default router
    .get('/', controlador_gestionar_linea.index)
    .get('/create', controlador_gestionar_linea.create)
    .post('/create', controlador_gestionar_linea.store)
    .post('/delete', controlador_gestionar_linea.destroy);