import Ejecutar_consulta from '../../../config/sql.js';
import Defecto from '../../../schema/defecto.js';

export default class Gestor_defecto{
    static async Obtener_defectos(req,res){
        let defectos = [];
        try{
            const result = await Ejecutar_consulta("select *from defecto");
            result.map(i => (
                defectos.push(new Defecto(i.Descripcion,i.Tipo_defecto))
            ))   
            res.render('defecto/index',{ defectos });
        }catch(error){
            req.flash("mensaje","No existen defectos registrados aun");
            res.redirect('/nav/menu_supervisor_calidad');
        }
    }
    static async Registrar_defecto(defecto,req,res){
        const {descripcion,tipo_defecto} = defecto;
        try{
            await Ejecutar_consulta("insert into defecto value('"+descripcion+"','"+tipo_defecto+"')");
            req.flash("mensaje","Defecto "+descripcion+" registrado con exito");
        }catch(error){
            req.flash("mensaje","Se produjo un error al intentar insertar el defecto "+descripcion);
        }
        res.redirect('/defecto');
    }
    static async Eliminar_defecto(req,res){
        const {descripcion} = req.body;
        try{
            await Ejecutar_consulta("delete from defecto where Descripcion = '"+descripcion+"' ");
            req.flash("mensaje","Defecto "+descripcion+" eliminado con exito");
        }catch(error){
            req.flash("mensaje","Se produjo un error al intentar eliminar el defecto "+descripcion);
        }
        res.redirect('/defecto');
    }
}