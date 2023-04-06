import {Router} from 'express';
const router = Router();
import controlador_gestionar_log from '../../controllers/log/index.controler.js';

export default router.
    post('/iniciar',controlador_gestionar_log.Verificar).
    get('/cerrar_session',controlador_gestionar_log.Cerrar_session);