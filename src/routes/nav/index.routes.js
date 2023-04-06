import {Router} from 'express';
const router = Router();
import controlador_nav from '../../controllers/nav/index.controler.js';

export default router
    .get('/menu_administrador', controlador_nav.menu_administrador)
    .get('/menu_supervisor_linea', controlador_nav.menu_supervisor_linea)
    .get('/menu_supervisor_calidad', controlador_nav.menu_supervisor_calidad);