export default class Session{
    static Comprobar_session(req,res,next){
        let urls_administrador = /navmenu_administrador|color|(turno|modelo|color)(create|delete|edit([0-9]+)|)/g;
        let urls_supervisor_de_linea = /navmenu_supervisor_linea|(linea)(create|delete|)|(orden_de_produccion)(create|edit([0-9]+)|reiniciar_semaforo([0-9]+)|)|(semaforo)(((comprobar)([0-9]+))|)/g;
        let urls_supervisor_de_calidad = /navmenu_supervisor_calidad|pantalla|(defecto)(create|delete|)|(horario_control)(update([0-9]+)|)|(pares_primera|pares_segunda)(create|)|(inspeccionar)(observado|reproceso|)|(inspeccionar)(observado|reproceso|)(incidencia([a-zA-Z]+)(Izquierdo|Derecho)([1-9]{2}):00[+-])/g;                                                                                                         

        if(req.session.usuario){
            let user = req.session.usuario.tipo_usuario.nombre, value = false, url = req.originalUrl.split("/").join("");
            switch(user){
                case "Administrador":
                    value = urls_administrador.test(url);
                    (value)? next() : res.render("errors/page_404");
                break;
                case "Supervisor de linea":
                    value = urls_supervisor_de_linea.test(url);
                    (value)? next() : res.render("errors/page_404");
                break;
                case "Supervisor de calidad":
                    value = urls_supervisor_de_calidad.test(url);
                    (value)? next() : res.render("errors/page_404");
                break;
                default:
                    res.render("errors/page_404");
                break;
            }
        }else{
            res.render('log/iniciar',{
                mensaje:"Tu sesion ha caducado por favor vuelve a iniciar sesion"
            });
        }
    }
}