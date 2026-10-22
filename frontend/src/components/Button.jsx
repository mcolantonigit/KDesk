import '../styles/Button.css';

function Button({ children, type = 'button', variant = 'primary', size = 'md', className = '', ...props }) {
  const classes = ['btn', `btn-${variant}`, size !== 'md' && `btn-${size}`, className].filter(Boolean).join(' ');

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;
