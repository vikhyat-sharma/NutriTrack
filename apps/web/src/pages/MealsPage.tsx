import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateMeal, useDeleteMeal, useMeals } from '../hooks/queries';

interface FoodItemForm {
  name: string;
  quantity: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;

export default function MealsPage() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [mealType, setMealType] = useState<string>('BREAKFAST');
  const { data: meals = [], isLoading } = useMeals(date);
  const createMeal = useCreateMeal();
  const deleteMeal = useDeleteMeal();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FoodItemForm>({ defaultValues: { quantity: 1 } });

  const onSubmit = async (data: FoodItemForm) => {
    await createMeal.mutateAsync({
      date,
      type: mealType,
      items: [{ ...data, quantity: Number(data.quantity), calories: Number(data.calories), proteinG: Number(data.proteinG), carbsG: Number(data.carbsG), fatG: Number(data.fatG), fiberG: Number(data.fiberG) }],
    });
    reset({ quantity: 1 });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Log Meal</h2>

      <div style={styles.controls}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={styles.input} />
        <div style={styles.typeRow}>
          {MEAL_TYPES.map((t) => (
            <button key={t} onClick={() => setMealType(t)} style={{ ...styles.typeBtn, ...(mealType === t ? styles.activeType : {}) }}>
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
        <input {...register('name', { required: true })} placeholder="Food name" style={styles.input} />
        <div style={styles.row}>
          <input {...register('quantity', { required: true, min: 0.1 })} type="number" step="0.1" placeholder="Qty" style={{ ...styles.input, width: 70 }} />
          <input {...register('calories', { required: true, min: 0 })} type="number" placeholder="kcal" style={{ ...styles.input, flex: 1 }} />
          <input {...register('proteinG', { required: true, min: 0 })} type="number" step="0.1" placeholder="Protein g" style={{ ...styles.input, flex: 1 }} />
          <input {...register('carbsG', { required: true, min: 0 })} type="number" step="0.1" placeholder="Carbs g" style={{ ...styles.input, flex: 1 }} />
          <input {...register('fatG', { required: true, min: 0 })} type="number" step="0.1" placeholder="Fat g" style={{ ...styles.input, flex: 1 }} />
          <input {...register('fiberG', { required: true, min: 0 })} type="number" step="0.1" placeholder="Fiber g" style={{ ...styles.input, flex: 1 }} />
        </div>
        {Object.keys(errors).length > 0 && <span style={styles.error}>All fields are required</span>}
        <button type="submit" style={styles.btn} disabled={createMeal.isPending}>
          {createMeal.isPending ? 'Adding…' : '+ Add Food'}
        </button>
      </form>

      <div style={styles.mealList}>
        <h3 style={styles.sectionTitle}>Meals on {date}</h3>
        {isLoading && <p>Loading…</p>}
        {meals.length === 0 && !isLoading && <p style={{ color: '#6b7280' }}>No meals logged yet.</p>}
        {meals.map((meal: any) => (
          <div key={meal.id} style={styles.mealCard}>
            <div style={styles.mealHeader}>
              <span style={styles.mealType}>{meal.type}</span>
              <button onClick={() => deleteMeal.mutate(meal.id)} style={styles.deleteBtn}>Delete</button>
            </div>
            {meal.items?.map((item: any) => (
              <div key={item.id} style={styles.mealItem}>
                <span>{item.foodItem?.name}</span>
                <span style={{ color: '#6b7280', fontSize: 13 }}>×{item.qty}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 640, margin: '32px auto', padding: '0 16px', fontFamily: 'Inter, sans-serif' },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 20 },
  controls: { marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 },
  typeRow: { display: 'flex', gap: 8 },
  typeBtn: { padding: '6px 14px', borderRadius: 20, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 13 },
  activeType: { background: '#16a34a', color: '#fff', borderColor: '#16a34a' },
  form: { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 10 },
  row: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  input: { padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 },
  btn: { padding: '10px', borderRadius: 8, background: '#16a34a', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  error: { color: '#ef4444', fontSize: 12 },
  mealList: {},
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 12 },
  mealCard: { background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  mealHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  mealType: { fontWeight: 600, color: '#16a34a', fontSize: 13 },
  deleteBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13 },
  mealItem: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px solid #f3f4f6', fontSize: 14 },
};
