import React, { useRef, useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase"; // Ajusta la ruta según tu proyecto

import uleamLOGO from "../../img/logo-v1.png";
import { NavHome } from "../ui/NavHome";

export const Login = () => {
  const [validated, setValidated] = useState(false);
  const [showError, setShowError] = useState(false);

  const navigate = useNavigate();

  const formRef = useRef(null);
  const error = useRef(null);
  const loginButton = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();

    const form = formRef.current;
    const isValid = form.checkValidity();

    if (!isValid) {
      setValidated(true);
      return;
    }

    const formData = Object.fromEntries(new FormData(form));
    handleSetLoginButtonStyle("loading");

    handleLogin(formData)
      .then((user) => handleProcessTheRequest(user))
      .catch((err) => {
        handleSetLoginButtonStyle("loaded");
        console.log(err);
        setShowError(true);
        error.current.innerText = err.message;
      });
  };

  const handleLogin = async (data) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.correo, data.contrasena);
      return userCredential.user;
    } catch (error) {
      throw new Error("Correo o contraseña incorrectos");
    }
  };

  const handleSetLoginButtonStyle = (state) => {
    if (state === "loading") {
      loginButton.current.disabled = true;
      loginButton.current.innerHTML = `<span class='spinner-border spinner-border-sm'></span>`;
    } else if (state === "loaded") {
      loginButton.current.disabled = false;
      loginButton.current.innerText = "Iniciar sesión";
    }
  };

  const handleProcessTheRequest = (user) => {
    handleSetLoginButtonStyle("loaded");
    if (user) {
      localStorage.setItem("userData", JSON.stringify(user));
      navigate("/askfor");
    }
  };

  return (
    <div className='h-100'>
      <NavHome />
      <div className='uleamBG py-5'>
        <Container className='d-flex justify-content-center'>
          <div className='text-white p-5 rounded' id='login_form_container'>
            <div className='text-center'>
              <img src={uleamLOGO} alt='logo' className='mb-3' id='login_form_logo' />
              <h1 className='fs-1 fw-bold text-dark'>Iniciar sesión</h1>
            </div>
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
                    type: "email",
                    controlId: "correo",
                    label: "Correo electrónico",
                    pattern: "^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$",
                    invalid_feedback: "Ingresa una dirección de correo electrónico válida",
                  },
                  {
                    nCols: 12,
                    type: "password",
                    controlId: "contrasena",
                    label: "Contraseña",
                    pattern: "^[a-zA-Z0-9]{6,30}$",
                    invalid_feedback: "La contraseña debe tener al menos 6 caracteres",
                  },
                ].map((field) => (
                  <Col xs={field.nCols} key={field.controlId}>
                    <Form.Group className='formRef-label mb-3' controlId={field.controlId}>
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
                  <Button
                    variant='success'
                    type='submit'
                    size='sm'
                    className='w-100'
                    ref={loginButton}
                  >
                    Iniciar sesión
                  </Button>
                </Col>
              </Row>
            </Form>
            <Alert
              ref={error}
              variant='danger'
              className={showError ? "mt-3" : "d-none"}
              id='login-error'
            ></Alert>
            <div className='text-center mt-3'>
              <Link to='/recoverpass' className='link-dark me-3'>
                Recuperar contraseña
              </Link>
              <Link to='/signup' className='link-dark'>
                Registrarse
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};
