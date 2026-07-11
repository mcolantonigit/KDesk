import '../styles/AuthLayout.css';

function AuthLayout({ title, onSubmit, children }) {
  return (
    <div className="auth-bg">
      <form className="auth-card" onSubmit={onSubmit}>
        <img src="/logo_kdesk.svg" alt="KDesk" className="auth-logo" />
        <h1>{title}</h1>
        {children}
      </form>
    </div>
  );
}

export default AuthLayout;
