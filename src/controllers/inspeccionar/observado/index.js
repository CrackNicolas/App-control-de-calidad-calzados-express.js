import Gestor_inspeccionar from '../../../models/inspeccionar/observado/index.js';

export default class Controlador_gestionar_inspeccionar{
  static async index(req, res) {
    await Gestor_inspeccionar.Obtener_datos_inspeccion(req,res);
  }
}