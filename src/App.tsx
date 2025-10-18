import { Routes, Route, Link } from "react-router-dom"; 
import { Navbar, Nav, Container } from "react-bootstrap";
import Home from "./pages/Home";
import "./App.css";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    window.gtag?.('config', 'G-VNRCKLET4R', {
      page_path: location.pathname + location.search,
    });
  }, [location]);
}

export default function App() {
  usePageTracking();
  return (
    <div className="app-shell">
      <Navbar className="navbar-custom" expand="lg" fixed="top">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="brand">
            SCC Dashboard
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto"></Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>

      {/* site-wide legal footer */}
      <footer className="site-footer" role="contentinfo">
        <div className="footer-inner">
        © {new Date().getFullYear()} SCC Dashboard. This site is an independent, non-governmental project using publicly available Supreme Court of Canada data reproduced
         under the Terms and Conditions of the Supreme Court of Canada website. This dashboard is for informational purposes only and does not constitute legal advice. 
         The Supreme Court of Canada has not endorsed nor is it affiliated with this project.
        </div>
      </footer>
    </div>
  );
}
