import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useLogin, useRegister } from '../hooks/queries';

interface FormValues {
  email: string;
  password: string;
}

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const login = useLogin();
  const register = useRegister();
  const { register: field, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    const mutation = tab === 'login' ? login : register;
    await mutation.mutateAsync(data);
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.logo}>MacroWise</h1>
      <div style={styles.card}>
        <div style={styles.tabs}>
          {(['login', 'register'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ ...styles.tab, ...(tab === t ? styles.activeTab : {}) }}>
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <input
            {...field('email', { required: 'Email required' })}
            placeholder="Email"
            type="email"
            style={styles.input}
          />
          {errors.email && <span style={styles.error}>{errors.email.message}</span>}
          <input
            {...field('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 chars' } })}
            placeholder="Password"
            type="password"
            style={styles.input}
          />
          {errors.password && <span style={styles.error}>{errors.password.message}</span>}
          <button type="submit" style={styles.btn} disabled={login.isPending || register.isPending}>
            {login.isPending || register.isPending ? 'Loading…' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
          {(login.error || register.error) && (
            <span style={styles.error}>Invalid credentials. Please try again.</span>
          )}
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' },
  logo: { fontSize: 32, fontWeight: 700, color: '#16a34a', marginBottom: 24 },
  card: { background: '#fff', borderRadius: 12, padding: 32, width: 360, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
  tabs: { display: 'flex', marginBottom: 24, borderBottom: '1px solid #e5e7eb' },
  tab: { flex: 1, padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#6b7280' },
  activeTab: { color: '#16a34a', borderBottom: '2px solid #16a34a', fontWeight: 600 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15, outline: 'none' },
  btn: { padding: '12px', borderRadius: 8, background: '#16a34a', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  error: { color: '#ef4444', fontSize: 12 },
};
