import { HTMLInputTypeAttribute } from 'react';

interface FormInputProps {
  id: string;
  name: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
  [key: string]: any;
}

export function FormInput({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  autoComplete,
  className = '',
  ...props
}: FormInputProps) {

  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      autoComplete={autoComplete}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${className} ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      }`}
      {...props}
    />
  );
}
