import Gestor_defecto from '../../models/defecto/index.js';
import Defecto from '../../../schema/defecto.js';

export default class Controlador_gestionar_defecto{
  static async index(req, res) {
    await Gestor_defecto.Obtener_defectos(req,res);
  }
  static create(req, res) {
    res.render("defecto/create");
  }
  static async store(req, res) {
    const defecto = new Defecto(req.body.descripcion,req.body.tipo_defecto);
    await Gestor_defecto.Registrar_defecto(defecto,req,res);
  }
  static async destroy(req, res) {
    await Gestor_defecto.Eliminar_defecto(req,res);
  }
}