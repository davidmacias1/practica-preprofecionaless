import React, { useRef, useState } from "react";
import { Container, Form, Row, Col, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { db } from "../../firebase"; // Asegúrate de ajustar la ruta
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";

import uleamLOGO from "../../img/logo-v1.png";
import { NavAskFor } from "../ui/NavAskFor";

export const Perfil = () => {
  const formRef = useRef(null);
  const [editData, setEditData] = useState(false);
  const [validated, setValidated] = useState(false);
  const [userData, setUserData] = useState({
    nombre: "Nombre de usuario",
    apellido: "Apellido de usuario",
    correo: "Correo electrónico",
  });

  const handleToggleFieldsState = () => {
    setEditData(!editData);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      const formData = Object.fromEntries(new FormData(form));
      console.log(formData);

      if (!formData.correo.endsWith("@live.uleam.edu.ec")) {
        Swal.fire({
          icon: "error",
          title: "¡Error!",
          text: "Ingrese su correo institucional (@live.uleam.edu.ec).",
        });
        return;
      }

      const emailExists = await verifyEmailExists(formData.correo);
      if (emailExists.exists) {
        await handleUpdateUsuario(formData, emailExists.id);
      } else {
        Swal.fire({
          icon: "error",
          title: "¡Error!",
          text: "El correo electrónico no existe en la base de datos.",
        });
      }
    }
    setValidated(true);
  };

  const verifyEmailExists = async (email) => {
    const q = query(collection(db, "usuarios"), where("correo", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { exists: true, id: userDoc.id, data: userDoc.data() };
    } else {
      return { exists: false };
    }
  };

  const handleUpdateUsuario = async (data, id) => {
    try {
      const userRef = doc(db, "usuarios", id);
      await updateDoc(userRef, {
        nombre: data.nombre,
        apellido: data.apellido,
      });

      handleProcessTheRequest({ estado: true, usuario: data });
    } catch (error) {
      console.error("Error updating document: ", error);
      handleProcessTheRequest({ estado: false, error: error.message });
    }
  };

  const handleProcessTheRequest = (res) => {
    if (res.estado === true) {
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        html: `
          <p class='mb-0'>Usuario
            <b class='text-primary'>${res.usuario.nombre}</b>
            <br> actualizado correctamente
          </p>`,
      });
      setUserData(res.usuario);
      handleToggleFieldsState();
      setValidated(false);
    } else {
      Swal.fire({
        icon: "error",
        title: "¡Error!",
        text: res.error,
      });
    }
  };

  return (
    <>
      <div className='h-100'>
        <NavAskFor />
        <div className='uleamBG py-5'>
          <Container className='d-flex justify-content-center'>
            <div className='text-white p-5 rounded' id='signup_form_container'>
              <img src={uleamLOGO} alt='logo' className='mb-3' id='login_form_logo' />
              <h1 className='fs-1 fw-bold text-dark'>Mi perfil</h1>
              <Form
                ref={formRef}
                validated={validated}
                onSubmit={handleSubmit}
                id='login_form'
                noValidate
              >
                <Row>
                  {[
                    {
                      nCols: 12,
                      type: "text",
                      state: editData,
                      controlId: "nombre",
                      label: "Nombre",
                      value: userData.nombre,
                      pattern: "^[a-zA-Zá-źÁ-Ź]{3,30}$",
                      invalid_feedback: "El nombre debe tener al menos 3 caracteres",
                    },
                    {
                      nCols: 12,
                      type: "text",
                      state: editData,
                      controlId: "apellido",
                      label: "Apellido",
                      value: userData.apellido,
                      pattern: "^[a-zA-Zá-źÁ-Ź]{3,30}$",
                      invalid_feedback: "El apellido debe tener al menos 3 caracteres",
                    },
                    {
                      nCols: 12,
                      type: "email",
                      state: !editData,
                      controlId: "correo",
                      label: "Correo electrónico",
                      value: userData.correo,
                      pattern: "^[a-zA-Z0-9._-]+@live.uleam.edu.ec$", // Cambiado a la terminación deseada
                      invalid_feedback: "Ingresa una dirección de correo electrónico válida",
                    },
                  ].map((field) => (
                    <Col xs={field.nCols} key={field.controlId}>
                      <Form.Group className='form-label mb-3' controlId={field.controlId}>
                        <Form.Label className='text-dark'>{field.label}</Form.Label>
                        <Form.Control
                          name={field.controlId}
                          required
                          type={field.type}
                          pattern={field.pattern}
                          disabled={!field.state}
                          defaultValue={field.value}
                        />
                        <div className='invalid-feedback fst-italic'>{field.invalid_feedback}</div>
                      </Form.Group>
                    </Col>
                  ))}
                  <Col>
                    <Button
                      variant='success'
                      type='button'
                      size='sm'
                      style={{ display: editData ? "none" : "inline-block" }}
                      onClick={handleToggleFieldsState}
                    >
                      Editar perfil
                    </Button>
                    <Button
                      variant='success'
                      type='submit'
                      size='sm'
                      style={{ display: editData ? "inline-block" : "none" }}
                    >
                      Guardar cambios
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </Container>
        </div>
      </div>
    </>
  );
};
