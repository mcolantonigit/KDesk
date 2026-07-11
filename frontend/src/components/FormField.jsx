import '../styles/FormField.css';

function FormField({ id, label, type = 'text', value, onChange, placeholder, required, options }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {options ? (
        <select id={id} value={value} onChange={onChange} required={required}>
          <option value="" disabled>
            Seleccionar...
          </option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.nombre}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
}

export default FormField;
