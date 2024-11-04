import React from 'react';
import './Navbar.css'; // Make sure this file has the appropriate styles

const Navbar: React.FC = () => {
    return (
        <div className="navbar">
            <div className="container">
                <div className="logo">
                    <i className="fas fa-hospital-symbol"></i> Med Reveal
                </div>
                <ul>
                    <li><a href="#">Home</a></li>
                    <li><a href="#">Services</a></li>
                    <li><a href="#">About</a></li>
                    <li><a href="#">Contact</a></li>
                </ul>
            </div>
        </div>
    );
};

export default Navbar;
