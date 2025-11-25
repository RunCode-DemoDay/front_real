import React, { useState, useCallback, useRef, useEffect } from 'react';
import './CustomSelect.css'; 

const CustomSelect = ({ options, value, onChange, placeholder = "최신 순" }) => {
    
    const [isOpen, setIsOpen] = useState(false); 
    const [selectedValue, setSelectedValue] = useState(value); 

    const wrapperRef = useRef(null); 

 
    const selectedOption = options.find(option => option.value === selectedValue);
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

   
    const toggleDropdown = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

   
    const handleOptionClick = (optionValue) => {
        setSelectedValue(optionValue);
        setIsOpen(false); // 선택 후 닫기
        
       
        if (onChange) {
            onChange(optionValue);
        }
    };

    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    
    useEffect(() => {
        setSelectedValue(value);
    }, [value]);

    return (
        
        <div 
            className="custom-select-wrapper" 
            ref={wrapperRef}
        >
           
            <div 
                className={`custom-select-display ${isOpen ? 'open' : ''}`}
                onClick={toggleDropdown}
                tabIndex="0" // 키보드 접근성 확보
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className={!selectedOption ? 'placeholder' : ''}>
                    {displayLabel}
                </span>
               
                <span className={`custom-select-arrow ${isOpen ? 'open' : ''}`}></span> 
            </div>

          
            {isOpen && (
                <ul 
                    className="custom-select-options"
                    role="listbox"
                >
                    {options.map((option, index, arr) => (
                       
                        <React.Fragment key={option.value}> 
                            <li
                                className={`custom-select-option ${option.value === selectedValue ? 'selected' : ''}`}
                                onClick={() => handleOptionClick(option.value)}
                                role="option"
                                aria-selected={option.value === selectedValue}
                            >
                                {option.label}
                            </li>
                            
                         
                            {index < arr.length - 1 && (
                                <div className="custom-option-separator thin-line"></div>
                            )}
                        </React.Fragment>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomSelect;