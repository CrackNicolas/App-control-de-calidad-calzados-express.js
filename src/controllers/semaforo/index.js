export default class Controlador_gestionar_semaforo{
  static index(req, res) {
    const {cantidad} = req.params;
    let estado = true, green = undefined, yellow = undefined, red = undefined, message = 'SELECCIONAR VALORES DE PRUEBA';
    
    switch(cantidad){
      case "3": case "4": case "5": case "6": 
        green = "green";
        message = "VALOR "+cantidad+" PROBANDO";
      break;
      case "7": case "8": case "9": case "10": 
        yellow = "yellow"; 
        message = "VALOR "+cantidad+" PROBANDO";
      break;
      case "11": case "12": case "13": case "14": 
        red = "red"; 
        message = "VALOR "+cantidad+" PROBANDO";
      break;
      default:
        estado = undefined;
      break;
    }
    res.render('semaforo/index', { estado, green, yellow, red, message });
  }
}