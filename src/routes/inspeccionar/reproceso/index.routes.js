import {Router} from 'express';
const router = Router();
import controlador_gestionar_inspeccionar from '../../../controllers/inspeccionar/reproceso/index.js';

export default router
    .get('/', controlador_gestionar_inspeccionar.index)
    .get('/incidencia/:defecto/:pie/:hora/:signo', controlador_gestionar_inspeccionar.index);