// Navbar.js

import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">Habit Tracker</Link>
            </div>
            <ul className="navbar-links">
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/logout">logout</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
