import Gestor_modelo from '../../models/modelo/index.js';
import Modelo from '../../../schema/modelo.js';

export default class Controlador_gestionar_modelo{
  static index(req, res) {
    Gestor_modelo.Obtener_modelos(req,res);
  }
  static create(req, res) {
    res.render("modelo/create");
  }
  static store(req, res) {
    const modelo = new Modelo(req.body.sku,req.body.denominacion,req.body.limite_inf_reproceso,req.body.limite_sup_reproceso,req.body.limite_inf_observado,req.body.limite_sup_observado);
    Gestor_modelo.Registrar_modelo(modelo,req,res);
  }
  static destroy(req, res) {
    Gestor_modelo.Eliminar_modelo(req,res);
  }
  static edit(req, res) {
    Gestor_modelo.Obtener_modelo(req,res);
  }
  static update(req, res) {
    const sku_old = req.params.sku;
    const modelo = new Modelo(req.body.sku,req.body.denominacion,req.body.limite_inf_reproceso,req.body.limite_sup_reproceso,req.body.limite_inf_observado,req.body.limite_sup_observado);
    Gestor_modelo.Modificar_modelo(sku_old,modelo,req,res);
  }
}