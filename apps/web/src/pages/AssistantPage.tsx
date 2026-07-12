import { useState } from 'react';
import { useExplainNutrition, useMacroAdjustments, useMe } from '../hooks/queries';
import { useDailySummary } from '../hooks/queries';

export default function AssistantPage() {
  const today = new Date().toISOString().split('T')[0];
  const { data: me } = useMe();
  const { data: summary } = useDailySummary(today);
  const macroAdj = useMacroAdjustments();
  const explainNutrition = useExplainNutrition();
  const [advice, setAdvice] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<any>(null);

  const handleMacroAdvice = async () => {
    if (!summary?.consumed || !summary?.targets) return;
    const result = await macroAdj.mutateAsync({ consumed: summary.consumed, targets: summary.targets });
    setAdvice(typeof result === 'string' ? result : JSON.stringify(result));
  };

  const handleExplain = async () => {
    if (!summary?.consumed) return;
    const result = await explainNutrition.mutateAsync(summary.consumed);
    setExplanation(result);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>AI Nutrition Assistant</h2>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Today's Macro Advice</h3>
        <p style={styles.desc}>Get personalized advice based on what you've eaten today.</p>
        <button onClick={handleMacroAdvice} style={styles.btn} disabled={macroAdj.isPending || !summary?.consumed}>
          {macroAdj.isPending ? 'Thinking…' : 'Get Advice'}
        </button>
        {advice && <p style={styles.result}>{advice}</p>}
      </div>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Explain My Nutrition</h3>
        <p style={styles.desc}>Understand what your macros mean for your health and goals.</p>
        <button onClick={handleExplain} style={styles.btn} disabled={explainNutrition.isPending || !summary?.consumed}>
          {explainNutrition.isPending ? 'Thinking…' : 'Explain Nutrition'}
        </button>
        {explanation && (
          <div style={styles.result}>
            <p>{explanation.summary}</p>
            {explanation.values && (
              <ul style={{ marginTop: 8, paddingLeft: 16, fontSize: 13, color: '#374151' }}>
                <li>Calories: {Math.round(explanation.values.calories)} kcal</li>
                <li>Protein: {Math.round(explanation.values.proteinG)}g</li>
                <li>Carbs: {Math.round(explanation.values.carbsG)}g</li>
                <li>Fat: {Math.round(explanation.values.fatG)}g</li>
              </ul>
            )}
          </div>
        )}
      </div>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Profile</h3>
        {me?.profile ? (
          <ul style={{ fontSize: 14, color: '#374151', paddingLeft: 16 }}>
            <li>Name: {me.profile.name}</li>
            <li>Goal: {me.profile.fitnessGoal}</li>
            <li>Activity: {me.profile.activityLevel}</li>
          </ul>
        ) : (
          <p style={{ color: '#6b7280' }}>No profile set up yet.</p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 640, margin: '32px auto', padding: '0 16px', fontFamily: 'Inter, sans-serif' },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 20 },
  card: { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 6 },
  desc: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  btn: { padding: '10px 20px', borderRadius: 8, background: '#16a34a', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  result: { marginTop: 16, padding: 12, background: '#f0fdf4', borderRadius: 8, fontSize: 14, color: '#166534', lineHeight: 1.6 },
};
