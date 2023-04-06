import Gestor_pares_segunda from '../../models/pares_segunda/index.js';

export default class controlador_gestionar_pares_segunda{
  static async index(req, res) {
    await Gestor_pares_segunda.Obtener_orden_de_produccion(req,res);
  }
  static create(req, res) {
    res.render("pares_segunda/create");
  }
  static async store(req, res) {
    await Gestor_pares_segunda.Registrar_pares_segunda(req,res);
  }
}