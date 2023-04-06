const Obtener_orden_de_produccion_asociada_al_empleado = jest.fn();

describe("Pruebas destinadas para controlar la inspeccion de calzados",() => {
    test("Verificar que el supervisor de calidad tiene asociada una orden de produccion", () => {
        Obtener_orden_de_produccion_asociada_al_empleado.mockReturnValueOnce([{
            Id_horario_control : 10,
            Orden_de_produccion : 1000
        }]);
        const dni_empleado = 66;
        const resultado = Obtener_orden_de_produccion_asociada_al_empleado(dni_empleado);
        expect(resultado).toEqual([{
            Id_horario_control : 10,
            Orden_de_produccion : 1000
        }]);
    });
});