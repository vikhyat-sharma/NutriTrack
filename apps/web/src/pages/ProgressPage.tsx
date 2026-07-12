import { useMonthlySummary, useWeeklySummary } from '../hooks/queries';
import { MacroBar } from '../components/MacroBar';

export default function ProgressPage() {
  const { data: weekly, isLoading: wLoading } = useWeeklySummary();
  const { data: monthly, isLoading: mLoading } = useMonthlySummary();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Progress</h2>

      <Section title="This Week" loading={wLoading} data={weekly} />
      <Section title="This Month" loading={mLoading} data={monthly} />
    </div>
  );
}

function Section({ title, loading, data }: { title: string; loading: boolean; data: any }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {loading && <p>Loading…</p>}
      {data && (
        <>
          <p style={styles.meta}>{data.startDate} → {data.endDate} · {data.mealCount} meals logged</p>
          {data.targets ? (
            <>
              <MacroBar label="Calories" value={data.totals?.calories ?? 0} target={(data.targets.dailyCalories ?? 0) * (title === 'This Week' ? 7 : 30)} unit="kcal" color="#16a34a" />
              <MacroBar label="Protein" value={data.totals?.proteinG ?? 0} target={(data.targets.proteinG ?? 0) * (title === 'This Week' ? 7 : 30)} color="#3b82f6" />
              <MacroBar label="Carbs" value={data.totals?.carbsG ?? 0} target={(data.targets.carbsG ?? 0) * (title === 'This Week' ? 7 : 30)} color="#f59e0b" />
              <MacroBar label="Fat" value={data.totals?.fatG ?? 0} target={(data.targets.fatG ?? 0) * (title === 'This Week' ? 7 : 30)} color="#ef4444" />
            </>
          ) : (
            <p style={{ color: '#6b7280' }}>Set up your profile to see targets.</p>
          )}
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 640, margin: '32px auto', padding: '0 16px', fontFamily: 'Inter, sans-serif' },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 20 },
  card: { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 8 },
  meta: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
};
