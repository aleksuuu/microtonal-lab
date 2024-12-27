import { NavLink } from "react-router-dom";
import "./index.scss";
import icon from "../../assets/navbar-icon.svg";
import { useState } from "react";

const NavBar = () => {
  const [checked, setChecked] = useState(false);

  return (
    <nav>
      <input type="checkbox" id="nav-check" checked={checked} readOnly></input>
      <header>
        <NavLink to="/" onClick={() => setChecked(false)}>
          <h1 className="nav-title">Microtonal Lab</h1>
        </NavLink>
      </header>
      <div className="nav-btn">
        <label htmlFor="nav-check">
          <img
            src={icon}
            alt="navigation bar icon; click to expand"
            onClick={() => setChecked(!checked)}
          />
        </label>
      </div>

      <p className="nav-links">
        <NavLink to="/" onClick={() => setChecked(false)}>
          Home
        </NavLink>
        <NavLink to="/interval" onClick={() => setChecked(false)}>
          Interval
        </NavLink>
        <NavLink to="/freq-to-midi" onClick={() => setChecked(false)}>
          Frequency to MIDI
        </NavLink>
        <NavLink to="/utility-tools" onClick={() => setChecked(false)}>
          Utility Tools
        </NavLink>
      </p>
    </nav>
  );
};

export default NavBar;
