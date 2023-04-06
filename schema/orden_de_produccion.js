export default class Orden_de_produccion{
    constructor(numero,fecha_inicio,fecha_fin,pares_de_primera,pares_de_segunda,estado,modelo,color,linea,empleado){
        this.numero = numero;
        this.fecha_inicio = fecha_inicio;
        this.fecha_fin = fecha_fin;
        this.pares_de_primera = pares_de_primera;
        this.pares_de_segunda = pares_de_segunda;
        this.estado = estado;
        this.modelo = modelo;
        this.color = color;
        this.linea = linea;
        this.empleado = empleado;
    }
}