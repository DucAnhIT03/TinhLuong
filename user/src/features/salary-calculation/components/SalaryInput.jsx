import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../../shared/utils/salary.utils.js';
import './SalaryInput.css';

const SalaryInput = ({ label, icon, placeholder, value, onChange, type = 'text' }) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (type === 'number' || placeholder === '(VNĐ)') {
      if (value) {
        const numValue = parseFloat(value) || 0;
        setDisplayValue(formatCurrency(numValue));
      } else {
        setDisplayValue('');
      }
    } else {
      setDisplayValue(value || '');
    }
  }, [value, type, placeholder]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    if (type === 'number' || placeholder === '(VNĐ)') {
      const rawValue = inputValue.replace(/[^\d]/g, '');
      onChange({ ...e, target: { ...e.target, value: rawValue } });
    } else {
      onChange(e);
    }
  };

  return (
    <div className="salary-input-container">
      <label className="salary-input-label">{label}</label>
      <div className="salary-input-wrapper">
        {icon && <span className="salary-input-icon">{icon}</span>}
        <input
          type="text"
          className="salary-input"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
        />
        {placeholder && <span className="salary-input-placeholder">{placeholder}</span>}
      </div>
    </div>
  );
};

export default SalaryInput;
