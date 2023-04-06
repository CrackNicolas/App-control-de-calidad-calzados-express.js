const Verificar_disponibilidad_de_orden_produccion = jest.fn();

describe("Pruebas destinadas a la asociacion del supervisor de calidad a una orden de produccion",() => {
    test("Orden de produccion disponible", () => {
        Verificar_disponibilidad_de_orden_produccion.mockReturnValueOnce([{
            Jornada_laboral: 15
        }]);
        const result = Verificar_disponibilidad_de_orden_produccion(1000);
        expect(result).toEqual([{
            Jornada_laboral : 15
        }]);
    });
    test("Orden de produccion no disponible", () => {
        Verificar_disponibilidad_de_orden_produccion.mockReturnValueOnce([{}]);
        const result = Verificar_disponibilidad_de_orden_produccion(1000);
        expect(result).toEqual([{
            Jornada_laboral : 15
        }]);
    });
});