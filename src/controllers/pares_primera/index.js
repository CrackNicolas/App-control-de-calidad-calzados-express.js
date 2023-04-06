import Gestor_pares_primera from '../../models/pares_primera/index.js';

export default class controlador_gestionar_pares_primera{
  static async index(req, res) {
    await Gestor_pares_primera.Obtener_orden_de_produccion(req,res);
  }
  static create(req, res) {
    res.render("pares_primera/create");
  }
  static async store(req, res) {
    await Gestor_pares_primera.Registrar_pares_primera(req,res);
  }
}