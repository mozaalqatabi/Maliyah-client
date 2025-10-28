import React, { useState } from "react";
import { Navbar, Nav, NavItem, NavLink, NavbarToggler, Collapse } from "reactstrap";
import { FaUserAlt, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../Features/UserSlice";

function Header() {
  const [varIsOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!varIsOpen);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Get user from Redux
  const user = useSelector((state) => state.counter.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div>
      <Navbar
        className="navigation bg-white"
        light
        expand="md"
        style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)" }}
      >
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={varIsOpen} navbar>
          <Nav className="ms-auto d-flex align-items-center" navbar>
            {/* ✅ Greeting */}
            {user && (user.uname || user.email) && (
              <span className="me-3 fw-semibold text-dark">
                Hello, {user.uname || user.email}
              </span>
            )}

            {/*<NavItem className="navs mx-2">
              <Link to="/profile" className="text-dark">
                <FaUserAlt />
              </Link>
            </NavItem>*/}
            <NavItem className="navs mx-2">
              <NavLink onClick={handleLogout} className="text-dark">
                <FaSignOutAlt size={20} />
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
}

export default Header;
