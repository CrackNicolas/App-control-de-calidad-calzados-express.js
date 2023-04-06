import {Router} from 'express';
const router = Router();
import controlador_gestionar_horario_control from '../../controllers/horario_control/index.js';

export default router
    .get('/', controlador_gestionar_horario_control.index)
    .get('/update/:op', controlador_gestionar_horario_control.update);