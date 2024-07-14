import React, { useRef, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { NavHome } from "../ui/NavHome";
import { db, auth } from "../../firebase"; // Asegúrate de ajustar la ruta
import { collection, addDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

export const Signup = () => {
  const formRef = useRef(null);
  const [validated, setValidated] = useState(false);

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

      await handleAddUsuario(formData);
    }
    setValidated(true);
  };

  const handleAddUsuario = async (data) => {
    try {
      // Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, data.correo, data.contrasena);
      const user = userCredential.user;

      // Guardar información adicional del usuario en Firestore
      const docRef = await addDoc(collection(db, "usuarios"), {
        uid: user.uid,
        nombre: data.nombre,
        apellido: data.apellido,
        nick_usuario: data.nick_usuario,
        correo: data.correo
        // No guardes la contraseña en Firestore
      });

      handleProcessTheRequest({ estado: true, usuario: data });
    } catch (e) {
      console.error("Error adding document: ", e);
      handleProcessTheRequest({ estado: false, error: e.message });
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
            <br> registrado correctamente
          </p>`,
      });
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
        <NavHome />
        <div className='uleamBG py-5'>
          <Container className='d-flex justify-content-center'>
            <div className='bg-light p-5 rounded' id='signup_form_container'>
              <h1 className='fs-1 fw-bold text-primary'>Regístrate</h1>
              <Form ref={formRef} validated={validated} onSubmit={handleSubmit} id='signup_form' noValidate>
                <Row>
                  {[
                    {
                      nCols: 6,
                      type: "text",
                      controlId: "nombre",
                      label: "Nombre",
                      placeholder: "Ingresa tu nombre",
                      pattern: "^[a-zA-Zá-źÁ-Ź]{3,30}$",
                      invalid_feedback: "El nombre debe tener al menos 3 caracteres",
                    },
                    {
                      nCols: 6,
                      type: "text",
                      controlId: "apellido",
                      label: "Apellido",
                      placeholder: "Ingresa tu apellido",
                      pattern: "^[a-zA-Zá-źÁ-Ź]{3,30}$",
                      invalid_feedback: "El apellido debe tener al menos 3 caracteres",
                    },
                    {
                      nCols: 12,
                      type: "text",
                      controlId: "nick_usuario",
                      label: "Nombre de usuario",
                      placeholder: "Ingresa un nombre de usuario",
                      pattern: "^[a-zA-Z0-9_-]{5,20}$",
                      invalid_feedback: "El nombre de usuario debe tener entre 5 y 20 caracteres y puede incluir letras, números, guiones y guiones bajos",
                    },
                    {
                      nCols: 12,
                      type: "email",
                      controlId: "correo",
                      label: "Correo electrónico",
                      placeholder: "Ingresa tu correo institucional",
                      pattern: "^[a-zA-Z0-9._-]+@live.uleam.edu.ec$",
                      invalid_feedback: "Ingresa una dirección de correo electrónico válida con terminación @live.uleam.edu.ec",
                    },
                    {
                      nCols: 6,
                      type: "password",
                      controlId: "contrasena",
                      label: "Contraseña",
                      placeholder: "Ingresa una contraseña",
                      pattern: "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$",
                      invalid_feedback: "La contraseña debe tener al menos 8 caracteres, incluyendo letras y números",
                    },
                    {
                      nCols: 6,
                      type: "password",
                      controlId: "confirmar_contrasena",
                      label: "Confirmar contraseña",
                      placeholder: "Confirma tu contraseña",
                      pattern: "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$",
                      invalid_feedback: "Por favor, confirma tu contraseña",
                    },
                  ].map((field) => (
                    <Col xs={field.nCols} key={field.controlId}>
                      <Form.Group className='form-label mb-3' controlId={field.controlId}>
                        <Form.Label>{field.label}</Form.Label>
                        <Form.Control
                          name={field.controlId}
                          required
                          type={field.type}
                          placeholder={field.placeholder}
                          pattern={field.pattern}
                        />
                        <div className='invalid-feedback fst-italic'>{field.invalid_feedback}</div>
                      </Form.Group>
                    </Col>
                  ))}
                  <Col>
                    <Button variant='success' type='submit' size='sm'>
                      Crear cuenta
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
