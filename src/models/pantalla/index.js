import Ejecutar_consulta from '../../../config/sql.js';
import Pantalla from '../../../schema/pantalla.js';

export default class Gestor_pantalla{
    static Get_fecha_actual(){
        const date = new Date();
        return date.getFullYear()+"-"+(date.getUTCMonth()+1)+"-"+date.getUTCDate();
    }
    static async Ultima_hora(fecha,id_horario_control){
        const result = await Ejecutar_consulta("select max(Hora) Ultima from incidencia where Fecha = current_date() and Estado = 'Pendiente' and Id_horario_control = '"+id_horario_control+"' ");
        return (result.length!=0)? result[0].Ultima : '';
    }
    static async Obtener_defectos(req,res){
        let dni_empleado = req.session.usuario.empleado.dni;
        const id_horario_control = await this.Obtener_id_horario_control(dni_empleado);
        const fecha = this.Get_fecha_actual();
        const hora = await this.Ultima_hora(fecha,id_horario_control);
        if(hora!=null){
            const result = await this.Obtener_defectos_mas_encontrados(fecha,hora,id_horario_control);
            if(result.length!=0){
                let defectos = [];
                result.map(i => (
                    defectos.push(new Pantalla(i.Descripcion,i.Tipo_defecto,i.Hora,i.Cantidad))
                ));
                await this.Cambio_de_color_semaforo_observado(req,res,fecha,defectos);
            }else{
                req.flash("mensaje","Aun no se registro ningun defecto el dia de hoy 2");
                res.redirect('/nav/menu_supervisor_calidad');
            }
        }else{
            req.flash("mensaje","Aun no se registro ningun defecto el dia de hoy");
            res.redirect('/nav/menu_supervisor_calidad');
        }
    }
    static async Obtener_defectos_mas_encontrados(fecha,hora,id_horario_control){
        let result = await Ejecutar_consulta("select d.Descripcion,d.Tipo_defecto,i.Hora,sum(i.Cantidad) Cantidad from incidencia i inner join defecto d on d.Descripcion = i.Defecto group by i.Fecha,i.Hora,i.Defecto,i.Estado,i.Id_horario_control having i.Fecha = current_date() and i.Hora = '"+hora+"' and i.Estado = 'Pendiente' and i.Id_horario_control = '"+id_horario_control+"' order by Cantidad desc limit 5");
        result = this.Verificar_igualdad_de_cantidad(result);
        return result;
    }
    static Verificar_igualdad_de_cantidad(array){
        for(let cantidad of array){
            if(cantidad != array[0].Cantidad){
                return array;
            }
        }
        return this.Ordenar_alfabeticamente(array);
    }
    static Ordenar_alfabeticamente(aux){
        const array = aux.sort((a,b) => {
            if(a.Descripcion < b.Descripcion) return -1;
            if(a.Descripcion > b.Descripcion) return 1;
            return 0;
        })
        return array;
    }
    static async Obtener_id_jornada_laboral(dni_empleado){
        const result = await Ejecutar_consulta("select Jornada_laboral from horario_control where Empleado = '"+dni_empleado+"' and Fecha_fin_hora is null ");
        return (result.length!=0)? result[0].Jornada_laboral : 0;
    }
    static async Obtener_id_horario_control(dni_empleado){
        const result = await Ejecutar_consulta("select Id_horario_control from horario_control where Empleado = '"+dni_empleado+"' and Fecha_fin_hora is null ");
        return (result.length!=0)? result[0].Id_horario_control : 0;
    }
    static async Cambio_de_color_semaforo_observado(req,res,fecha,defectos){
        let semaforo_observado_green = undefined, semaforo_observado_yellow = undefined, semaforo_observado_red = undefined;
        let dni_empleado = req.session.usuario.empleado.dni;
        const jornada_laboral = await this.Obtener_id_jornada_laboral(dni_empleado);
        const result = await this.Verificar_limites_de_modelo("Observado",fecha,jornada_laboral);
        if(result.length!=0){
            result.find(i => (
                (i.cantidad==null)? semaforo_observado_green = "green" : 
                (i.cantidad>=i.Limite_inf_observado && i.cantidad<i.Limite_sup_observado)? semaforo_observado_yellow = "yellow" :
                (i.cantidad>=i.Limite_sup_observado)? semaforo_observado_red = "red" : semaforo_observado_green = "green"
            ))
            await this.Cambio_de_color_semaforo_reproceso(res,semaforo_observado_green,semaforo_observado_yellow,semaforo_observado_red,jornada_laboral,defectos);
        }
    }
    static async Cambio_de_color_semaforo_reproceso(res,semaforo_observado_green,semaforo_observado_yellow,semaforo_observado_red,jornada_laboral,defectos){
        const fecha = this.Get_fecha_actual();
        let semaforo_reproceso_green = undefined, semaforo_reproceso_yellow = undefined, semaforo_reproceso_red = undefined;
        const result = await this.Verificar_limites_de_modelo("Reproceso",fecha,jornada_laboral);
        if(result.length!=0){
            result.find(i => (
                (i.cantidad==null)? semaforo_reproceso_green = "green" :
                (i.cantidad>=i.Limite_inf_reproceso && i.cantidad<i.Limite_sup_reproceso)? semaforo_reproceso_yellow = "yellow" :
                (i.cantidad>=i.Limite_sup_reproceso)? semaforo_reproceso_red = "red" : semaforo_reproceso_green = "green"
            ))
        }
        if(semaforo_reproceso_red!=undefined){
            await this.Registrar_alerta(fecha,"Reproceso",jornada_laboral);
        }
        if(semaforo_observado_red!=undefined){
            await this.Registrar_alerta(fecha,"Observado",jornada_laboral);
        }
        let total = await this.Calcular_total_de_incidencias(jornada_laboral);
        res.render('pantalla/index', { semaforo_reproceso_green,semaforo_reproceso_yellow,semaforo_reproceso_red,semaforo_observado_green,semaforo_observado_yellow,semaforo_observado_red,defectos,total });
    }
    static async Verificar_limites_de_modelo(tipo,fecha,id_jornada_laboral){
        const result = await Ejecutar_consulta("select m.Limite_inf_"+tipo.toLowerCase()+",m.Limite_sup_"+tipo.toLowerCase()+",sum(i.Cantidad) cantidad from incidencia i inner join defecto d on d.Descripcion = i.Defecto inner join horario_control h on h.Id_horario_control = i.Id_horario_control inner join jornada_laboral j on j.Id_jornada_laboral = h.Jornada_laboral inner join orden_de_produccion o on o.Id_orden_de_produccion = j.Orden_de_produccion inner join modelo m on m.Sku = o.Modelo where d.Tipo_defecto = '"+tipo+"' and i.Fecha = current_date() and i.Estado = 'Pendiente' and h.Jornada_laboral = '"+id_jornada_laboral+"' ");
        return result;
    }
    static async Registrar_alerta(fecha,tipo_defecto,jornada_laboral){
        const result = await this.Obtener_alerta(fecha,jornada_laboral);
        if(result){
            await Ejecutar_consulta("insert into alerta value(0,current_timestamp(),null,'"+tipo_defecto+"','"+jornada_laboral+"')");
        }
    }
    static async Obtener_alerta(fecha,id_jornada_laboral){
        const result = await Ejecutar_consulta("select Id_alerta from alerta where Fecha_disparo = '"+fecha+"' and Id_jornada_laboral = '"+id_jornada_laboral+"' and Fecha_reinicio is null ");
        return result.length == 0;
    }
    static async Obtener_id_orden_de_produccion(id_jornada_laboral){
        const result = await Ejecutar_consulta("select Orden_de_produccion from jornada_laboral where Id_jornada_laboral = '"+id_jornada_laboral+"' and Fecha_fin is null");
        return (result.length!=0)? result[0].Orden_de_produccion : 0;
    }
    static async Calcular_total_de_incidencias(jornada_laboral){
        let id_orden_de_produccion = await this.Obtener_id_orden_de_produccion(jornada_laboral);
        const result = await Ejecutar_consulta("select sum(i.Cantidad) Total from incidencia i inner join horario_control h on h.Id_horario_control = i.Id_horario_control inner join jornada_laboral j on j.Id_jornada_laboral = h.Jornada_laboral inner join orden_de_produccion o on o.Id_orden_de_produccion = j.Orden_de_produccion where o.Id_orden_de_produccion = '"+id_orden_de_produccion+"' ");
        return (result.length!=0)? result[0].Total : 0;
    }
}