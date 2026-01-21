import React from 'react';
import './RadioGroup.css';

const RadioGroup = ({ label, options, value, onChange, name, horizontal = false }) => {
  return (
    <div className="radio-group-container">
      {label && <label className="radio-group-label">{label}</label>}
      <div className={`radio-group-options ${horizontal ? 'horizontal' : ''}`}>
        {options.map((option) => {
          const isChecked = value === option.value;
          return (
            <label 
              key={option.value} 
              className={`radio-option ${isChecked ? 'checked' : ''}`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isChecked}
                onChange={onChange}
              />
              <span className="radio-label">{option.label}</span>
              {option.input && (
                <div className="radio-input-wrapper">
                  <input
                    type="text"
                    className="radio-input"
                    placeholder={option.input.placeholder}
                    value={option.input.value || ''}
                    onChange={option.input.onChange}
                    disabled={!isChecked}
                  />
                  {option.input.placeholder && <span className="radio-input-suffix">{option.input.placeholder}</span>}
                </div>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default RadioGroup;
