const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

//get obtener - post crear - put actualizar - delete eliminar

app.get('/empleados', (req, res) => {
    const sql = 'SELECT * FROM empleados';

    db.query(sql, (err, results) => {
        if (err) {
            return res
                .status(500)
                .json({ error: 'error al obtener los empleados..' });
        }

        return res.json(results);
    });
});


app.post('/empleados', (req, res) => {
    const { nombre, edad, pais, cargo, anios } = req.body;

    const sql = 'INSERT INTO empleados (nombre, edad, pais, cargo, anios) VALUES (?, ?, ?, ?, ?)';

    db.query(sql, [nombre, edad, pais, cargo, anios], (err, results) => {
        if (err) {
            return res
                .status(500)
                .json({ error: 'error al guardar los datos del empleado' });
        }

        return res.json({
            message: 'empleado guardado correctamente',
            id: results.insertId,
            nombre,
            edad,
            pais,
            cargo,
            anios
        });
    });
});

app.put('/empleados/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, edad, pais, cargo, anios } = req.body;

    const sql = 'UPDATE empleados SET nombre= ?, edad= ?, pais= ?, cargo= ?, anios= ? WHERE id= ?';

    db.query(sql, [nombre, edad, pais, cargo, anios, id], (err) => {
        if (err) {
            return res
                .status(500)
                .json({ error: 'error al actualizar el empleado' });
        }

        return res.json({
            message: 'empleado actualizado correctamente',

        });
    });
});

app.delete('/empleados/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM empleados WHERE id = ?';

    db.query(sql, [id], (err) => {
        if (err) {
            return res
                .status(500)
                .json({ error: 'error al eliminar el empleado' });
        }

        return res.json({
            message: 'empleado eliminado correctamente'
        });
    });
});

app.listen(3001, () => {
    console.log('servidor del backend corriendo en el puerto 3001');
});