"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./Nav.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function Nav({ emp_id }) {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [productionPlanningOpen, setProductionPlanningOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUsername = async () => {
      const storedEmpId = emp_id || localStorage.getItem("emp_id");
      if (storedEmpId) {
        try {
          const response = await fetch("http://localhost:3000/api/displayName", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emp_id: storedEmpId }),
          });

          const data = await response.json();

          if (response.ok && data.username) {
            setUsername(data.username);
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            localStorage.removeItem("emp_id");
          }
        } catch (error) {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    fetchUsername();
  }, [emp_id]);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
    document.body.classList.toggle("menu-open");
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
    document.body.classList.remove("menu-open");
  };

  const handleLogoutClick = () => {
    localStorage.removeItem("emp_id");
    setIsLoggedIn(false);
    setUsername("");
    router.push("/");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleProductionPlanning = () => {
    setProductionPlanningOpen(!productionPlanningOpen);
  };

  return (
    <nav className="nav">
      <div className="nav-content">
        <div className="menuLogo">
          <button className="menu-toggle" onClick={handleMenuToggle}>
            <i className="fas fa-bars"></i>
          </button>
          <h1 className="site-title">GTI</h1>
        </div>
        <ul className={`menu ${menuOpen ? "open" : "closed"}`}><br /><br /><br /><br />
          <li>
            <strong>
              <a href="/" style={{ textAlign: "left", fontSize:"18px" }}>Green Tech Industries</a>
            </strong>
          </li>
          <li onClick={toggleProductionPlanning} className={`menu-item ${productionPlanningOpen ? "active" : ""}`}>
            <div className="icon_submenu">
              <a>Production Planning</a>
              <i className={`icon fas ${productionPlanningOpen ? "fa-chevron-down" : "fa-chevron-right"}`}></i>
            </div>
            <ul className={`submenu ${productionPlanningOpen ? "open" : "closed"}`}>
              <li>
                <a href="/foundary_weekly_plan">Foundary Weekly Plan</a>
              </li>
              <li>
                <a href="/ProductMatrix">Product Matrix</a>
              </li>
            </ul>
          </li>
          <li className="access">
            <a href="/permissions">Permissions</a>
          </li>
        </ul>
        <div className="nav-right">
          {isLoggedIn ? (
            <div className="dropdown">
              <span className="username" onClick={toggleDropdown}>
                {username}
              </span>
              {dropdownOpen && (
                <div className="dropdown-menu animate-dropdown">
                  <button onClick={handleLogoutClick} className="logout-btn">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a className="login-btn" href="/">
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Nav;
