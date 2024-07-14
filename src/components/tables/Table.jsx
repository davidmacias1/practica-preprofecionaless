import { useSelector, useDispatch } from "react-redux";
import React, { useState, useMemo, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button } from "react-bootstrap";

// Importaciones de Firebase
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Opciones de la tabla
import { paginationOptions } from "./TableOptions";

export const Table = () => {
  // Propiedades internas del componente
  const [filterText, setFilterText] = useState("");
  const [practicas, setPracticas] = useState([]);

  const dispatch = useDispatch();
  
  // Leer el almacenamiento local para obtener la información del usuario
  const localUserData = JSON.parse(window.localStorage.getItem("userData"));

  useEffect(() => {
    if (localUserData && localUserData.correo) {
      handleFetchSolicitudesData(localUserData.correo);
    } else {
      console.error("Correo no encontrado en localUserData");
    }
  }, [localUserData]);

  // Obtener las solicitudes de la base de datos
  const handleFetchSolicitudesData = async (correo) => {
    try {
      const q = query(collection(db, "practicas"), where("correo", "==", correo));
      const querySnapshot = await getDocs(q);
      const solicitudes = [];
      querySnapshot.forEach((doc) => {
        solicitudes.push(doc.data());
      });
      setPracticas(solicitudes);
    } catch (e) {
      console.error("Error obteniendo documentos: ", e);
    }
  };

  // Elementos filtrados con el texto de búsqueda
  const filteredItems = practicas.filter(
    (item) =>
      item.nombre.toLowerCase().includes(filterText.toLowerCase().trim()) ||
      item.correo.toLowerCase().includes(filterText.toLowerCase().trim()) ||
      item.carrera.toLowerCase().includes(filterText.toLowerCase().trim()) ||
      item.semestre.toLowerCase().includes(filterText.toLowerCase().trim())
  );

  // Columnas de la tabla
  const practicasColumns = useMemo(() => [
    {
      name: "Nombre",
      selector: (row) => row.nombre,
      wrap: true,
      reorder: true,
      sortable: true,
    },
    {
      name: "Correo",
      selector: (row) => row.correo,
      reorder: true,
      sortable: true,
    },
    {
      name: "Carrera",
      selector: (row) => row.carrera,
      wrap: true,
      reorder: true,
      sortable: true,
    },
    {
      name: "Semestre",
      selector: (row) => row.semestre,
      wrap: true,
      reorder: true,
      sortable: true,
    },
  ]);

  // Componente para filtrar las prácticas
  const subHeaderComponentMemo = useMemo(() => {
    const handleClearFilters = () => {
      if (filterText) setFilterText("");
    };
    return (
      <div className='input-group'>
        <input
          type='text'
          value={filterText}
          aria-label='Search'
          placeholder='Buscar por nombre, correo, carrera o semestre'
          className='form-control'
          onChange={({ target }) => setFilterText(target.value)}
        />
        <Button className='px-4' variant='outline-secondary' onClick={handleClearFilters}>
          X
        </Button>
      </div>
    );
  }, [filterText]);

  return (
    <DataTable
      striped
      pagination
      highlightOnHover
      data={filteredItems}
      columns={practicasColumns}
      noDataComponent='Sin datos que mostrar'
      paginationComponentOptions={paginationOptions}
      subHeader
      subHeaderComponent={subHeaderComponentMemo}
    />
  );
};
