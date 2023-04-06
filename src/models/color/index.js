import Ejecutar_consulta from '../../../config/sql.js';
import Color from '../../../schema/color.js';

export default class Gestor_color{
    static async Obtener_colores(req,res){
        const result = await Ejecutar_consulta("select *from color");
        let colores = [];
        try{
            result.map(i => (
                colores.push(new Color(i.Codigo,i.Descripcion))
            ))
            res.render('color/', { colores });
        }catch(error){
            req.flash("mensaje","No existen colores registrados aun");
            res.redirect('/nav/menu_administrador');
        }
    }
    static async Registrar_color(color,req,res){
        const {codigo,descripcion} = color;
        try{
            if(codigo!=0){
                await Ejecutar_consulta("insert into color value('"+codigo+"','"+descripcion+"')");
                req.flash("mensaje","Color "+descripcion+" registrado con exito");
            }
        }catch(error){
            req.flash("mensaje","Se produjo un error al intentar insertar el color "+descripcion);
        }
        res.redirect('/color');
    }
    static async Eliminar_color(req,res){
        const {codigo} = req.body;
        try{
            await Ejecutar_consulta("delete from color where Codigo = '"+codigo+"' ");
            req.flash("mensaje","Color con codigo "+codigo+" fue eliminado con exito");   
        }catch(error){
            req.flash("mensaje","Se produjo un error al intentar eliminar el color con codigo "+codigo);
        }
        res.redirect('/color');
    }
    static async Obtener_color(req,res){
        const {codigo} = req.params;
        try{
            const result = await Ejecutar_consulta("select *from color where Codigo = '"+codigo+"' ");
            res.render('color/edit', { color:result });
        }catch(error){
            req.flash("mensaje","Se produjo un error al intentar editar el color con codigo "+codigo);
            res.redirect('/color');
        }
    }
    static async Modificar_color(codigo_old,color,req,res){
        const {codigo,descripcion} = color;
        try{
            await Ejecutar_consulta("update color set Codigo = '"+codigo+"', Descripcion = '"+descripcion+"' where Codigo = '"+codigo_old+"' ");
            req.flash("mensaje","Color "+descripcion+" modificado con exito");
        }catch(error){
            req.flash("mensaje","Se produjo un error al actualizar el color "+descripcion);
        }
        res.redirect('/color');
    }
}