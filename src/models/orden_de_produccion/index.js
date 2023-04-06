import Ejecutar_consulta from '../../../config/sql.js';
import Orden_de_produccion from '../../../schema/orden_de_produccion.js';
import Color from '../../../schema/color.js';
import Modelo from '../../../schema/modelo.js';
import Linea from '../../../schema/linea.js';
import Empleado from '../../../schema/empleado.js';

export default class Gestor_orden_de_produccion{
    static Get_hora_actual(){
        let hora = new Date().getUTCHours();
        return (hora==0)? 24 - 3 : (hora==1)? 25 - 3 : hora - 3;
    }
    static Get_fecha_hora_actual(){
        const date = new Date();
        return date.getFullYear()+"-"+(date.getUTCMonth()+1)+"-"+date.getUTCDate()+" "+(this.Get_hora_actual())+":00:00"; //En produccion
    }
    static async Instanciar_datos_de_orden_de_produccion(req,res){
        const not_existe_op = await this.Verificar_existencia_de_orden_de_produccion_del_empleado(req);
        if(not_existe_op){
            let disponible = true, colores = [], modelos = [], lineas = [];

            colores = await this.Obtener_colores();
            disponible = this.Verificar_disponibilidad(req,res,colores,"colores");

            modelos = await this.Obtener_modelos();
            disponible = this.Verificar_disponibilidad(req,res,modelos,"modelos");

            lineas = await this.Obtener_lineas();
            disponible = this.Verificar_disponibilidad(req,res,lineas,"lineas");

            if(disponible){
                res.render("orden_de_produccion/create",{lineas,modelos,colores});
            }
        }else{
            req.flash("mensaje","Error no puedes crear mas de una orden de produccion al mismo tiempo, para hacerlo deberas finalizar la que iniciaste");
            res.redirect("/orden_de_produccion");    
        }
    }
    static Verificar_disponibilidad(req,res,array,objeto){
        if(array.length!=0) return true;
        req.flash("mensaje","Error no existen "+objeto+" disponibles");
        res.redirect("/orden_de_produccion");
        return false;
    }
    static async Obtener_colores(){
        const result = await Ejecutar_consulta("select *from color");
        let colores = [];
        result.map(i => (
            colores.push(new Color(i.Codigo,i.Descripcion))
        ))
        return colores;
    }
    static async Obtener_modelos(){
        const result = await Ejecutar_consulta("select *from modelo");
        let modelos = [];
        result.map(i => (
            modelos.push(new Modelo(i.Sku,i.Denominacion,i.Limite_inf_reproceso,i.Limite_sup_reproceso,i.Limite_inf_observado,i.Limite_sup_observado))
        ))
        return modelos;
    }
    static async Obtener_lineas(){
        const result = await Ejecutar_consulta("select Numero from linea");
        
        let aux = [];
        result.map(i => (
            aux.push(i.Numero)
        ))
        let lineas_en_uso = await this.Lineas_en_uso();
       
        let lineas = [];
        aux.filter(i => !lineas_en_uso.includes(i)).map(i => (
            lineas.push(new Linea(i))
        ))
        return lineas;
    }
    static async Lineas_en_uso(){
        const result = await Ejecutar_consulta("select Linea from orden_de_produccion where Estado <> 'Finalizada' ");
        let lineas = [];
        result.map(i => (
            lineas.push(i.Linea)
        ))
        return lineas;
    }
    static async Verificar_existencia_de_orden_de_produccion_del_empleado(req){
        let dni_empleado = req.session.usuario.empleado.dni;
        const result = await Ejecutar_consulta("select Numero from orden_de_produccion where Empleado = '"+dni_empleado+"' and Estado <> 'Finalizada' ");
        return result.length == 0;
    }
    static async Obtener_ordenes_de_produccion(req,res){
        let numero_orden_de_produccion = undefined;
        let dni_empleado = req.session.usuario.empleado.dni;

        const ordenes_de_produccion = await this.Obtener_orden_de_produccion_del_empleado(dni_empleado);
        const alerta = await this.Verificar_existencia_alerta(dni_empleado);
        if(!alerta){
            numero_orden_de_produccion = ordenes_de_produccion.numero;
        }
        res.render('orden_de_produccion/index', { ordenes_de_produccion, numero_orden_de_produccion });
    }
    static async Obtener_orden_de_produccion_del_empleado(dni_empleado){
        let ordenes_de_produccion = [], modelo, color, linea, empleado;
        const result = await Ejecutar_consulta("select o.Numero,date_format(o.Fecha_inicio,'%d-%m-%Y %Hhs') Fecha_inicio,date_format(o.Fecha_fin,'%d-%m-%Y %Hhs') Fecha_fin,o.Pares_de_primera,o.Pares_de_segunda,o.Estado,m.*,c.*,o.Linea,e.* from orden_de_produccion o inner join empleado e on e.Dni = o.Empleado inner join modelo m on m.Sku = o.Modelo inner join color c on c.Codigo = o.Color where e.Dni = '"+dni_empleado+"' and o.Estado <> 'Finalizada' ");
        result.find(i => (
            modelo = new Modelo(i.Sku,i.Denominacion,i.Limite_inf_reproceso,i.Limite_sup_reproceso,i.Limite_inf_observado,i.Limite_sup_observado),
            color = new Color(i.Codigo,i.Descripcion),
            linea = new Linea(i.Linea),
            empleado = new Empleado(i.Dni,i.Nombre,i.Apellido,i.Correo),
            ordenes_de_produccion = new Orden_de_produccion(i.Numero,i.Fecha_inicio,i.Fecha_fin,i.Pares_de_primera,i.Pares_de_segunda,i.Estado,modelo,color,linea,empleado)
        ))
        return ordenes_de_produccion;
    }
    static async Registrar_orden_de_produccion(req,res,orden_de_produccion,jornada_laboral){
        const {turno} = jornada_laboral;
        const {numero,linea,modelo,color,estado} = orden_de_produccion;
        const dni_empleado = req.session.usuario.empleado.dni;

        const not_existe_op = await this.Verificar_existencia_de_orden_de_produccion(numero);
        if(not_existe_op){
            const linea_disponible = await this.Verificar_linea_disponible(linea);
            if(linea_disponible){
                await this.Push_new_orden_de_produccion(numero,estado,modelo,color,linea,dni_empleado);
                await this.Push_new_jornada_laboral(numero,turno);
                req.flash("mensaje","Orden de produccion numero "+numero+" iniciada con exito");
            }else{
                req.flash("mensaje","Error la linea numero "+linea+" ya no esta disponible");
            }
        }else{
            req.flash("mensaje","Error el numero de orden de produccion "+numero+" ya no esta disponible");
        }
        res.redirect('/orden_de_produccion');
    }
    static async Verificar_linea_disponible(linea){
        const result = await Ejecutar_consulta("select Linea from orden_de_produccion where Linea = '"+linea+"' and Estado <> 'Finalizada'");
        return result.length == 0;
    }
    static async Verificar_existencia_de_orden_de_produccion(numero){
        const result = await Ejecutar_consulta("select Numero from orden_de_produccion where Numero = '"+numero+"' and Estado <> 'Finalizada' ");
        return result.length == 0;
    }
    static async Push_new_orden_de_produccion(numero,estado,modelo,color,linea,empleado){
        let fecha = this.Get_fecha_hora_actual();
        await Ejecutar_consulta("insert into orden_de_produccion value(0,'"+numero+"',current_timestamp(),null,'0','0','"+estado+"','"+modelo+"','"+color+"','"+linea+"','"+empleado+"')");
    }
    static async Push_new_jornada_laboral(numero,turno){
        let fecha = this.Get_fecha_hora_actual();
        let id_orden_de_produccion = await this.Obtener_id_orden_de_produccion(numero);
        await Ejecutar_consulta("insert into jornada_laboral value(0,current_timestamp(),null,'"+id_orden_de_produccion+"','"+turno.descripcion+"')");
    }
    static async Obtener_orden_de_produccion(req,res){
        const {numero} = req.params;
        let estado = await this.Obtener_estado_orden_de_produccion(numero);
        res.render('orden_de_produccion/edit',{
            option_1 : (estado == "Iniciada")? true : undefined,
            option_2 : (estado == "Pausada")? true : undefined
        });
    }
    static async Cambiar_estado_orden_de_produccion(numero,estado){
        let id_orden_de_produccion = await this.Obtener_id_orden_de_produccion(numero);
        await Ejecutar_consulta("update orden_de_produccion set Estado = '"+estado+"' where Id_orden_de_produccion = '"+id_orden_de_produccion+"' and Estado <> 'Finalizada' ");
    }
    static async Obtener_estado_orden_de_produccion(orden_de_produccion){
        const result = await Ejecutar_consulta("select Estado from orden_de_produccion where Numero = '"+orden_de_produccion+"' order by Id_orden_de_produccion desc limit 1");
        return (result.length!=0)? result[0].Estado : '';
    }
    static async Obtener_id_orden_de_produccion(orden_de_produccion){
        const result = await Ejecutar_consulta("select Id_orden_de_produccion from orden_de_produccion where Numero = '"+orden_de_produccion+"' order by Id_orden_de_produccion desc limit 1");
        return (result.length!=0)? result[0].Id_orden_de_produccion : 0;
    }
    static async Verificar_existencia_jornada_laboral(orden_de_produccion){
        let numero = await this.Obtener_id_orden_de_produccion(orden_de_produccion);
        const result = await Ejecutar_consulta("select Id_jornada_laboral from jornada_laboral where Orden_de_produccion = '"+numero+"' and Fecha_fin is null order by Id_jornada_laboral desc limit 1");
        return result.length == 0;
    }
    static async Verificar_ultima_jornada_laboral(orden_de_produccion){
        let numero = await this.Obtener_id_orden_de_produccion(orden_de_produccion);
        const result = await Ejecutar_consulta("select max(Id_jornada_laboral) Id_jornada_laboral from jornada_laboral where Orden_de_produccion = '"+numero+"' ");
        return (result.length!=0)? result[0].Id_jornada_laboral : 0;
    }
    static async Verificar_existencia_alerta(dni_empleado){
        const result = await Ejecutar_consulta("select a.Id_alerta from alerta a inner join jornada_laboral j on j.Id_jornada_laboral = a.Id_jornada_laboral inner join orden_de_produccion o on o.Id_orden_de_produccion = j.Orden_de_produccion where o.Empleado = '"+dni_empleado+"' and a.Fecha_reinicio is null ");
        return result.length == 0;    
    }
    static async Obtener_id_horario_control(id_jornada_laboral){
        const result = await Ejecutar_consulta("select Id_horario_control from horario_control where Jornada_laboral = '"+id_jornada_laboral+"' and Fecha_fin_hora is null ");
        return (result.length!=0)? result[0].Id_horario_control : 0;
    }
    static async Finalizar_jornada_laboral(orden_de_produccion,id_jornada_laboral){
        let numero = await this.Obtener_id_orden_de_produccion(orden_de_produccion);
        let fecha = this.Get_fecha_hora_actual();
        let id_horario_control = await this.Obtener_id_horario_control(id_jornada_laboral);
        await Ejecutar_consulta("update jornada_laboral set Fecha_fin = current_timestamp() where Orden_de_produccion = '"+numero+"' and Fecha_fin is null ");
        await this.Cambiar_estado_incidencias(id_horario_control);
    }
    static async Finalizar_horario_control(orden_de_produccion){
        let numero = await this.Obtener_id_orden_de_produccion(orden_de_produccion);
        const result = await Ejecutar_consulta("select h.Id_horario_control,h.Fecha_inicio_hora from horario_control h inner join jornada_laboral j on j.Id_jornada_laboral = h.Jornada_laboral where j.Orden_de_produccion = '"+numero+"' and h.Fecha_fin_hora is null ");
        if(result.length!=0){
            if(result[0].Fecha_inicio_hora == null){
                await Ejecutar_consulta("update horario_control set Fecha_inicio_hora = current_timestamp(), Fecha_fin_hora = current_timestamp() where Id_horario_control = '"+result[0].Id_horario_control+"' ");
            }else{
                await Ejecutar_consulta("update horario_control set Fecha_fin_hora = current_timestamp() where Id_horario_control = '"+result[0].Id_horario_control+"' ");
            }            
        }
    }
    static async Modificar_orden_de_produccion(req,res,numero,estado,jornada_laboral){
        switch(estado){
            case "Iniciada":
                await this.Iniciar_orden_de_produccion(req,res,numero,jornada_laboral);
            break;
            case "Pausada":
                await this.Pausar_orden_de_produccion(req,res,numero);
            break;
            case "Finalizada":
                await this.Finalizar_orden_de_produccion(req,res,numero);
            break;
        }
    }
    static async Iniciar_orden_de_produccion(req,res,numero,jornada_laboral){
        const dni_empleado = req.session.usuario.empleado.dni;
        const alerta = await this.Verificar_existencia_alerta(dni_empleado);
        if(alerta){
            const {turno} = jornada_laboral;
            await this.Cambiar_estado_orden_de_produccion(numero,'Iniciada');
            const not_existe_jornada = await this.Verificar_existencia_jornada_laboral(numero);    
            if(not_existe_jornada){
                await this.Push_new_jornada_laboral(numero,turno);
                req.flash("mensaje","Orden de produccion numero "+numero+" iniciada con exito");
            }
        }else{
            req.flash("mensaje","No podes iniciar la orden de produccion si el semaforo esta en rojo");
        }
        res.redirect('/orden_de_produccion');
    }
    static async Pausar_orden_de_produccion(req,res,numero){
        const dni_empleado = req.session.usuario.empleado.dni;
        const id_jornada_laboral = await this.Verificar_ultima_jornada_laboral(numero);
        const alerta = await this.Verificar_existencia_alerta(dni_empleado);

        if(id_jornada_laboral!=0 && alerta){
            await this.Cambiar_estado_orden_de_produccion(numero,'Pausada');
            await this.Finalizar_jornada_laboral(numero,id_jornada_laboral);
            await this.Finalizar_horario_control(numero);
            req.flash("mensaje","Orden de produccion numero "+numero+" pausada con exito");
        }else{
            req.flash("mensaje","No podes pausar la orden de produccion si el semaforo esta en rojo");
        }
        res.redirect('/orden_de_produccion');
    }
    static async Finalizar_orden_de_produccion(req,res,numero){
        const dni_empleado = req.session.usuario.empleado.dni;
        const id_jornada_laboral = await this.Verificar_ultima_jornada_laboral(numero);
        const alerta = await this.Verificar_existencia_alerta(dni_empleado);
        if(alerta){
            let fecha = this.Get_fecha_hora_actual();
            await Ejecutar_consulta("update orden_de_produccion set Estado = 'Finalizada', Fecha_fin = current_timestamp() where Numero = '"+numero+"' ");
            await this.Finalizar_jornada_laboral(numero,id_jornada_laboral);
            await this.Finalizar_horario_control(numero);
            req.flash("mensaje","Orden de produccion numero "+numero+" finalizada con exito");
        }else{
            req.flash("mensaje","No podes finalizar la orden de produccion si el semaforo esta en rojo");
        }
        res.redirect('/orden_de_produccion');
    }
    static async Obtener_id_jornada_laboral(id_orden_de_produccion){
        const result = await Ejecutar_consulta("select Id_jornada_laboral from jornada_laboral where Orden_de_produccion = '"+id_orden_de_produccion+"' and Fecha_fin is null ");
        return (result.length!=0)? result[0].Id_jornada_laboral : 0;
    }
    static async Cambiar_estado_incidencias(id_horario_control){
        await Ejecutar_consulta("update incidencia set Estado = 'Resuelta' where Estado = 'Pendiente' and Id_horario_control = '"+id_horario_control+"' ");
    }
    static async Reiniciar_alerta(id_jornada_laboral){
        await Ejecutar_consulta("update alerta set Fecha_reinicio = current_timestamp() where Id_jornada_laboral = '"+id_jornada_laboral+"' ");
    }
    static async Obtener_turno_jornada_laboral(id_jornada_laboral){
        const result = await Ejecutar_consulta("select Turno from jornada_laboral where Id_jornada_laboral = '"+id_jornada_laboral+"' ");
        return (result.length!=0)? result[0].Turno : '';
    }
    static async Reiniciar_semaforo(req,res){
        let {op} = req.params;
        let id_orden_de_produccion = await this.Obtener_id_orden_de_produccion(op);
        let id_jornada_laboral = await this.Obtener_id_jornada_laboral(id_orden_de_produccion);
        let id_horario_control = await this.Obtener_id_horario_control(id_jornada_laboral);
        await this.Reiniciar_alerta(id_jornada_laboral);
        await this.Cambiar_estado_incidencias(id_horario_control);
        await Ejecutar_consulta("update jornada_laboral set Fecha_fin = current_timestamp() where Orden_de_produccion = '"+id_orden_de_produccion+"' and Fecha_fin is null ");
        await Ejecutar_consulta("update horario_control set Fecha_fin_hora = current_timestamp() where Id_horario_control = '"+id_horario_control+"' ");
        await Ejecutar_consulta("update orden_de_produccion set Estado = 'Iniciada' where Id_orden_de_produccion = '"+id_orden_de_produccion+"' and Estado <> 'Finalizada' ");

        let turno = await this.Obtener_turno_jornada_laboral(id_jornada_laboral);
        await Ejecutar_consulta("insert into jornada_laboral value(0,current_timestamp(),null,'"+id_orden_de_produccion+"','"+turno+"')");

        req.flash("mensaje","Semaforo reiniciado con exito");
        res.redirect('/orden_de_produccion');
    }
}