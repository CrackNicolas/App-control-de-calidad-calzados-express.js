export default class Controlador_gestionar_menu_administrador{
  static menu_administrador(req, res) {
    res.render("nav/menu_administrador",{
      tipo_usuario : req.session.usuario.tipo_usuario.nombre,
      empleado : req.session.usuario.empleado.apellido +" "+req.session.usuario.empleado.nombre
    });
  }
  static menu_supervisor_linea(req, res) {
    res.render("nav/menu_supervisor_linea",{
      tipo_usuario : req.session.usuario.tipo_usuario.nombre,
      empleado : req.session.usuario.empleado.apellido +" "+req.session.usuario.empleado.nombre
    });
  }
  static menu_supervisor_calidad(req, res) {
    res.render("nav/menu_supervisor_calidad",{
      tipo_usuario : req.session.usuario.tipo_usuario.nombre,
      empleado : req.session.usuario.empleado.apellido +" "+req.session.usuario.empleado.nombre
    });
  }
}