import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useLogin, useRegister } from '../hooks/queries';
import type { AxiosError } from 'axios';

interface FormValues {
  email: string;
  password: string;
}

function getErrorMessage(err: unknown, tab: 'login' | 'register'): string {
  const status = (err as AxiosError)?.response?.status;
  if (!status) return 'Network error. Please check your connection.';
  if (status === 401) return 'Incorrect email or password.';
  if (status === 409) return 'An account with this email already exists.';
  if (status === 429) return 'Too many attempts. Please wait a minute.';
  if (status >= 500) return 'Server error. Please try again shortly.';
  return tab === 'login' ? 'Sign in failed.' : 'Registration failed.';
}

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();
  const login = useLogin();
  const register = useRegister();

  const { register: field, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  // Reset form and clear errors when switching tabs
  useEffect(() => {
    reset();
    setServerError(null);
  }, [tab, reset]);

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      if (tab === 'login') {
        await login.mutateAsync(data);
      } else {
        await register.mutateAsync(data);
      }
      navigate('/dashboard');
    } catch (err) {
      setServerError(getErrorMessage(err, tab));
    }
  };

  const isPending = login.isPending || register.isPending;

  return (
    <div style={styles.container}>
      <h1 style={styles.logo}>MacroWise</h1>
      <div style={styles.card}>
        <div style={styles.tabs} role="tablist">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              style={{ ...styles.tab, ...(tab === t ? styles.activeTab : {}) }}
            >
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form} noValidate>
          <div style={styles.fieldGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              {...field('email', { required: 'Email is required' })}
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              style={styles.input}
            />
            {errors.email && (
              <span id="email-error" role="alert" style={styles.error}>{errors.email.message}</span>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              {...field('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
              })}
              type="password"
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              style={styles.input}
            />
            {errors.password && (
              <span id="password-error" role="alert" style={styles.error}>{errors.password.message}</span>
            )}
          </div>

          {serverError && (
            <div role="alert" aria-live="assertive" style={styles.serverError}>{serverError}</div>
          )}

          <button type="submit" style={styles.btn} disabled={isPending} aria-busy={isPending}>
            {isPending ? 'Loading…' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
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
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 13, fontWeight: 500, color: '#374151' },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15 },
  btn: { padding: '12px', borderRadius: 8, background: '#16a34a', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
  error: { color: '#ef4444', fontSize: 12 },
  serverError: { padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: 13 },
};
