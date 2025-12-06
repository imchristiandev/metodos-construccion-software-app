const express = require('express');
const cors = require('cors');
const db = require('./db');
 
const app = express();
 
// Middlewares
app.use(cors()); // permitir solicitudes desde el cliente (localhost:3000)
app.use(express.json());
 
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Permite todos los orígenes
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    // Maneja las peticiones OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// Ruta: obtener todos los empleados
app.get('/empleados', (req, res) => {
    console.log('Solicitud GET recibida para /empleados');
    const sql = 'SELECT * FROM empleados';
 
    db.query(sql, (err, results) => {
        if (err) {
            return res
                .status(500)
                .json({ error: 'Error al obtener los datos de empleados' , details: err.message });
        }
        console.log('Empleados obtenidos:', results);
        return res.json(results);
    });
});
 
// Ruta: crear un empleado
app.post('/empleados', (req, res) => {
    const { nombre, edad, pais, cargo, anios, sueldo, correo, telefono } = req.body;
    //console.log('Datos recibidos:', req.body);
    
    const sql ='INSERT INTO empleados (nombre, edad, pais, cargo, anios, sueldo, correo, telefono) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
 
    db.query(sql, [nombre, edad, pais, cargo, anios, sueldo, correo, telefono], (err, result) => {
        if (err) {
            return res
                .status(500)
                .json({ error: 'Error al guardar los datos de empleados' , details: err.message});
                console.error('❌ ERROR en la consulta INSERT:', err.message);

        }
 
        return res.json({
            message: 'Empleado guardado correctamente',
            id: result.insertId,
            nombre,
            edad,
            pais,
            cargo,
            anios,
            sueldo,
            correo,
            telefono
        });
    });
});
 
// Ruta: actualizar empleado existente
app.put('/empleados/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, edad, pais, cargo, anios, sueldo, correo, telefono } = req.body;

    if (!id) {
        return res
            .status(400)
            .json({ error: 'ID no proporcionado', details: 'El ID es requerido' });
    }

    // Verificar la estructura de la tabla para obtener el nombre real de la columna ID
    db.query('DESCRIBE empleados', (describeErr, columns) => {
        if (describeErr) {
            console.error('❌ ERROR al describir la tabla:', describeErr);
            executeUpdate('id');
            return;
        }

        // Buscar la columna que sea clave primaria o tenga 'id' en el nombre
        let columnName = 'id'; // Por defecto
        if (columns && columns.length > 0) {
            const idColumn = columns.find(col => 
                col.Key === 'PRI' || 
                col.Field.toLowerCase() === 'id' ||
                col.Field.toLowerCase().includes('id')
            );
            if (idColumn) {
                columnName = idColumn.Field;
            }
        }

        executeUpdate(columnName);
    });

    function executeUpdate(columnName) {
        const sql = `UPDATE empleados SET nombre = ?, edad = ?, pais = ?, cargo = ?, anios = ?, sueldo = ?, correo = ?, telefono = ? WHERE \`${columnName}\` = ?`;

        db.query(sql, [nombre, edad, pais, cargo, anios, sueldo, correo, telefono, id], (err, result) => {
            if (err) {
                console.error('❌ ERROR en la consulta UPDATE:', err.message);
                return res
                    .status(500)
                    .json({ error: 'Error al actualizar el empleado', details: err.message });
            }

            if (result.affectedRows === 0) {
                return res
                    .status(404)
                    .json({ error: 'Empleado no encontrado', details: 'No se encontró un empleado con el ID proporcionado' });
            }

            return res.json({ message: 'Empleado actualizado correctamente' });
        });
    }
});
 
// Ruta: eliminar empleado existente
app.delete('/empleados/:id', (req, res) => {
    // Obtener ID directamente de req.params.id
    const id = req.params.id;
    
    console.log('=== LOG DELETE EMPLEADO ===');
    console.log('Solicitud DELETE recibida para /empleados/:id');
    console.log('req.params completo:', req.params);
    console.log('req.query completo:', req.query);
    console.log('req.params.id:', req.params.id);
    console.log('ID obtenido (const id):', id);
    console.log('Tipo de ID:', typeof id);
    console.log('URL completa:', req.url);
    console.log('Método:', req.method);
    console.log('Timestamp:', new Date().toISOString());

    if (!id) {
        console.error('❌ ERROR: ID no encontrado en req.params');
        return res
            .status(400)
            .json({ error: 'ID no proporcionado', details: 'El ID es requerido' });
    }

    // Primero verificar la estructura de la tabla para ver el nombre real de la columna
    db.query('DESCRIBE empleados', (describeErr, columns) => {
        if (describeErr) {
            console.error('❌ ERROR al describir la tabla:', describeErr);
            // Si falla DESCRIBE, intentar con 'id' por defecto
            executeDelete('id');
            return;
        }

        console.log('📋 Estructura de la tabla empleados:');
        columns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type}) - Key: ${col.Key || 'none'}`);
        });

        // Buscar la columna que sea clave primaria o tenga 'id' en el nombre
        let columnName = 'id'; // Por defecto
        if (columns && columns.length > 0) {
            const idColumn = columns.find(col => 
                col.Key === 'PRI' || 
                col.Field.toLowerCase() === 'id' ||
                col.Field.toLowerCase().includes('id')
            );
            if (idColumn) {
                columnName = idColumn.Field;
                console.log(`✅ Columna de ID encontrada: ${columnName}`);
            } else {
                console.warn('⚠️ No se encontró columna de ID, usando "id" por defecto');
            }
        }

        executeDelete(columnName);
    });

    function executeDelete(columnName) {
        const sql = `DELETE FROM empleados WHERE \`${columnName}\` = ?`;
        console.log('SQL a ejecutar:', sql);
        console.log('Nombre de columna usado:', columnName);
        console.log('Parámetros a usar:', [id]);
        console.log('Tipo del parámetro ID:', typeof id);

        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error('❌ ERROR en la consulta DELETE:');
                console.error('Mensaje de error:', err.message);
                console.error('Código de error:', err.code);
                console.error('Stack trace:', err.stack);
                return res
                    .status(500)
                    .json({ error: 'Error al eliminar el empleado', details: err.message });
            }

            console.log('✅ Consulta DELETE ejecutada correctamente');
            console.log('Resultado de la consulta:', result);
            console.log('Filas afectadas:', result.affectedRows);
            console.log('=== FIN LOG DELETE ===');
            return res.json({ message: 'Empleado eliminado correctamente' });
        });
    }
});
 
app.listen(3001, () => {
    console.log('Servidor del backend corriendo en el puerto 3001');
});