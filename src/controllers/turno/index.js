import Gestor_turno from '../../models/turno/index.js';
import Turno from '../../../schema/turno.js';

export default class Controlador_gestionar_turno{
  static async index(req, res) {
    await Gestor_turno.Obtener_turnos(req,res);
  }
  static create(req, res) {
    Gestor_turno.Instanciar_horarios_del_turno(req,res);
  }
  static async store(req, res) {
    const turno = new Turno(req.body.descripcion,req.body.hora_inicio,req.body.hora_fin);
    await Gestor_turno.Registrar_turno(turno,req,res);
  }
  static async destroy(req, res) {
    await Gestor_turno.Eliminar_turno(req,res);
  }
}