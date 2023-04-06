import {Router} from 'express';
const router = Router();
import controlador_gestionar_orden_de_produccion from '../../controllers/orden_de_produccion/index.js';

export default router
    .get('/', controlador_gestionar_orden_de_produccion.index)
    .get('/create', controlador_gestionar_orden_de_produccion.create)
    .get('/edit/:numero', controlador_gestionar_orden_de_produccion.edit)
    .get('/reiniciar_semaforo/:op', controlador_gestionar_orden_de_produccion.reiniciar_semaforo)
    .post('/create', controlador_gestionar_orden_de_produccion.store)
    .post('/edit/:numero', controlador_gestionar_orden_de_produccion.update);