//importar useState y useffect herramientas que nos brinda react
//useState sirve para guardar los datos en memoria
//useEffect permite ejecuta las funciones cuando se cargue la pagina

import { useState, useEffect } from 'react';
import './App.css';

function App() {

  //estados para guardar lo que el usuario escribe en el formulario
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState(0);
  const [pais, setPais] = useState("");
  const [cargo, setCargo] = useState("");
  const [anios, setAnios] = useState(0);

  //lista quie contenga todos los empleados que se registren
  const [registros, setRegistros] = useState([]);

  //este estado se usa para saber si estamos editando un empleado existente
  //si es null es un nuevo registro, y si tiene un valor es el indice del empleado
  const [editIndex, setEditIndex] = useState(null); // indice del registro que se esta editando

  //cuando se carga la pagina, obtenemos los empleados desde el backend(nodejs y mysql)

  useEffect(() => {
    //definimos una funcion asincrona para cargar los empleados
    const cargarEmpleados = async () => {
      try {
        const response = await fetch('http://localhost:3001/empleados');
        const data = await response.json();//la respuesta la da en formato json
        setRegistros(data);
      } catch (error) {
        alert('Error al cargar los empleados');
      }
    };

    cargarEmpleados();
  }, [editIndex]);

  //esta funcion se ejecuta al presionar el boton de registrar o actualizar

  const registrarDatos = async (e) => {
    e.preventDefault(); //evitamops que se recargue la pagina al enviar el formulario

    if (editIndex !== null) {
      //estaremos editando un empleado existente
      try {
        const empleado = registros[editIndex];

        const response = await fetch(`http://localhost:3001/empleados/${empleado.id}`, {
          method: 'PUT',//metodo HTTP para actualizar
          headers: { 'Content-Type': 'application/json' },//indicamos eque enviamos en formato JSON
          body: JSON.stringify({ nombre, edad, pais, cargo, anios })

        });

        if (response.ok) {
          const nuevosRegistros = [...registros]; //copiamos el array actual de registros
          //reemplazamos el objeto en la posicion editada con los nuevos valores
          nuevosRegistros[editIndex] = { ...empleado, nombre, edad, pais, cargo, anios };
          setEditIndex(null); //salimos del modo edicion
          alert('Empleado actualizado correctamente');
        } else {
          alert('Error al actualizar el empleado');
        }
      } catch (error) {
        alert('Error de conexion al actualizar');
      }
    } else {
      //si es un nuevo empleado(no estamos editando)
      try {
        const response = await fetch('http://localhost:3001/empleados', {
          method: 'POST',//metodo HTTP para agregar
          headers: { 'Content-Type': 'application/json' },//indicamos eque enviamos en formato JSON
          body: JSON.stringify({ nombre, edad, pais, cargo, anios })
        });
        const data = await response.json();
        if (response.ok) {
          setRegistros([...registros, data]);
          alert('Empleado guardado correctamente');
        } else {
          alert('Error al guardar el empleado');
        }
      } catch (error) {
        alert('Error de conexion al guardar');
      }
    }

    setNombre("");
    setEdad(0);
    setPais("");
    setCargo("");
    setAnios(0);

  };

  const eliminarRegistro = async (idx) => {
    const empleado = registros[idx];

    try {
      const response = await fetch(`http://localhost:3001/empleados/${empleado.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRegistros(registros.filter((_, i) => i !== idx));
        if (editIndex === idx) {
          setEditIndex(null);
          setNombre("");
          setEdad(0);
          setPais("");
          setCargo("");
          setAnios(0);
        }
        alert('Empleado eliminado correctamente');
      } else {
        alert('Error al eliminar el empleado');
      }

    } catch (error) {
      alert('Error de conexion al eliminar');
    }
  };

  const editarRegistro = (idx) => {
    const reg = registros[idx];
    setNombre(reg.nombre);
    setEdad(reg.edad);
    setPais(reg.pais);
    setCargo(reg.cargo);
    setAnios(reg.anios);
    setEditIndex(idx);
  };

  return (
    <div className="App">{/* Contenedor principal de la aplicación */}
      {/* Header de la aplicación */}
      <header className="app-header">
        <h1>Gestión de Empleados</h1>
        <p className="header-subtitle">Sistema de Registro y Administración</p>
      </header>

      {/* Formulario para ingresar los datos */}
      <div className="datos">{/* Contenedor del formulario */}
        <label> Nombre:{/* Etiqueta del input de nombre */}
          <input
            type="text" /* Campo de texto */
            value={nombre} /* Valor controlado por el estado 'nombre' */
            onChange={(e) => setNombre(e.target.value)} /* Actualiza 'nombre' al escribir */
          />
        </label>
        <label> Edad:{/* Etiqueta del input de edad */}
          <input
            type="number" /* Campo numérico */
            value={edad} /* Valor controlado por 'edad' */
            onChange={(e) => setEdad(Number(e.target.value))} /* Convierte a número y guarda */
          />
        </label>
        <label> País:{/* Etiqueta del input de país */}
          <input
            type="text" /* Campo de texto */
            value={pais} /* Valor controlado por 'pais' */
            onChange={(e) => setPais(e.target.value)} /* Actualiza 'pais' */
          />
        </label>
        <label> Cargo:{/* Etiqueta del input de cargo */}
          <input
            type="text" /* Campo de texto */
            value={cargo} /* Valor controlado por 'cargo' */
            onChange={(e) => setCargo(e.target.value)} /* Actualiza 'cargo' */
          />
        </label>
        <label> Años:{/* Etiqueta del input de años de experiencia */}
          <input
            type="number" /* Campo numérico */
            value={anios} /* Valor controlado por 'anios' */
            onChange={(e) => setAnios(Number(e.target.value))} /* Convierte a número y guarda */
          />
        </label>

        {/* Botón que cambia de texto dependiendo si es nuevo o edición */}
        <button onClick={registrarDatos}>
          {editIndex !== null ? 'Actualizar' : 'Registrar'}{/* Texto dinámico del botón */}
        </button>
      </div>

      {/* Tabla con los empleados registrados */}
      {registros.length > 0 && ( /* Solo mostramos la tabla si hay registros */
        <div className="tabla-container">{/* Contenedor para estilos de la tabla */}
          <table className="tabla-registros">{/* Tabla de empleados */}
            <thead>{/* Cabecera de la tabla */}
              <tr>{/* Fila de encabezados */}
                <th>Nombre</th>{/* Columna: Nombre */}
                <th>Edad</th>{/* Columna: Edad */}
                <th>País</th>{/* Columna: País */}
                <th>Cargo</th>{/* Columna: Cargo */}
                <th>Años</th>{/* Columna: Años de experiencia */}
                <th>Acciones</th>{/* Columna: Botones de acción */}
              </tr>
            </thead>
            <tbody>{/* Cuerpo de la tabla */}
              {registros.map((reg, idx) => ( /* Recorremos cada registro con su índice */
                <tr key={idx}>{/* Fila por empleado (key = índice) */}
                  <td>{reg.nombre}</td>{/* Celda: nombre del empleado */}
                  <td>{reg.edad}</td>{/* Celda: edad del empleado */}
                  <td>{reg.pais}</td>{/* Celda: país del empleado */}
                  <td>{reg.cargo}</td>{/* Celda: cargo del empleado */}
                  <td>{reg.anios}</td>{/* Celda: años de experiencia */}
                  <td>{/* Celda: acciones */}
                    <button
                      className="btn-editar" /* Clase CSS para estilos */
                      onClick={() => editarRegistro(idx)} /* Al hacer clic, cargamos los datos en el formulario */
                    >
                      Editar
                    </button>
                    <button
                      className="btn-eliminar" /* Clase CSS para estilos */
                      onClick={() => eliminarRegistro(idx)} /* Al hacer clic, eliminamos el registro */
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App; // Exportamos el componente para poder usarlo en otros archivos
