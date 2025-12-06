import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [pais, setPais] = useState("");
  const [cargo, setCargo] = useState("");
  const [anios, setAnios] = useState("");
  const [sueldo, setSueldo] = useState(0);
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [registros, setRegistros] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  // Función helper para obtener el ID del empleado (maneja espacios en nombres de propiedades)
  const obtenerIdEmpleado = (empleado) => {
    if (!empleado) return null;
    
    // Buscar cualquier propiedad que contenga 'id' (case insensitive, ignorando espacios)
    const keys = Object.keys(empleado);
    const idKey = keys.find(key => key.trim().toLowerCase() === 'id');
    
    return idKey ? empleado[idKey] : (empleado.id || empleado.ID || empleado.Id || null);
  };

  useEffect(() => {
    const cargarEmpleados = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/empleados');
        const data = await response.json();
        
        // Normalizar los datos: limpiar espacios en los nombres de propiedades
        const datosNormalizados = data.map(empleado => {
          const normalizado = {};
          Object.keys(empleado).forEach(key => {
            const keyLimpio = key.trim();
            normalizado[keyLimpio] = empleado[key];
          });
          return normalizado;
        });
        
        setRegistros(datosNormalizados);
      } catch (error) {
        console.error('Error al cargar los empleados:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarEmpleados();
  }, []);

  const registrarDatos = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editIndex !== null) {
      try {
        const empleado = registros[editIndex];
        const empleadoId = obtenerIdEmpleado(empleado);
        
        if (!empleadoId && empleadoId !== 0) {
          alert('❌ Error: No se pudo obtener el ID del empleado');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`http://localhost:3001/empleados/${empleadoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, edad, pais, cargo, anios, sueldo, correo, telefono }),
        });

        const responseData = await response.json().catch(() => ({ message: 'Sin respuesta' }));

        if (response.ok) {
          const nuevosRegistros = [...registros];
          // Mantener el ID original al actualizar
          const empleadoId = obtenerIdEmpleado(empleado);
          nuevosRegistros[editIndex] = { 
            ...empleado, 
            id: empleadoId,
            nombre, 
            edad, 
            pais, 
            cargo, 
            anios,  
            sueldo, 
            correo, 
            telefono 
          };
          setRegistros(nuevosRegistros);
          setEditIndex(null);
          limpiarFormulario();
          alert('✅ Empleado actualizado correctamente');
        } else {
          alert(`❌ Error al actualizar el empleado: ${responseData.error || responseData.message || 'Error desconocido'}`);
        }
      } catch (error) {
        console.error('Error al actualizar empleado:', error);
        alert('❌ Error de conexión al actualizar el empleado');
      }

      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/empleados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, edad, pais, cargo, anios, sueldo, correo, telefono }),
      });

      const data = await response.json();

      if (response.ok) {
        setRegistros([...registros, data]);
        alert('✅ Empleado guardado correctamente');
      } else {
        alert('❌ Error al guardar el empleado');
      }
    } catch (error) {
      alert('❌ Error de conexión al guardar el empleado');
    }

    limpiarFormulario();
    setLoading(false);
  };

  const eliminarRegistro = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este empleado?')) {
      return;
    }

    const empleado = registros[id];
    
    if (!empleado) {
      console.error('❌ ERROR: No se encontró el empleado en el índice', id);
      alert('❌ Error: No se encontró el empleado');
      return;
    }

    const empleadoId = obtenerIdEmpleado(empleado);
    
    if (!empleadoId && empleadoId !== 0) {
      console.error('❌ ERROR: El empleado no tiene un ID válido', empleado);
      alert('❌ Error: El empleado no tiene un ID válido');
      return;
    }

    const url = `http://localhost:3001/empleados/${empleadoId}`;
    setLoading(true);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const responseData = await response.json().catch(() => ({ message: 'Sin respuesta' }));

      if (response.ok) {
        const nuevosRegistros = registros.filter((_, i) => i !== id);
        setRegistros(nuevosRegistros);
        
        if (editIndex === id) {
          limpiarFormulario();
          setEditIndex(null);
        } else if (editIndex !== null && editIndex > id) {
          setEditIndex(editIndex - 1);
        }
        
        alert('✅ Empleado eliminado correctamente');
      } else {
        alert(`❌ Error al eliminar el empleado: ${responseData.error || responseData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      alert('❌ Error de conexión al eliminar el empleado');
    } finally {
      setLoading(false);
    }
  };

  const editarRegistro = (id) => {
    const reg = registros[id];
    setNombre(reg.nombre);
    setEdad(reg.edad);
    setPais(reg.pais);
    setCargo(reg.cargo);
    setAnios(reg.anios);
    setSueldo(reg.sueldo);
    setCorreo(reg.correo);
    setTelefono(reg.telefono);
    setEditIndex(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const limpiarFormulario = () => {
    setNombre("");
    setEdad("");
    setPais("");
    setCargo("");
    setAnios("");
    setSueldo(0);
    setCorreo("");
    setTelefono("");
    setEditIndex(null);
  };

  return (
    <div className="app-container">
      <div className="container">
        <header className="header">
          <h1>👥 Sistema de Empleados</h1>
          <p>Gestiona tu equipo de forma eficiente</p>
        </header>

        <div className="content-grid">
          {/* FORMULARIO */}
          <div className="form-section">
            <div className="card">
              <div className="card-header">
                <h2>{editIndex !== null ? '✏️ Editar Empleado' : '➕ Nuevo Empleado'}</h2>
              </div>
              
              <form onSubmit={registrarDatos} className="form">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre completo</label>
                  <input
                    id="nombre"
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edad">Edad</label>
                    <input
                      id="edad"
                      type="number"
                      placeholder="25"
                      value={edad}
                      onChange={(e) => setEdad(e.target.value)}
                      required
                      min="18"
                      max="100"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="pais">País</label>
                    <input
                      id="pais"
                      type="text"
                      placeholder="Colombia"
                      value={pais}
                      onChange={(e) => setPais(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="cargo">Cargo</label>
                  <input
                    id="cargo"
                    type="text"
                    placeholder="Desarrollador Frontend"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="anios">Años de experiencia</label>
                  <input
                    id="anios"
                    type="number"
                    placeholder="3"
                    value={anios}
                    onChange={(e) => setAnios(e.target.value)}
                    required
                    min="0"
                    max="50"
                    disabled={loading}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="sueldo">Sueldo</label>
                    <input
                      id="sueldo"
                      type="number"
                      placeholder="1000000"
                      value={sueldo}
                      onChange={(e) => setSueldo(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="correo">Correo</label>
                    <input
                      id="correo"
                      type="email"
                      placeholder="juan.perez@example.com"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                      id="telefono"
                      type="tel"
                      placeholder="3178901234"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? '⏳ Procesando...' : editIndex !== null ? '💾 Actualizar' : '➕ Registrar'}
                  </button>
                  
                  {editIndex !== null && (
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={limpiarFormulario}
                      disabled={loading}
                    >
                      ❌ Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* TABLA DE EMPLEADOS */}
          <div className="table-section">
            <div className="card">
              <div className="card-header">
                <h2>📋 Empleados Registrados</h2>
                <span className="badge">{registros.length} empleados</span>
              </div>

              {loading && registros.length === 0 ? (
                <div className="loading">Cargando empleados...</div>
              ) : registros.length === 0 ? (
                <div className="empty-state">
                  <p>😔 No hay empleados registrados</p>
                  <p className="empty-subtitle">Agrega el primer empleado usando el formulario</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Edad</th>
                        <th>País</th>
                        <th>Cargo</th>
                        <th>Experiencia</th>
                        <th>Sueldo</th>
                        <th>Correo</th>
                        <th>Telefono</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registros.map((registro, index) => (
                        <tr key={index}>
                          <td data-label="Nombre">{registro.nombre}</td>
                          <td data-label="Edad">{registro.edad}</td>
                          <td data-label="País">{registro.pais}</td>
                          <td data-label="Cargo">{registro.cargo}</td>
                          <td data-label="Experiencia">{registro.anios} años</td>
                          <td data-label="Sueldo">{registro.sueldo}</td>
                          <td data-label="Correo">{registro.correo}</td>
                          <td data-label="Telefono">{registro.telefono}</td>
                          <td data-label="Acciones">
                            <div className="action-buttons">
                              <button
                                className="btn-icon btn-edit"
                                onClick={() => editarRegistro(index)}
                                title="Editar"
                                disabled={loading}
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-icon btn-delete"
                                onClick={() => eliminarRegistro(index)}
                                title="Eliminar"
                                disabled={loading}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;