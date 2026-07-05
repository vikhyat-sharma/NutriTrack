import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDailySummary, useMe } from '../hooks/queries';

function MacroBar({ label, value, target, unit = 'g', color = '#22c55e' }: { label: string; value: number; target: number; unit?: string; color?: string }) {
  const pct = Math.min(100, target > 0 ? (value / target) * 100 : 0);
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 13, color: '#374151' }}>{label}</Text>
        <Text style={{ fontSize: 13, color: '#6b7280' }}>{Math.round(value)}{unit} / {Math.round(target)}{unit}</Text>
      </View>
      <View style={{ backgroundColor: '#e5e7eb', borderRadius: 6, height: 8 }}>
        <View style={{ width: `${pct}%`, backgroundColor: color, borderRadius: 6, height: 8 }} />
      </View>
    </View>
  );
}

export default function DashboardScreen({ navigation }: any) {
  const today = new Date().toISOString().split('T')[0];
  const { data: me } = useMe();
  const { data: summary, isLoading } = useDailySummary(today);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hello, {me?.profile?.name ?? 'there'} 👋</Text>
      <Text style={styles.date}>{today}</Text>

      {isLoading && <Text style={{ color: '#6b7280' }}>Loading…</Text>}

      {summary && (
        <>
          <View style={styles.calorieCard}>
            <Text style={styles.calorieValue}>{Math.round(summary.consumed?.calories ?? 0)}</Text>
            <Text style={styles.calorieLabel}>kcal consumed</Text>
            <Text style={styles.calorieRemaining}>{Math.round(summary.remainingCalories ?? 0)} kcal remaining</Text>
          </View>

          {summary.targets ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Macros</Text>
              <MacroBar label="Protein" value={summary.consumed?.proteinG ?? 0} target={summary.targets.proteinG} color="#3b82f6" />
              <MacroBar label="Carbs" value={summary.consumed?.carbsG ?? 0} target={summary.targets.carbsG} color="#f59e0b" />
              <MacroBar label="Fat" value={summary.consumed?.fatG ?? 0} target={summary.targets.fatG} color="#ef4444" />
              <MacroBar label="Fiber" value={summary.consumed?.fiberG ?? 0} target={summary.targets.fiberG} color="#8b5cf6" />
            </View>
          ) : (
            <TouchableOpacity style={styles.setupCard} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.setupText}>Set up your profile to see targets →</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  date: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  calorieCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  calorieValue: { fontSize: 56, fontWeight: '700', color: '#16a34a' },
  calorieLabel: { fontSize: 16, color: '#6b7280', marginTop: 4 },
  calorieRemaining: { fontSize: 14, color: '#374151', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 },
  setupCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  setupText: { color: '#16a34a', fontWeight: '600', fontSize: 15 },
});
