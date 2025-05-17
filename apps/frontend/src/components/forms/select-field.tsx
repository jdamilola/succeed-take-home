import { SelectHTMLAttributes } from 'react';

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  id: string;
  name: string;
  options: FormSelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}

export function FormSelect({
  id,
  name,
  options,
  placeholder,
  value,
  onChange,
  disabled = false,
  className = '',
  ...props
}: FormSelectProps) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${className} ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      }`}
      {...props}
    >
      {placeholder && (
        <option value="">{placeholder}</option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
