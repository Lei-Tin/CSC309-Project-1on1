import React from 'react';

const Footer = () => {
    const year = new Date().getFullYear();
    return (
        <footer className="text-center py-4">
            <p>&copy; {year} 1on1. All rights reserved.</p>
        </footer>
    )
}

export default Footer;