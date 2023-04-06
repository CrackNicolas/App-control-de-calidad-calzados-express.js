import Gestor_orden_de_produccion from '../../models/orden_de_produccion/index.js';
import Orden_de_produccion from '../../../schema/orden_de_produccion.js';
import Jornada_laboral from '../../../schema/jornada_laboral.js';

export default class Controlador_gestionar_orden_de_produccion{
  static async index(req, res) {      
    await Gestor_orden_de_produccion.Obtener_ordenes_de_produccion(req,res);
  }
  static async create(req, res) {
    await Gestor_orden_de_produccion.Instanciar_datos_de_orden_de_produccion(req,res);
  }
  static async reiniciar_semaforo(req,res){
    await Gestor_orden_de_produccion.Reiniciar_semaforo(req,res);
  }
  static async store(req, res) {
    const {numero,linea,modelo,color,pares_primera,pares_segunda} = req.body;
    const orden_de_produccion = new Orden_de_produccion(numero,"","",pares_primera,pares_segunda,"Iniciada",modelo,color,linea);
    const turno = req.session.turno;
    const jornada_laboral = new Jornada_laboral(0,"","",numero,turno);
    await Gestor_orden_de_produccion.Registrar_orden_de_produccion(req,res,orden_de_produccion,jornada_laboral);
  }
  static async edit(req, res) {
    await Gestor_orden_de_produccion.Obtener_orden_de_produccion(req,res);
  }
  static async update(req, res) {
    const numero = req.params.numero, estado = req.body.estado, turno = req.session.turno;
    const jornada_laboral = new Jornada_laboral(0,"","",numero,turno);
    await Gestor_orden_de_produccion.Modificar_orden_de_produccion(req,res,numero,estado,jornada_laboral);
  }
}