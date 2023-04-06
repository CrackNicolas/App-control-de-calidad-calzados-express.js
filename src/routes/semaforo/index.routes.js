import {Router} from 'express';
const router = Router();
import controlador_gestionar_semaforo from '../../controllers/semaforo/index.js';

export default router
    .get('/', controlador_gestionar_semaforo.index)
    .get('/comprobar/:cantidad', controlador_gestionar_semaforo.index);