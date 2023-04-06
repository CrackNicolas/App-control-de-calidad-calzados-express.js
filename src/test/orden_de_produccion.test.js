const Obtener_colores = jest.fn();
const Obtener_modelos = jest.fn();
const Obtener_lineas = jest.fn();

describe("Pruebas destinadas a la administracion de la orden de produccion",() => {
    test("Verificar existencia de colores", () => {
        Obtener_colores.mockReturnValueOnce([
            { Codigo : "11", Descripcion : "Azul"  },
            { Codigo : "12", Descripcion : "Verde" }
        ]);
        let colores = Obtener_colores();
        expect(colores).toEqual([
            { Codigo : "11", Descripcion : "Azul"  },
            { Codigo : "12", Descripcion : "Verde" }
        ]);
    });
    test("Verificar existencia de modelos", () => {
        Obtener_modelos.mockReturnValueOnce([
            {   
                Sku : "200",
                Denominacion : "Puma",
                Limite_inf_reproceso : 10,
                Limite_sup_reproceso : 20,
                Limite_inf_observado : 5,
                Limite_sup_observado : 15 
            }
        ]);
        let modelos = Obtener_modelos();
        expect(modelos).toEqual([
            {
                Sku : "200",
                Denominacion : "Puma",
                Limite_inf_reproceso : 10,
                Limite_sup_reproceso : 20,
                Limite_inf_observado : 5,
                Limite_sup_observado : 15 
            }
        ]);
    });

    test("Verificar existencia de lineas de produccion", () => {
        Obtener_lineas.mockReturnValueOnce([
            { Numero : 1 },
            { Numero : 2 },
            { Numero : 3 },
            { Numero : 4 }
        ]);
        let lineas = Obtener_lineas();
        expect(lineas).toEqual([
            { Numero : 1 },
            { Numero : 2 },
            { Numero : 3 },
            { Numero : 4 }
        ]);
    });
});