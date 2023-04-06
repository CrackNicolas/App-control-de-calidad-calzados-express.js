import Ejecutar_consulta from '../../../config/sql.js'
import Empleado from '../../../schema/empleado.js';
import Usuario from '../../../schema/usuario.js';
import Tipo_usuario from '../../../schema/tipo_usuario.js';
import Turno from '../../../schema/turno.js';

export default class Gestor_log{
    static Get_hora_actual(){
        let hora = new Date().getUTCHours();
        return (hora==0)? 24 - 3 : (hora==1)? 25 - 3 : hora - 3;
    }
    static async Comprobar_datos_login(req){
        const {usuario,contraseña} = req.body;
        try{
            const result = await Ejecutar_consulta("select e.*,u.Nombre usuario,u.Contraseña,u.Id_tipo_usuario from usuario u inner join empleado e on e.Dni = u.Empleado inner join tipo_usuario t on t.Nombre = u.Id_tipo_usuario where u.Nombre = '"+usuario+"' and u.Contraseña = '"+contraseña+"' ");
            return result;
        }catch(error){
            if(error) return undefined;
        }
    }
    static async Comprobar_turno(){
        const hora = this.Get_hora_actual()+":00:00";
        const result = await Ejecutar_consulta("select *from turno where '"+hora+"' >= Hora_inicio and '"+hora+"' <= Hora_fin ");
        return result;
    }
    static async Verificar_usuario(req,res){   
        const login = await this.Comprobar_datos_login(req);
        
        if(login===undefined){
            req.flash("mensaje","Sin conexion con la db");
            res.redirect("/");
        }else{
            if(login.length!=0){
                const turno = await this.Comprobar_turno();
                if(turno.length!=0){
                    this.Session_turno(req,turno[0]);
                    await this.Session(req,login[0]);
                    res.redirect(this.Get_ruta(login[0].Id_tipo_usuario))
                }else{
                    req.flash("mensaje","Estas fuera de turno vuelve mas tarde");
                    res.redirect("/");
                }
            }else{
                req.flash("mensaje","Usuario o contraseña incorrectas");
                res.redirect("/");
            }
        }
    }
    static async Session(req,i){
        req.session.hora_inicio_turno = this.Get_hora_actual();
        req.session.usuario = new Usuario(new Empleado(i.Dni,i.Nombre,i.Apellido,i.Correo),i.usuario,i.Contraseña,new Tipo_usuario(i.Id_tipo_usuario));
        req.flash("mensaje","Sesion iniciada con exito");
    }
    static Session_turno(req,j){
        req.session.turno = new Turno(j.Descripcion,j.Hora_inicio,j.Hora_fin)
    }
    static Get_ruta(tipo_usuario){
        switch(tipo_usuario){
            case "Administrador": return '/nav/menu_administrador';
            case "Supervisor de linea": return '/nav/menu_supervisor_linea';
            case "Supervisor de calidad": return '/nav/menu_supervisor_calidad';
        }
    }
}