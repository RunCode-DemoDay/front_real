import React from 'react';
import './FixedBottomButton.css';


const FixedBottomButton = ({ label, onClick, disabled = false, backgroundColor = '#FF004E' }) => {
  
  const finalBackgroundColor = disabled ? "#2C2C2C" : backgroundColor; 

  const buttonStyle = {
    backgroundColor: finalBackgroundColor,
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