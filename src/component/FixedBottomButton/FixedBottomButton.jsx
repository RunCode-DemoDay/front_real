import React from 'react';
import './FixedBottomButton.css';


const FixedBottomButton = ({ label, onClick, disabled = false, backgroundColor = '#FF004E' }) => {
  
  const finalBackgroundColor = disabled ? "#2C2C2C" : backgroundColor; 
   const finalTextColor = disabled ? "#B3B3B3" : "rgba(255, 255, 255, 0.88)";

  const buttonStyle = {
    backgroundColor: finalBackgroundColor,
    color: finalTextColor,
  };

  return (
    <div className="fixed-button-wrapper"> 
      <button 
        className="main-action-button"
        onClick={onClick}
        disabled={disabled}
        style={buttonStyle} 
      >
        <div className='button-text'>
          {label}
        </div>
        
      </button>
    </div>
  );
};

export default FixedBottomButton;