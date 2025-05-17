import { InputHTMLAttributes } from 'react';

interface FormCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  id: string;
  name?: string;
  label: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  value?: string | number | readonly string[];
  [key: string]: any;
}

export function FormCheckbox({
  id,
  name,
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  value,
  ...props
}: FormCheckboxProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        value={value}
        className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        {...props}
      />
      <label
        htmlFor={id}
        className={`ml-2 block text-sm text-gray-900 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {label}
      </label>
    </div>
  );
}
