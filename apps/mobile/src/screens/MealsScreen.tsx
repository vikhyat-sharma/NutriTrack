import { useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useCreateMeal, useDeleteMeal, useMeals } from '../hooks/queries';

interface FoodItemForm {
  name: string;
  quantity: string;
  calories: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
  fiberG: string;
}

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;

export default function MealsScreen() {
  const today = new Date().toISOString().split('T')[0];
  const [mealType, setMealType] = useState<string>('BREAKFAST');
  const { data: meals = [], isLoading } = useMeals(today);
  const createMeal = useCreateMeal();
  const deleteMeal = useDeleteMeal();
  const { control, handleSubmit, reset } = useForm<FoodItemForm>({ defaultValues: { quantity: '1' } });

  const onSubmit = async (data: FoodItemForm) => {
    await createMeal.mutateAsync({
      date: today,
      type: mealType,
      items: [{
        name: data.name,
        quantity: parseFloat(data.quantity),
        calories: parseFloat(data.calories),
        proteinG: parseFloat(data.proteinG),
        carbsG: parseFloat(data.carbsG),
        fatG: parseFloat(data.fatG),
        fiberG: parseFloat(data.fiberG),
      }],
    });
    reset({ quantity: '1' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Log Meal</Text>

      <View style={styles.typeRow}>
        {MEAL_TYPES.map((t) => (
          <TouchableOpacity key={t} onPress={() => setMealType(t)} style={[styles.typeBtn, mealType === t && styles.activeType]}>
            <Text style={[styles.typeBtnText, mealType === t && styles.activeTypeText]}>
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.form}>
        <Controller control={control} name="name" rules={{ required: true }} render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Food name" onChangeText={onChange} value={value} />
        )} />
        <View style={styles.row}>
          {(['quantity', 'calories', 'proteinG', 'carbsG', 'fatG', 'fiberG'] as const).map((f) => (
            <Controller key={f} control={control} name={f} rules={{ required: true }} render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, styles.smallInput]} placeholder={f === 'quantity' ? 'Qty' : f.replace('G', ' g')} keyboardType="numeric" onChangeText={onChange} value={value} />
            )} />
          ))}
        </View>
        <TouchableOpacity style={styles.btn} onPress={handleSubmit(onSubmit)} disabled={createMeal.isPending}>
          {createMeal.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>+ Add Food</Text>}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Today's Meals</Text>
      {isLoading && <Text style={{ color: '#6b7280' }}>Loading…</Text>}
      {meals.map((meal: any) => (
        <View key={meal.id} style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealType}>{meal.type}</Text>
            <TouchableOpacity onPress={() => deleteMeal.mutate(meal.id)}>
              <Text style={styles.deleteBtn}>Delete</Text>
            </TouchableOpacity>
          </View>
          {meal.items?.map((item: any) => (
            <View key={item.id} style={styles.mealItem}>
              <Text style={{ fontSize: 14 }}>{item.foodItem?.name}</Text>
              <Text style={{ fontSize: 13, color: '#6b7280' }}>×{item.qty}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' },
  activeType: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  typeBtnText: { fontSize: 13, color: '#374151' },
  activeTypeText: { color: '#fff' },
  form: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 10, backgroundColor: '#fff' },
  smallInput: { flex: 1, minWidth: 70, marginBottom: 0 },
  btn: { backgroundColor: '#16a34a', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  mealCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  mealType: { fontWeight: '600', color: '#16a34a', fontSize: 13 },
  deleteBtn: { color: '#ef4444', fontSize: 13 },
  mealItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
});
