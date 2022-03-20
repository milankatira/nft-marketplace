import React from "react";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
const AppBar = ({ web3Handler, account }) => {
  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#home">Navbar</Navbar.Brand>
          <Nav className="me-auto">
            {/* <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/features">
              Features
            </Nav.Link>
            <Nav.Link as={Link} to="/pricing">
              Pricing
            </Nav.Link> */}
          </Nav>{" "}
          {account ? (
            <Nav.Link
              className="button nav-button btn-sm mx-4"
              href={`https://etherscan.io.address/${account}`}
            >
              <Button variant="outline-light">
                {account.slice(0, 5) + "..." + account.slice(38, 42)}
              </Button>
            </Nav.Link>
          ) : (
            <Button variant="outline-light" onClick={web3Handler}>
              connect wallet
            </Button>
          )}
        </Container>
      </Navbar>
    </>
  );
};

export default AppBar;
