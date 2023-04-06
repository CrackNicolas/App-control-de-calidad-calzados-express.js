import Ejecutar_consulta from '../../../config/sql.js';

export default class Gestor_horario_control{
    static Get_hora_actual(){
        let hora = new Date().getUTCHours();
        return (hora==0)? 24 - 3 : (hora==1)? 25 - 3 : hora - 3;
    }
    static Get_fecha_hora_actual(){
        const date = new Date();
        return date.getFullYear()+"-"+(date.getUTCMonth()+1)+"-"+date.getUTCDate()+" "+(this.Get_hora_actual())+":00:00"; //En produccion
    }
    static async Obtener_id_orden_de_produccion(op){
        const result = await Ejecutar_consulta("select Id_orden_de_produccion from orden_de_produccion where Numero = '"+op+"' order by Id_orden_de_produccion desc limit 1");
        return (result.length!=0)? result[0].Id_orden_de_produccion : 0;
    }
    static async Obtener_ordenes_de_produccion(req,res){
        let icon = undefined, dni_empleado = req.session.usuario.empleado.dni;
        let result = await this.Verificar_existencia_horario_control(dni_empleado);
        let ordenes_de_produccion = [];
        if(result.length==0){
            ordenes_de_produccion = await this.Obtener_ordenes_de_produccion_disponibles();
            if(ordenes_de_produccion.length==0){
                req.flash("mensaje","No existen ordenes de produccion disponibles");
                res.redirect('/nav/menu_supervisor_calidad');
            }else{
                res.render('horario_control/index', { ordenes_de_produccion,icon });
            }
        }else{
            icon = "icon";
            result.map(i => (
                ordenes_de_produccion.push({
                    numero : i.Numero,
                    linea : i.Linea
                })
            ))
            res.render('horario_control/index', { ordenes_de_produccion,icon });
        }
    }
    static async Verificar_existencia_horario_control(dni_empleado){
        const result = await Ejecutar_consulta("select o.Numero,o.Linea from horario_control h inner join jornada_laboral j on j.Id_jornada_laboral = h.Jornada_laboral inner join orden_de_produccion o on o.Id_orden_de_produccion = j.Orden_de_produccion group by o.Numero,o.Linea,h.Empleado,h.Fecha_fin_hora having h.Empleado = '"+dni_empleado+"' and h.Fecha_fin_hora is null");
        return result;
    }
    static async Obtener_ordenes_de_produccion_disponibles(){
        let ordenes_de_produccion = [];
        const result = await Ejecutar_consulta("select o.Numero,o.Linea from jornada_laboral j inner join horario_control h on h.Jornada_laboral = j.Id_jornada_laboral inner join orden_de_produccion o on o.Id_orden_de_produccion = j.Orden_de_produccion where Fecha_inicio_hora is null and Fecha_fin_hora is null");
        result.map(i => (
            ordenes_de_produccion.push({
                numero : i.Numero,
                linea : i.Linea
            })
        ))
        return ordenes_de_produccion;
    }
    static async Registrar_horario_control(req,res){
        let {op} = req.params, dni_empleado = req.session.usuario.empleado.dni;
        
        let id_orden_de_produccion = await this.Obtener_id_orden_de_produccion(op);
        const result = await this.Verificar_existencia_de_jornada_laboral(id_orden_de_produccion);
        if(result.length==0){
            const jornada = await this.Obtener_jornada_laboral_de_horario_control(dni_empleado);
            if(jornada){
                const orden_de_produccion_disponible = await this.Verificar_disponibilidad_de_orden_produccion(id_orden_de_produccion);
                if(orden_de_produccion_disponible){
                    req.flash("mensaje","Error la orden de produccion ya ha sido ocupada por otro supervisor");
                }else{
                    const id_jornada_laboral = await this.Obtener_id_jornada_laboral(id_orden_de_produccion);
                    let fecha = this.Get_fecha_hora_actual();
                    await Ejecutar_consulta("insert into horario_control value(0,'"+id_jornada_laboral+"',current_timestamp(),null,'"+dni_empleado+"') "),
                    req.flash("mensaje","El usuario "+dni_empleado+" fue asociado a la orden de produccion numero "+op+" con exito");
                }
                res.redirect('/horario_control');
            }else{
                const result = await this.Obtener_ultima_jornada_laboral(id_orden_de_produccion);
                if(result[0].Estado!='Finalizada'){
                    this.Verificar_alerta(req,res,result[0].Id_jornada_laboral,op);
                }else{
                    this.Desasociar_empleado_de_orden_de_produccion(req,res,result[0].Id_jornada_laboral,op);
                }
            }
        }else{
            await this.Asociar_empleado_a_orden_de_produccion(req,res,result[0].Jornada_laboral,op);
        }
    }
    static async Verificar_existencia_de_jornada_laboral(orden_de_produccion){
        const result = await Ejecutar_consulta("select h.Jornada_laboral from jornada_laboral j inner join horario_control h on h.Jornada_laboral = j.Id_jornada_laboral where j.Orden_de_produccion = '"+orden_de_produccion+"' and h.Empleado is null ");
        return result;
    }
    static async Obtener_ultima_jornada_laboral(orden_de_produccion){
        const result = await Ejecutar_consulta("select o.Estado,max(j.Id_jornada_laboral) Id_jornada_laboral from orden_de_produccion o inner join jornada_laboral j on j.Orden_de_produccion = o.Id_orden_de_produccion where o.Id_orden_de_produccion = '"+orden_de_produccion+"' ");
        return result;
    }
    static async Obtener_jornada_laboral_de_horario_control(dni_empleado){
        const result = await Ejecutar_consulta("select Jornada_laboral from horario_control where Empleado = '"+dni_empleado+"' and Fecha_fin_hora is null");
        return result.length == 0;
    }
    static async Verificar_disponibilidad_de_orden_produccion(orden_de_produccion){
        const result = await Ejecutar_consulta("select h.Jornada_laboral from jornada_laboral j inner join horario_control h on h.Jornada_laboral = j.Id_jornada_laboral where h.Fecha_inicio_hora is null and h.Fecha_fin_hora is null and h.Empleado is null and j.Orden_de_produccion = '"+orden_de_produccion+"' ");
        return result.length == 0;
    }
    static async Obtener_id_jornada_laboral(orden_de_produccion){
        const result = await Ejecutar_consulta("select Id_jornada_laboral from jornada_laboral where Orden_de_produccion = '"+orden_de_produccion+"' ");
        return (result.length!=0)? result[0].Id_jornada_laboral : 0;
    }
    static async Asociar_empleado_a_orden_de_produccion(req,res,id_jornada_laboral,orden_de_produccion){
        let dni_empleado = req.session.usuario.empleado.dni;
        let fecha = this.Get_fecha_hora_actual();
        await Ejecutar_consulta("update horario_control set Fecha_inicio_hora = current_timestamp(), Empleado = '"+dni_empleado+"' where Jornada_laboral = '"+id_jornada_laboral+"' and Fecha_inicio_hora is null ");
        req.flash("mensaje","El usuario "+dni_empleado+" fue asociado a la orden de produccion numero "+orden_de_produccion+" con exito");
        res.redirect('/horario_control');
    }
    static async Desasociar_empleado_de_orden_de_produccion(req,res,id_jornada_laboral,orden_de_produccion){
        let dni_empleado = req.session.usuario.empleado.dni;
        let fecha = this.Get_fecha_hora_actual();
        await Ejecutar_consulta("update horario_control set Fecha_fin_hora = current_timestamp() where Jornada_laboral = '"+id_jornada_laboral+"' and Empleado = '"+dni_empleado+"' and Fecha_fin_hora is null");
        req.flash("mensaje","El usuario "+dni_empleado+" fue desasociado a la orden de produccion numero "+orden_de_produccion+" con exito");
        res.redirect('/horario_control');
    }
    static async Verificar_alerta(req,res,jornada_laboral,ordenes_de_produccion){
        let dni_empleado = req.session.usuario.empleado.dni;
        let fecha = this.Get_fecha_hora_actual();
        let alerta = await this.Verificar_existencia_alerta(jornada_laboral);
        if(!alerta){
            await Ejecutar_consulta("update horario_control set Fecha_fin_hora = current_timestamp() where Jornada_laboral = '"+jornada_laboral+"' and Empleado = '"+dni_empleado+"' and Fecha_fin_hora is null");
            await Ejecutar_consulta("insert into horario_control value(0,'"+jornada_laboral+"',null,null,null) ");
            req.flash("mensaje","El usuario "+dni_empleado+" fue desasociado a la orden de produccion numero "+ordenes_de_produccion+" con exito");
        }else{
            req.flash("mensaje","Error no podes abandonar la orden de produccion si el semaforo esta en rojo");
        }
        res.redirect('/horario_control');
    }
    static async Verificar_existencia_alerta(id_jornada_laboral){
        const result = await Ejecutar_consulta("select h.Id_horario_control from horario_control h inner join jornada_laboral j on j.Id_jornada_laboral = h.Jornada_laboral inner join alerta a on a.Id_jornada_laboral = j.Id_jornada_laboral where h.Jornada_laboral = '"+id_jornada_laboral+"' and a.Fecha_reinicio is null ");
        return result.length != 0;    
    }
}