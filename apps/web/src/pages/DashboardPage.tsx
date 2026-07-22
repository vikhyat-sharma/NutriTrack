import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDailySummary, useLogout, useMe } from '../hooks/queries';
import { MacroBar } from '../components/MacroBar';

function useTodayDate(): string {
  const [today, setToday] = useState(() => new Date().toISOString().split('T')[0]);
  useEffect(() => {
    const update = () => setToday(new Date().toISOString().split('T')[0]);
    window.addEventListener('focus', update);
    // Also update at midnight
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const timer = setTimeout(() => { update(); }, msUntilMidnight);
    return () => { window.removeEventListener('focus', update); clearTimeout(timer); };
  }, []);
  return today;
}

export default function DashboardPage() {
  const today = useTodayDate();
  const [date, setDate] = useState(today);
  const { data: me } = useMe();
  const { data: summary, isLoading } = useDailySummary(date);
  const logout = useLogout();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>MacroWise</h1>
        <nav style={styles.nav} aria-label="Main navigation">
          <Link to="/meals" style={styles.navLink}>Log Meal</Link>
          <Link to="/progress" style={styles.navLink}>Progress</Link>
          <Link to="/assistant" style={styles.navLink}>Assistant</Link>
          <Link to="/profile" style={styles.navLink}>Profile</Link>
          <button
            onClick={() => logout.mutate()}
            style={styles.logoutBtn}
            aria-label="Sign out"
          >
            Sign out
          </button>
        </nav>
      </header>

      <main style={styles.main}>
        <div style={styles.greeting}>
          <h2 style={{ margin: 0 }}>Hello, {me?.profile?.name ?? 'there'} 👋</h2>
          <label htmlFor="date-picker" style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12, color: '#6b7280' }}>
            Date
            <input
              id="date-picker"
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              style={styles.datePicker}
            />
          </label>
        </div>

        {isLoading && <p aria-live="polite">Loading…</p>}

        {summary && (
          <>
            <div style={styles.calorieCard} aria-label="Calorie summary">
              <div style={styles.calorieMain}>
                <span style={styles.calorieValue} aria-label={`${Math.round(summary.consumed?.calories ?? 0)} kilocalories consumed`}>
                  {Math.round(summary.consumed?.calories ?? 0)}
                </span>
                <span style={styles.calorieLabel} aria-hidden="true">kcal consumed</span>
              </div>
              <div style={styles.calorieSub}>
                <span>{Math.round(summary.remainingCalories ?? 0)} kcal remaining</span>
                <span>Target: {Math.round(summary.targets?.dailyCalories ?? 0)} kcal</span>
              </div>
            </div>

            {summary.targets ? (
              <section style={styles.macroCard} aria-label="Macro progress">
                <h3 style={styles.sectionTitle}>Macros</h3>
                <MacroBar label="Protein" value={summary.consumed?.proteinG ?? 0} target={summary.targets.proteinG} color="#3b82f6" />
                <MacroBar label="Carbs" value={summary.consumed?.carbsG ?? 0} target={summary.targets.carbsG} color="#f59e0b" />
                <MacroBar label="Fat" value={summary.consumed?.fatG ?? 0} target={summary.targets.fatG} color="#ef4444" />
                <MacroBar label="Fiber" value={summary.consumed?.fiberG ?? 0} target={summary.targets.fiberG} color="#8b5cf6" />
                <MacroBar label="Water" value={0} target={summary.targets.waterMl} unit="ml" color="#06b6d4" />
              </section>
            ) : (
              <div style={styles.setupPrompt}>
                <p>Complete your profile to see nutrition targets.</p>
                <Link to="/profile" style={styles.setupLink}>Set up profile →</Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', background: '#f9fafb', fontFamily: 'Inter, sans-serif' },
  header: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 },
  logo: { fontSize: 20, fontWeight: 700, color: '#16a34a', margin: 0 },
  nav: { display: 'flex', gap: 20, alignItems: 'center' },
  navLink: { color: '#374151', textDecoration: 'none', fontSize: 14, fontWeight: 500 },
  logoutBtn: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 14, fontWeight: 500 },
  main: { maxWidth: 640, margin: '32px auto', padding: '0 16px' },
  greeting: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  datePicker: { padding: '6px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 },
  calorieCard: { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  calorieMain: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 },
  calorieValue: { fontSize: 48, fontWeight: 700, color: '#16a34a' },
  calorieLabel: { fontSize: 16, color: '#6b7280' },
  calorieSub: { display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: 14 },
  macroCard: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#111827' },
  setupPrompt: { background: '#fff', borderRadius: 12, padding: 24, textAlign: 'center' },
  setupLink: { color: '#16a34a', fontWeight: 600, textDecoration: 'none' },
};
