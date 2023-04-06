import Gestor_horario_control from '../../models/horario_control/index.js';

export default class Controlador_gestionar_horario_control{
  static async index(req, res) {
    await Gestor_horario_control.Obtener_ordenes_de_produccion(req,res);
  }
  static async update(req, res) {
    await Gestor_horario_control.Registrar_horario_control(req,res);
  }
}