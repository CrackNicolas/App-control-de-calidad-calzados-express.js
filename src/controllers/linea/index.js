import Gestor_linea from '../../models/linea/index.js';
import Linea from '../../../schema/linea.js';

export default class Controlador_gestionar_linea{
  static async index(req, res) {
    await Gestor_linea.Obtener_lineas(req,res);
  }
  static create(req, res) {
    res.render("linea/create");
  }
  static async store(req, res) {
    const linea = new Linea(req.body.numero);
    await Gestor_linea.Registrar_linea(linea,req,res);
  }
  static async destroy(req, res) {
    await Gestor_linea.Eliminar_linea(req,res);
  }
}