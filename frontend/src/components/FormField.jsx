import '../styles/FormField.css';
import Selector from './Selector';

function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  options,
  rows = 5,
  maxLength,
  className,
}) {
  return (
    <div className={className ? `form-field ${className}` : 'form-field'}>
      <label htmlFor={id}>{label}</label>
      {options ? (
        <Selector id={id} aria-label={label} value={value} onChange={onChange} required={required}>
          <option value="" disabled>
            Seleccionar...
          </option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.nombre}
            </option>
          ))}
        </Selector>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          maxLength={maxLength}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
        />
      )}
    </div>
  );
}

export default FormField;
