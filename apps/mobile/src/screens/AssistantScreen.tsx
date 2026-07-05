import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDailySummary, useMacroAdjustments } from '../hooks/queries';

export default function AssistantScreen() {
  const today = new Date().toISOString().split('T')[0];
  const { data: summary } = useDailySummary(today);
  const macroAdj = useMacroAdjustments();
  const [advice, setAdvice] = useState<string | null>(null);

  const handleAdvice = async () => {
    if (!summary?.consumed || !summary?.targets) return;
    const result = await macroAdj.mutateAsync({ consumed: summary.consumed, targets: summary.targets });
    setAdvice(typeof result === 'string' ? result : JSON.stringify(result));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AI Assistant</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Macro Advice</Text>
        <Text style={styles.desc}>Get personalized advice based on what you've eaten today.</Text>
        <TouchableOpacity style={styles.btn} onPress={handleAdvice} disabled={macroAdj.isPending || !summary?.consumed}>
          {macroAdj.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Get Advice</Text>}
        </TouchableOpacity>
        {advice && <View style={styles.result}><Text style={styles.resultText}>{advice}</Text></View>}
      </View>

      {summary?.targets && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Targets</Text>
          {[
            { label: 'Calories', value: `${Math.round(summary.targets.dailyCalories)} kcal` },
            { label: 'Protein', value: `${Math.round(summary.targets.proteinG)}g` },
            { label: 'Carbs', value: `${Math.round(summary.targets.carbsG)}g` },
            { label: 'Fat', value: `${Math.round(summary.targets.fatG)}g` },
            { label: 'Water', value: `${Math.round(summary.targets.waterMl)}ml` },
          ].map(({ label, value }) => (
            <View key={label} style={styles.row}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={styles.rowValue}>{value}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  desc: { fontSize: 14, color: '#6b7280', marginBottom: 14 },
  btn: { backgroundColor: '#16a34a', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  result: { marginTop: 14, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 10 },
  resultText: { color: '#166534', fontSize: 14, lineHeight: 22 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  rowLabel: { fontSize: 14, color: '#374151' },
  rowValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
});
