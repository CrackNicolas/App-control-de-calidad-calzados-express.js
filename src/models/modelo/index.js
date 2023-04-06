import Ejecutar_consulta from '../../../config/sql.js';
import Modelo from '../../../schema/modelo.js';

export default class Gestor_modelo{
    static async Obtener_modelos(req,res){
        let modelos = [];
        try{
            const result = await Ejecutar_consulta("select *from modelo");
            result.map(i => (
                modelos.push(new Modelo(i.Sku,i.Denominacion,i.Limite_inf_reproceso,i.Limite_sup_reproceso,i.Limite_inf_observado,i.Limite_sup_observado))
            ))
            res.render('modelo/index', { modelos });
        }catch(error){
            req.flash("mensaje","No existen modelos registrados aun");
            res.redirect('/nav/menu_administrador');
        }
    }
    static async Registrar_modelo(modelo,req,res){
        const {sku,denominacion,limite_inf_reproceso,limite_sup_reproceso,limite_inf_observado,limite_sup_observado} = modelo;
        try{
            if(sku!=0){
                await Ejecutar_consulta("insert into modelo value('"+sku+"','"+denominacion+"','"+limite_inf_reproceso+"','"+limite_sup_reproceso+"','"+limite_inf_observado+"','"+limite_sup_observado+"')");
                req.flash("mensaje","Modelo "+denominacion+" registrado con exito");
            }
        }catch(error){
            req.flash("mensaje","Se produjo un error al intentar insertar el modelo "+denominacion);
        }
        res.redirect('/modelo');
    }
    static async Eliminar_modelo(req,res){
        const {sku} = req.body;
        try{
            await Ejecutar_consulta("delete from modelo where Sku = '"+sku+"' ");
            req.flash("mensaje","El modelo con sku "+sku+" fue eliminado con exito");
        }catch(error){
            req.flash("mensaje","Se produjo un error al intentar eliminar el modelo con sku "+sku);
        }
        res.redirect('/modelo');
    }
    static async Obtener_modelo(req,res){
        const {sku} = req.params;
        try{
            const result = await Ejecutar_consulta("select *from modelo where Sku = '"+sku+"' ");
            res.render('modelo/edit', { modelo:result });
        }catch(error){
            req.flash("mensaje","Se produjo un error al intentar editar el modelo con sku "+sku);
            res.redirect('/modelo');
        }
    }
    static async Modificar_modelo(sku_old,modelo,req,res){
        const {sku,denominacion,limite_inf_reproceso,limite_sup_reproceso,limite_inf_observado,limite_sup_observado} = modelo;
        try{
            await Ejecutar_consulta("update modelo set Sku = '"+sku+"', Denominacion = '"+denominacion+"', Limite_inf_reproceso = '"+limite_inf_reproceso+"', Limite_sup_reproceso = '"+limite_sup_reproceso+"', Limite_inf_observado = '"+limite_inf_observado+"', Limite_sup_observado = '"+limite_sup_observado+"'  where Sku = '"+sku_old+"' ");
            req.flash("mensaje","Modelo "+denominacion+" modificado con exito");
        }catch(error){
            req.flash("mensaje","Se produjo un error al actualizar el modelo "+denominacion);
        }
        res.redirect('/modelo');
    }
}