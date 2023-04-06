import {Router} from 'express';
const router = Router();
import controlador_gestionar_modelo from '../../controllers/modelo/index.js';

export default router
    .get('/', controlador_gestionar_modelo.index)
    .get('/create', controlador_gestionar_modelo.create)
    .post('/create', controlador_gestionar_modelo.store)
    .post('/delete', controlador_gestionar_modelo.destroy)
    .get('/edit/:sku', controlador_gestionar_modelo.edit)
    .post('/edit/:sku', controlador_gestionar_modelo.update);