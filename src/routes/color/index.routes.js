import {Router} from 'express';
const router = Router();
import controlador_gestionar_color from '../../controllers/color/index.js';

export default router
    .get('/', controlador_gestionar_color.index)
    .get('/create', controlador_gestionar_color.create)
    .post('/create', controlador_gestionar_color.store)
    .post('/delete', controlador_gestionar_color.destroy)
    .get('/edit/:codigo', controlador_gestionar_color.edit)
    .post('/edit/:codigo', controlador_gestionar_color.update);