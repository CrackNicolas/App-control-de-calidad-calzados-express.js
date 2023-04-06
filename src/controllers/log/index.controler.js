import Gestor_log from '../../models/log/index.models.js';

export default class Controlador_gestionar_log{
  static async Verificar(req, res) {
    await Gestor_log.Verificar_usuario(req,res);
  }
  static Cerrar_session(req, res) {
    req.flash("mensaje","Sesion cerrada con exito");
    req.session.usuario = undefined;
    res.redirect("/");
  }
}