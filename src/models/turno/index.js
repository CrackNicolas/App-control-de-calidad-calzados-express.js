import Ejecutar_consulta from '../../../config/sql.js';
import Turno from '../../../schema/turno.js';

export default class Gestor_turno{
    static Instanciar_horarios_del_turno(req,res){
        let horas = [];
        for(let i = 6 ; i <= 22 ; i++){
            horas.push({
                id : (i<10)? "0"+i+":00"  : i+":00"
            });
        }
        res.render("turno/create",{horas});
    }
    static async Obtener_turnos(req,res){
        let turnos = [];
        try{
            const result = await Ejecutar_consulta("select *from turno");
            result.map(i => (
                turnos.push(new Turno(i.Descripcion,i.Hora_inicio,i.Hora_fin))
            ))
            res.render('turno/', { turnos });
        }catch(error){
            req.flash("mensaje","No existen turnos registrados aun");
            res.redirect('/nav/menu_administrador');
        }
    }
    static async Registrar_turno(turno,req,res){
        const {descripcion,hora_inicio,hora_fin} = turno;
        try{
            if(descripcion!=''){
                await Ejecutar_consulta("insert into turno value('"+descripcion+"','"+hora_inicio+"','"+hora_fin+"')");
                req.flash("mensaje","Turno "+descripcion+" registrado con exito");
            }
        }catch(error){
            req.flash("mensaje","Se produjo un error al intentar insertar el turno "+descripcion);
        }
        res.redirect('/turno');
    }
    static async Eliminar_turno(req,res){
        const {descripcion} = req.body;
        try{
            await Ejecutar_consulta("delete from turno where Descripcion = '"+descripcion+"' ");
            req.flash("mensaje","Turno "+descripcion+" eliminado con exito");
        }catch(error){
            req.flash("mensaje","Se produjo un error al intentar eliminar el turno "+descripcion);
        }
        res.redirect('/turno');
    }
}