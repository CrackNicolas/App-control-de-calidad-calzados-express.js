import Ejecutar_consulta from '../../../config/sql.js';
import Linea from '../../../schema/linea.js';

export default class Gestor_linea{
    static async Obtener_lineas(req,res){
        let lineas = [];
        try{
            const result = await Ejecutar_consulta("select *from linea");
            result.map(i => (
                lineas.push(new Linea(i.Numero))
            ))
            res.render('linea/', { lineas });
        }catch(error){
            req.flash("mensaje","No existen lineas registradas aun");
            res.redirect('/nav/menu_administrador');
        }
    }
    static async Registrar_linea(linea,req,res){
        const {numero} = linea;
        try{
            if(numero!=0){
                await Ejecutar_consulta("insert into linea value('"+numero+"')");
                req.flash("mensaje","Linea numero "+numero+" registrada con exito");
            }
        }catch(error){
            req.flash("mensaje","Se produjo un error al intentar insertar la linea numero "+numero);
        }
        res.redirect('/linea');
    }
    static async Eliminar_linea(req,res){
        const {numero} = req.body;
        try{
            await Ejecutar_consulta("delete from linea where Numero = '"+numero+"' ");
            req.flash("mensaje","Linea numero "+numero+" eliminada con exito");
        }catch(error){
            req.flash("mensaje","Se produjo un error al intentar eliminar la linea numero "+numero);
        }
        res.redirect('/linea');
    }
}