export default class Modelo{
    constructor(sku,denominacion,limite_inf_reproceso,limite_sup_reproceso,limite_inf_observado,limite_sup_observado){
        this.sku = sku;
        this.denominacion = denominacion;
        this.limite_inf_reproceso = limite_inf_reproceso;
        this.limite_sup_reproceso = limite_sup_reproceso;
        this.limite_inf_observado = limite_inf_observado;
        this.limite_sup_observado = limite_sup_observado;
    }
}