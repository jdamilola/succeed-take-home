export interface FormTextareaProps {
  id: string;
  name: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}

export function FormTextarea({
  id,
  name,
  placeholder,
  value,
  onChange,
  rows = 3,
  disabled = false,
  className = '',
  ...props
}: FormTextareaProps) {
  return (
    <textarea
      id={id}
      name={name}
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${className} ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      }`}
      {...props}
    />
  );
}
