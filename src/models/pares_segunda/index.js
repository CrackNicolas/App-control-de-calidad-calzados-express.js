import Ejecutar_consulta from '../../../config/sql.js';
import Orden_de_produccion from '../../../schema/orden_de_produccion.js';
import Color from '../../../schema/color.js';
import Modelo from '../../../schema/modelo.js';
import Linea from '../../../schema/linea.js';
import Empleado from '../../../schema/empleado.js';

export default class Gestor_pares_segunda{
    static async Obtener_orden_de_produccion(req,res){
        let dni_empleado = req.session.usuario.empleado.dni;
        const result = await this.Verificar_asociacion_de_empleado(dni_empleado);
        if(result.length!=0){
            await this.Verificar_posibilidad_de_registrar_pares_de_segunda(req,res,result[0].Orden_de_produccion);
        }else{
            req.flash("mensaje","Aun no te has asociado a ninguna orden de produccion");
            res.redirect('/nav/menu_supervisor_calidad');
        }
    }
    static async Verificar_asociacion_de_empleado(dni_empleado){
        const result = await Ejecutar_consulta("select j.Orden_de_produccion from horario_control h inner join jornada_laboral j on j.Id_jornada_laboral = h.Jornada_laboral where h.Empleado = '"+dni_empleado+"' and h.Fecha_fin_hora is null ");
        return result;
    }
    static async Verificar_posibilidad_de_registrar_pares_de_segunda(req,res,op){
        let dni_empleado = req.session.usuario.empleado.dni;
        const result = await this.Verificar_estado_orden_de_produccion(dni_empleado);
        if(result.length!=0){
            const orden_de_produccion = await this.Buscar_orden_de_produccion(op);
            res.render('pares_segunda/index', { orden_de_produccion });
        }else{
            req.flash("mensaje","No es posible registrar pares de segunda ya que la orden de produccion a la que te asociaste ha finalizado");
            res.redirect('/nav/menu_supervisor_calidad');
        }
    }
    static async Buscar_orden_de_produccion(op){
        const result = await Ejecutar_consulta("select o.Numero,date_format(o.Fecha_inicio,'%d-%m-%Y %Hhs') Fecha_inicio,date_format(o.Fecha_fin,'%d-%m-%Y %Hhs') Fecha_fin,o.Pares_de_primera,o.Pares_de_segunda,o.Estado,m.*,c.*,o.Linea,e.* from orden_de_produccion o inner join empleado e on e.Dni = o.Empleado inner join modelo m on m.Sku = o.Modelo inner join color c on c.Codigo = o.Color where o.Id_orden_de_produccion = '"+op+"' ");
        let orden_de_produccion,modelo,color,linea,empleado;
        result.find(i => (
            modelo = new Modelo(i.Sku,i.Denominacion,i.Limite_inf_reproceso,i.Limite_sup_reproceso,i.Limite_inf_observado,i.Limite_sup_observado),
            color = new Color(i.Codigo,i.Descripcion),
            linea = new Linea(i.Linea),
            empleado = new Empleado(i.Dni,i.Nombre,i.Apellido,i.Correo),
            orden_de_produccion = new Orden_de_produccion(i.Numero,i.Fecha_inicio,i.Fecha_fin,i.Pares_de_primera,i.Pares_de_segunda,i.Estado,modelo,color,linea,empleado)
        ))
        return orden_de_produccion;
    }
    static async Verificar_existencia_alerta(id_horario_control){
        const result = await Ejecutar_consulta("select h.Id_horario_control from horario_control h inner join jornada_laboral j on j.Id_jornada_laboral = h.Jornada_laboral inner join alerta a on a.Id_jornada_laboral = j.Id_jornada_laboral where h.Id_horario_control = '"+id_horario_control+"' and a.Fecha_reinicio is null ");
        return result.length!=0;    
    }
    static async Registrar_pares_segunda(req,res){
        const {cantidad} = req.body, dni_empleado = req.session.usuario.empleado.dni;

        const result = await Ejecutar_consulta("select j.Orden_de_produccion,h.Id_horario_control from horario_control h inner join jornada_laboral j on j.Id_jornada_laboral = h.Jornada_laboral where h.Empleado = '"+dni_empleado+"' and h.Fecha_fin_hora is null");
        if(result.length!=0){
            const alerta = await this.Verificar_existencia_alerta(result[0].Id_horario_control);
            if(!alerta){
                await this.Verificar_cantidad_ingresada_de_pares_de_segunda(req,res,dni_empleado,cantidad,result[0].Orden_de_produccion);
            }else{
                req.flash("mensaje","No podes registrar pares de segunda si el semaforo esta en rojo");
                res.redirect('/nav/menu_supervisor_calidad');
            }
        }
    }
    static async Verificar_cantidad_ingresada_de_pares_de_segunda(req,res,dni_empleado,cantidad,op){
        if(cantidad!=''){
            const result = await this.Verificar_estado_orden_de_produccion(dni_empleado);
            if(result.length!=0){
                await Ejecutar_consulta("update orden_de_produccion set Pares_de_segunda = '"+cantidad+"' where Id_orden_de_produccion = '"+op+"' ");
                req.flash("mensaje","Pares de segunda registrados con exito");
                res.redirect('/pares_segunda');
            }else{
                req.flash("mensaje","No es posible registrar pares de segunda ya que la orden de produccion a la que te asociaste ha finalizado");
                res.redirect('/nav/menu_supervisor_calidad');
            }
        }else{
            res.redirect('/nav/menu_supervisor_calidad');
        }
    }
    static async Verificar_estado_orden_de_produccion(dni_empleado){
        const result = await Ejecutar_consulta("select h.Id_horario_control from horario_control h inner join jornada_laboral j on j.Id_jornada_laboral = h.Jornada_laboral where j.Fecha_fin is null and h.Empleado = '"+dni_empleado+"' order by h.Id_horario_control desc limit 1 ");
        return result;
    }
}