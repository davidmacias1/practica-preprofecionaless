import React, { useRef, useState, useEffect } from "react";
import { Container, Form, Row, Col, Button, Table } from "react-bootstrap";
import Swal from 'sweetalert2'; 
import { db } from '../../firebase'; // Asegúrate de que esta ruta sea correcta y que el archivo 'firebase.js' exporte correctamente 'db'
import { collection, addDoc, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { NavAskFor } from '../ui/NavAskFor';

export const AskFor = () => {
  const formRef = useRef(null);
  const [validated, setValidated] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener las solicitudes de la base de datos
  const fetchSolicitudes = async () => {
    try {
      const q = query(collection(db, "solicitudes"));
      const querySnapshot = await getDocs(q);
      const solicitudesArray = [];
      querySnapshot.forEach((doc) => {
        solicitudesArray.push({ ...doc.data(), id: doc.id });
      });
      setSolicitudes(solicitudesArray);
    } catch (e) {
      console.error("Error obteniendo documentos: ", e);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = Object.fromEntries(new FormData(form));
    const emailPattern = /^[a-zA-Z0-9._%+-]+@live\.uleam\.edu\.ec$/;

    if (form.checkValidity() === false || !emailPattern.test(formData.correo)) {
      if (!emailPattern.test(formData.correo)) {
        Swal.fire({
          icon: "error",
          title: "¡Error!",
          text: "Ingrese su correo institucional (@live.uleam.edu.ec)"
        });
      }
      event.stopPropagation();
    } else {
      try {
        const docRef = await addDoc(collection(db, "solicitudes"), formData);
        console.log("Documento escrito con ID: ", docRef.id);
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Solicitud añadida correctamente"
        });
        fetchSolicitudes(); // Actualizar la lista de solicitudes después de añadir una nueva
      } catch (e) {
        console.error("Error añadiendo documento: ", e);
        Swal.fire({
          icon: "error",
          title: "¡Error!",
          text: "No se pudo añadir la solicitud"
        });
      }
    }
    setValidated(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "solicitudes", id));
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Solicitud eliminada correctamente"
      });
      fetchSolicitudes(); // Actualizar la lista de solicitudes después de eliminar una
    } catch (e) {
      console.error("Error eliminando documento: ", e);
      Swal.fire({
        icon: "error",
        title: "¡Error!",
        text: "No se pudo eliminar la solicitud"
      });
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredSolicitudes = solicitudes.filter(solicitud =>
    solicitud.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    solicitud.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    solicitud.carrera.toLowerCase().includes(searchTerm.toLowerCase()) ||
    solicitud.semestre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <NavAskFor />
      <div className='h-100'>
        <div className='uleamBG py-5'>
          <Container className='d-sm-flex'>
            <div className='text-white p-4 m-1 rounded w-100' id='askfor_form_container'>
              <h1 className='fs-1 fw-bold text-dark'>Solicitar práctica</h1>
              <Form
                ref={formRef}
                validated={validated}
                onSubmit={handleSubmit}
                id='askfor_form'
                noValidate
              >
                <Row>
                  {[
                    {
                      type: "text",
                      controlId: "nombre",
                      label: "Nombre",
                      pattern: "^[a-zA-Zá-źÁ-Ź]{3,30}( [a-zA-Zá-źÁ-Ź]{1,})*$",
                      invalid_feedback: "El nombre debe tener al menos 3 caracteres",
                    },
                    {
                      type: "email",
                      controlId: "correo",
                      label: "Correo electrónico",
                      pattern: "^[a-zA-Z0-9._-]+@live\\.uleam\\.edu\\.ec$",
                      invalid_feedback: "El correo debe ser válido y tener la terminación @live.uleam.edu.ec",
                    },
                    {
                      type: "text",
                      controlId: "carrera",
                      label: "Carrera",
                      pattern: "^[a-zA-Zá-źÁ-Ź]{3,30}( [a-zA-Zá-źÁ-Ź]{1,})*$",
                      invalid_feedback: "El nombre debe tener al menos 3 caracteres",
                    },
                    {
                      type: "text",
                      controlId: "semestre",
                      label: "Semestre",
                      pattern: "^[a-zA-Zá-źÁ-Ź]{3,30}( [a-zA-Zá-źÁ-Ź]{1,})*$",
                      invalid_feedback: "El nombre debe tener al menos 3 caracteres",
                    },
                  ].map((field) => (
                    <Col xs={12} key={field.controlId}>
                      <Form.Group className='form-label mb-3' controlId={field.controlId}>
                        <Form.Label className='text-dark'>{field.label}</Form.Label>
                        <Form.Control
                          name={field.controlId}
                          required
                          type={field.type}
                          pattern={field.pattern}
                        />
                        <div className='invalid-feedback fst-italic'>{field.invalid_feedback}</div>
                      </Form.Group>
                    </Col>
                  ))}
                  <Col>
                    <Button variant='success' type='submit' size='sm'>
                      Enviar solicitud
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
            <div className='text-white p-4 m-1 rounded w-100' id='askfor_datatable'>
              <h1 className='fs-1 fw-bold text-dark'>Prácticas solicitadas</h1>
              <Form.Group controlId='search' className='mb-3'>
                <Form.Control
                  type='text'
                  placeholder='Buscar...'
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </Form.Group>
              <div className='table-container'>
                <Table striped bordered hover variant='dark'>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Carrera</th>
                      <th>Semestre</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSolicitudes.map((solicitud, index) => (
                      <tr key={index}>
                        <td>{solicitud.nombre}</td>
                        <td>{solicitud.correo}</td>
                        <td>{solicitud.carrera}</td>
                        <td>{solicitud.semestre}</td>
                        <td>
                          <Button variant='danger' size='sm' onClick={() => handleDelete(solicitud.id)}>
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </>
  );
};
