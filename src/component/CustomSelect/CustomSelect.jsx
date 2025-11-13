import React, { useState, useCallback, useRef, useEffect } from 'react';
import './CustomSelect.css'; // 별도 CSS 파일을 준비합니다.

const CustomSelect = ({ options, value, onChange, placeholder = "최신 순" }) => {
    // 1. 상태 관리
    const [isOpen, setIsOpen] = useState(false); // 드롭다운 목록이 열렸는지 여부
    const [selectedValue, setSelectedValue] = useState(value); // 현재 선택된 값

    const wrapperRef = useRef(null); // 외부 클릭 감지를 위한 ref

    // 2. 현재 선택된 옵션의 텍스트 찾기
    const selectedOption = options.find(option => option.value === selectedValue);
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    // 3. 드롭다운 토글 함수
    const toggleDropdown = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    // 4. 옵션 선택 핸들러
    const handleOptionClick = (optionValue) => {
        setSelectedValue(optionValue);
        setIsOpen(false); // 선택 후 닫기
        
        // 부모 컴포넌트에 변경된 값 전달
        if (onChange) {
            onChange(optionValue);
        }
    };

    // 5. 외부 클릭 감지 (드롭다운 외부를 클릭하면 닫히도록)
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
    
    // 외부에서 props.value가 변경될 경우 내부 상태 업데이트
    useEffect(() => {
        setSelectedValue(value);
    }, [value]);

    return (
        // 전체 컴포넌트 래퍼: 외부 클릭 감지 및 상대 위치 지정을 위해 사용
        <div 
            className="custom-select-wrapper" 
            ref={wrapperRef}
        >
            {/* 1. 버튼 영역 (클릭 시 드롭다운 목록 토글) */}
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
                {/* 커스텀 화살표 아이콘 영역: 'open' 클래스만으로 회전 제어 */}
                <span className={`custom-select-arrow ${isOpen ? 'open' : ''}`}></span> 
            </div>

            {/* 2. 드롭다운 목록 영역 (디자인 커스터마이징 핵심) */}
            {isOpen && (
                <ul 
                    className="custom-select-options"
                    role="listbox"
                >
                    {options.map((option, index, arr) => (
                        // ✨ React.Fragment를 사용하여 li와 구분선 div를 묶습니다.
                        <React.Fragment key={option.value}> 
                            <li
                                className={`custom-select-option ${option.value === selectedValue ? 'selected' : ''}`}
                                onClick={() => handleOptionClick(option.value)}
                                role="option"
                                aria-selected={option.value === selectedValue}
                            >
                                {option.label}
                            </li>
                            
                            {/* ✨ 마지막 항목이 아닐 때만 얇은 구분선 <div> 렌더링 */}
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