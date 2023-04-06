import Gestor_pantalla from '../../models/pantalla/index.js';

export default class controlador_gestionar_pantalla{
  static async index(req, res) {
    await Gestor_pantalla.Obtener_defectos(req,res);
  }
}