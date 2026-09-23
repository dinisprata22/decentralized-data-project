import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 

export default function UniversalBackButton() {
    const navigate = useNavigate();
    const location = useLocation(); 

    const isHomePage = location.pathname === '/';
  

    const goBack = () => {
        navigate(-1);
        
    };

    if (isHomePage) {
        return null;
    }

    return (
        <button 
            onClick={goBack} 
            className="universal-back-button"
            aria-label="Go back to the previous page"
        >
            ← Back
        </button>
    );
}