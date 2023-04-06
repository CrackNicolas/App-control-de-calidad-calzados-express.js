import Gestor_color from '../../models/color/index.js';
import Color from '../../../schema/color.js';

export default class Controlador_gestionar_color{
  static async index(req, res) {
    await Gestor_color.Obtener_colores(req,res);
  }
  static create(req, res) {
    res.render("color/create");
  }
  static async store(req, res) {
    const color = new Color(req.body.codigo,req.body.descripcion);
    await Gestor_color.Registrar_color(color,req,res);
  }
  static async destroy(req, res) {
    await Gestor_color.Eliminar_color(req,res);
  }
  static async edit(req, res) {
    await Gestor_color.Obtener_color(req,res);
  }
  static async update(req, res) {
    const codigo_old = req.params.codigo;
    const color = new Color(req.body.codigo,req.body.descripcion);
    await Gestor_color.Modificar_color(codigo_old,color,req,res);
  }
}