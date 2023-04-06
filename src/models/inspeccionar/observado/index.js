import Ejecutar_consulta from '../../../../config/sql.js';
import Orden_de_produccion from '../../../../schema/orden_de_produccion.js';
import Color from '../../../../schema/color.js';
import Modelo from '../../../../schema/modelo.js';
import Linea from '../../../../schema/linea.js';
import Empleado from '../../../../schema/empleado.js';
import Defecto from '../../../../schema/defecto.js';

export default class Gestor_inspeccionar{
    static mensaje = '';
    static color_message = '';
    static icon = '';
    static Asignar_mensaje(mensaje,color_message){
        this.mensaje = mensaje;
        this.color_message = color_message;
        this.icon = (color_message=='aqua')? 'si' : '';
    }
    static Get_fecha_actual(){
        const date = new Date();
        return date.getFullYear()+"-"+(date.getUTCMonth()+1)+"-"+date.getUTCDate();
    }
    static Get_hora_actual(){
        let hora = new Date().getUTCHours();
        return (hora==0)? 24 - 3 : (hora==1)? 25 - 3 : hora - 3;
    }
    static async Obtener_id_orden_de_produccion(numero){
        const result = await Ejecutar_consulta("select Id_orden_de_produccion from orden_de_produccion where Numero = '"+numero+"' and Estado <> 'Finalizada' ");
        return (result.length!=0)? result[0].Id_orden_de_produccion : 0;
    }
    static async Obtener_datos_inspeccion(req,res){
        let dni_empleado = req.session.usuario.empleado.dni;
        await this.Alerta(dni_empleado); 
        const result = await this.Obtener_orden_de_produccion_asociada_al_empleado(dni_empleado);
        if(result.length==0){
            req.flash("mensaje","Aun no te has asociado a ninguna orden de produccion");
            res.redirect('/nav/menu_supervisor_calidad');
        }else{
            await this.Analizar_datos_inspeccion(req,res,result[0]);
        }
    }
    static async Obtener_orden_de_produccion_asociada_al_empleado(dni_empleado){
        const result = await Ejecutar_consulta("select h.Id_horario_control,j.Orden_de_produccion from horario_control h inner join jornada_laboral j on j.Id_jornada_laboral = h.Jornada_laboral where h.Empleado = '"+dni_empleado+"' and h.Fecha_fin_hora is null");
        return result;
    }
    static async Analizar_datos_inspeccion(req,res,data){
        const {signo} = req.params;
        const activa = await this.Verificar_orden_de_produccion_activa(data);
        if(activa){
            const incidencia = await this.Obtener_datos_incidencia(req,data);
            if(incidencia.length!=0){
                await this.Actualizar_cantidad_incidencia(req,incidencia[0],data);
            }
            if(incidencia.length==0 && signo==="+"){
                await this.Registra_par(req,data);
            }
            await this.Actualizar(req,res);
        }else{
            req.flash("mensaje","No es posible registrar defectos de observado ya que la orden de produccion a la que te asociaste ha finalizado");
            res.redirect('/nav/menu_supervisor_calidad');
        }
    }
    static async Registra_par(req,data){
        const {defecto,pie,hora} = req.params, {Id_horario_control} = data;
        const alerta = await this.Verificar_existencia_alerta(Id_horario_control);
        if(!alerta){
            await Ejecutar_consulta("insert into incidencia value(0,current_date(),'"+hora+"',1,'"+pie+"','Pendiente','"+defecto+"','"+Id_horario_control+"')"); 
            this.Asignar_mensaje("Par registrado con exito","aqua");
        }else{
            this.Asignar_mensaje("No podes registrar mas incidencias si el semaforo esta en rojo","red");
        }
    }
    static async Verificar_existencia_alerta(id_horario_control){
        const result = await Ejecutar_consulta("select h.Id_horario_control from horario_control h inner join jornada_laboral j on j.Id_jornada_laboral = h.Jornada_laboral inner join alerta a on a.Id_jornada_laboral = j.Id_jornada_laboral where h.Id_horario_control = '"+id_horario_control+"' and a.Fecha_reinicio is null ");
        return result.length != 0;    
    }
    static async Obtener_datos_incidencia(req,data){
        const {defecto,pie,hora} = req.params, {Id_horario_control} = data;
        const result = await Ejecutar_consulta("select Id_incidencia,Cantidad from incidencia where Fecha = current_date() and Hora = '"+(hora+":00")+"' and Pie = '"+pie+"' and Defecto = '"+defecto+"' and Estado = 'Pendiente' and Id_horario_control = '"+Id_horario_control+"' ");
        return result;
    }
    static async Verificar_orden_de_produccion_activa(data){
        const {Orden_de_produccion} = data;
        const result = await Ejecutar_consulta("select Estado from orden_de_produccion where Id_orden_de_produccion = '"+Orden_de_produccion+"' and Estado <> 'Finalizada' order by Id_orden_de_produccion desc limit 1");
        return result.length != 0;
    }
    static async Actualizar_cantidad_incidencia(req,incidencia,data){
        const {signo} = req.params, {Id_horario_control} = data;
        let cantidad = 0;

        const alerta = await this.Verificar_existencia_alerta(Id_horario_control);
        if(!alerta){
            cantidad = (signo=='-')? (incidencia.Cantidad - 1) : (incidencia.Cantidad + 1);
            if(cantidad==0 || cantidad==-1){
                await this.Eliminar_incidencia(incidencia.Id_incidencia);
                this.Asignar_mensaje("No podes cargar numeros negativos","red");
            }
            if(cantidad>0){
                await Ejecutar_consulta("update incidencia set Cantidad = '"+cantidad+"' where Id_incidencia = '"+incidencia.Id_incidencia+"' ");   
                this.Asignar_mensaje("Pares actualizados con exito","aqua");
            }
        }else{
            this.Asignar_mensaje("No podes registrar mas incidencias si el semaforo esta en rojo","red");
        }
    }
    static async Eliminar_incidencia(incidencia){
        await Ejecutar_consulta("delete from incidencia where Id_incidencia = '"+incidencia+"' ");
    }
    static async Verificar_alerta_registrada(id_jornada_laboral){
        const result = await Ejecutar_consulta("select j.Id_jornada_laboral from jornada_laboral j inner join alerta a on a.Id_jornada_laboral = j.Id_jornada_laboral where j.Id_jornada_laboral = '"+id_jornada_laboral+"' ");
        return result.length != 0;
    }
    static async Registrar_alerta(tipo_defecto,id_jornada_laboral){
        const fecha = this.Get_fecha_actual();
        const alerta = await this.Verificar_alerta_registrada(id_jornada_laboral);        
        if(!alerta){
            await Ejecutar_consulta("insert into alerta value(0,current_timestamp(),null,'"+tipo_defecto+"','"+id_jornada_laboral+"')");
        }
    }
    static async Verificar_limites_de_modelo(tipo,id_jornada_laboral){
        const fecha = this.Get_fecha_actual();
        const result = await Ejecutar_consulta("select m.Limite_inf_"+tipo.toLowerCase()+",m.Limite_sup_"+tipo.toLowerCase()+",sum(i.Cantidad) cantidad from incidencia i inner join defecto d on d.Descripcion = i.Defecto inner join horario_control h on h.Id_horario_control = i.Id_horario_control inner join jornada_laboral j on j.Id_jornada_laboral = h.Jornada_laboral inner join orden_de_produccion o on o.Id_orden_de_produccion = j.Orden_de_produccion inner join modelo m on m.Sku = o.Modelo where d.Tipo_defecto = '"+tipo+"' and i.Fecha = current_date() and i.Estado = 'Pendiente' and h.Jornada_laboral = '"+id_jornada_laboral+"' ");
        return result;
    }
    static async Obtener_id_jornada_laboral(dni_empleado){
        const result = await Ejecutar_consulta("select Jornada_laboral from horario_control where Empleado = '"+dni_empleado+"' and Fecha_fin_hora is null ");
        return (result.length!=0)? result[0].Jornada_laboral : 0;
    }
    static async Obtener_id_orden_de_produccion(id_jornada_laboral){
        const result = await Ejecutar_consulta("select Orden_de_produccion from jornada_laboral where Id_jornada_laboral = '"+id_jornada_laboral+"' ");
        return (result.length!=0)? result[0].Orden_de_produccion : 0;
    }
    static async Cambiar_estado_orden_de_produccion(id_jornada_laboral){
        let id_orden_de_produccion = await this.Obtener_id_orden_de_produccion(id_jornada_laboral);
        await Ejecutar_consulta("update orden_de_produccion set Estado = 'Pausada' where Id_orden_de_produccion = '"+id_orden_de_produccion+"' and Estado <> 'Finalizada' ");
    }
    static async Alerta(dni_empleado){
        let id_jornada_laboral = await this.Obtener_id_jornada_laboral(dni_empleado);
        let limite_observado = await this.Verificar_limites_de_modelo('Observado',id_jornada_laboral);

        if(limite_observado.length!=0){
            if(limite_observado[0].cantidad != null && limite_observado[0].cantidad >= limite_observado[0].Limite_sup_observado){
                await this.Cambiar_estado_orden_de_produccion(id_jornada_laboral);
                await this.Registrar_alerta('Observado',id_jornada_laboral);
            }
        }
        let limite_reproceso = await this.Verificar_limites_de_modelo('Reproceso',id_jornada_laboral);
        if(limite_reproceso.length!=0){
            if(limite_reproceso[0].cantidad != null && limite_reproceso[0].cantidad >= limite_reproceso[0].Limite_sup_reproceso){
                await this.Cambiar_estado_orden_de_produccion(id_jornada_laboral);
                await this.Registrar_alerta('Reproceso',id_jornada_laboral);
            }
        }
    }
    static async Actualizar(req,res){
        let dni_empleado = req.session.usuario.empleado.dni;
        let hora_inicio_turno = req.session.hora_inicio_turno, hora_fin_turno = req.session.turno.hora_fin.split(":")[0];
        let horas_turno = [];      

        for(let i = hora_inicio_turno ; i <= hora_fin_turno ; i++){
            horas_turno.push({
                hora : (i<10)? "0"+i+":00" : i+":00"
            })
        }
        const orden_de_produccion = await this.Obtener_orden_de_produccion_del_empleado(dni_empleado);                      
        const result_defectos = await Ejecutar_consulta("select Descripcion from defecto where Tipo_defecto = 'Observado' ");
        let horas_aux = [],defectos = [],j = 0;
        do{
            for(let i = hora_inicio_turno ; i <= hora_fin_turno ; i++){
                let descripcion = result_defectos[j].Descripcion;
                let hora = (i<10)? "0"+i+":00" : i+":00";
                horas_aux.push({
                    hora : hora,
                    defect : descripcion,
                    cantidad : {
                        izq : await this.Obtener_cantidad(descripcion,hora,'Izquierdo',dni_empleado),
                        der : await this.Obtener_cantidad(descripcion,hora,'Derecho',dni_empleado)
                    }
                })
            }
            j++;
        }while(j < result_defectos.length);
        result_defectos.map(i => (
            defectos.push({
                defecto : new Defecto(i.Descripcion,i.Tipo_defecto),
                horas : horas_aux.filter(x => x.defect == i.Descripcion)
            })
        ))
        res.render('inspeccionar/observado/index',{
            message : this.mensaje,
            color_message : this.color_message,
            icon : this.icon,
            orden_de_produccion,
            horas_turno,
            defectos
        });
    }
    static async Obtener_cantidad(defecto,hora,pie,dni_empleado){
        const result = await Ejecutar_consulta("select i.Cantidad from incidencia i inner join defecto d on d.Descripcion = i.Defecto where i.Defecto = '"+defecto+"' and i.Hora = '"+(hora+":00")+"' and i.Pie = '"+pie+"' and i.Fecha = current_date() and i.Estado = 'Pendiente' and d.Tipo_defecto = 'Observado' and i.Id_horario_control = (select ho.Id_horario_control from horario_control ho where ho.Empleado = '"+dni_empleado+"' and ho.Fecha_fin_hora is null) ");
        let cantidad=0;
        result.map(i => (
            cantidad = i.Cantidad
        ))
        return cantidad;
    }
    static async Obtener_orden_de_produccion_del_empleado(dni_empleado){
        const result = await Ejecutar_consulta("select o.Numero,date_format(o.Fecha_inicio,'%d-%m-%Y %Hhs') Fecha_inicio,date_format(o.Fecha_fin,'%d-%m-%Y') Fecha_fin,o.Pares_de_primera,o.Pares_de_segunda,o.Estado,o.Linea,c.Codigo,c.Descripcion,m.Sku,m.Denominacion,m.Limite_inf_observado,m.Limite_inf_reproceso,m.Limite_sup_reproceso,m.Limite_sup_observado,e.Dni,e.Nombre,e.Apellido,e.Correo from orden_de_produccion o inner join modelo m on m.Sku = o.Modelo inner join color c on c.Codigo = o.Color inner join empleado e on e.Dni = o.Empleado where Id_orden_de_produccion = (select Orden_de_produccion from jornada_laboral where Id_jornada_laboral = (select Jornada_laboral from horario_control where Empleado = '"+dni_empleado+"' and Fecha_fin_hora is null))");
        let orden_de_produccion, modelo, color, linea, empleado;
        result.find(i => (
            modelo = new Modelo(i.Sku,i.Denominacion,i.Limite_inf_reproceso,i.Limite_sup_reproceso,i.Limite_inf_observado,i.Limite_sup_observado),
            color = new Color(i.Codigo,i.Descripcion),
            linea = new Linea(i.Linea),
            empleado = new Empleado(i.Dni,i.Nombre,i.Apellido,i.Correo),
            orden_de_produccion = new Orden_de_produccion(i.Numero,i.Fecha_inicio,i.Fecha_fin,i.Pares_de_primera,i.Pares_de_segunda,i.Estado,modelo,color,linea,empleado)
        ))
        return orden_de_produccion; 
    }
}