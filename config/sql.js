import {pool} from './conexion.js';

export default async function Ejecutar_consulta(sql){
    const [result] = await pool.query(sql);
    return result;
}