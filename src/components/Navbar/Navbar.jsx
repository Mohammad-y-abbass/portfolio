import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";
const NavigationBar = () => {
  const logo1 = "<";
  const logo2 = "/";
  const logo3 = ">";
  return (
    <Navbar expand="md" variant="dark">
      <Container>
        <Navbar.Brand href="#1" className="logo">
          <span>{logo1}</span>Mohammad Abbass<span>{logo2}</span>
          <span>{logo3}</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="#1" className="navLink">
              About
            </Nav.Link>
            <Nav.Link href="#2" className="navLink">
              Skills
            </Nav.Link>
            <Nav.Link href="#3" className="navLink">
              Experience
            </Nav.Link>
            <Nav.Link href="#4" className="navLink">
              Projects
            </Nav.Link>
            <Nav.Link href="#5" className="navLink">
              Contact
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
