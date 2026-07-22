import { useRef, useState } from 'react';
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

const FIELDS: Array<{ key: keyof FoodItemForm; label: string; placeholder: string; step?: string }> = [
  { key: 'quantity', label: 'Qty', placeholder: '1', step: '0.1' },
  { key: 'calories', label: 'Calories (kcal)', placeholder: '0' },
  { key: 'proteinG', label: 'Protein (g)', placeholder: '0', step: '0.1' },
  { key: 'carbsG', label: 'Carbs (g)', placeholder: '0', step: '0.1' },
  { key: 'fatG', label: 'Fat (g)', placeholder: '0', step: '0.1' },
  { key: 'fiberG', label: 'Fiber (g)', placeholder: '0', step: '0.1' },
];

export default function MealsPage() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [mealType, setMealType] = useState<string>('BREAKFAST');
  const { data: meals = [], isLoading } = useMeals(date);
  const createMeal = useCreateMeal();
  const deleteMeal = useDeleteMeal();
  const submittingRef = useRef(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FoodItemForm>({
    defaultValues: { quantity: 1 },
  });

  const onSubmit = async (data: FoodItemForm) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      await createMeal.mutateAsync({
        date,
        type: mealType,
        items: [{
          name: data.name,
          quantity: Number(data.quantity),
          calories: Number(data.calories),
          proteinG: Number(data.proteinG),
          carbsG: Number(data.carbsG),
          fatG: Number(data.fatG),
          fiberG: Number(data.fiberG),
        }],
      });
      reset({ quantity: 1 });
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Log Meal</h2>

      <div style={styles.controls}>
        <label htmlFor="meal-date" style={styles.label}>
          Date
          <input
            id="meal-date"
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            style={styles.input}
          />
        </label>

        <div role="group" aria-label="Meal type" style={styles.typeRow}>
          {MEAL_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={mealType === t}
              onClick={() => setMealType(t)}
              style={{ ...styles.typeBtn, ...(mealType === t ? styles.activeType : {}) }}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={styles.form} noValidate aria-label="Add food item">
        <div style={styles.fieldGroup}>
          <label htmlFor="food-name" style={styles.label}>Food name</label>
          <input
            id="food-name"
            {...register('name', { required: 'Food name is required' })}
            style={styles.input}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && <span id="name-error" role="alert" style={styles.error}>{errors.name.message}</span>}
        </div>

        <div style={styles.row}>
          {FIELDS.map(({ key, label, placeholder, step }) => (
            <div key={key} style={styles.fieldGroup}>
              <label htmlFor={`field-${key}`} style={styles.label}>{label}</label>
              <input
                id={`field-${key}`}
                {...register(key, { required: true, min: 0 })}
                type="number"
                step={step ?? '1'}
                placeholder={placeholder}
                style={{ ...styles.input, width: 80 }}
                aria-invalid={!!errors[key]}
              />
            </div>
          ))}
        </div>

        {Object.keys(errors).length > 0 && (
          <span role="alert" aria-live="polite" style={styles.error}>Please fill in all required fields.</span>
        )}

        <button type="submit" style={styles.btn} disabled={createMeal.isPending} aria-busy={createMeal.isPending}>
          {createMeal.isPending ? 'Adding…' : '+ Add Food'}
        </button>
      </form>

      <section aria-label={`Meals on ${date}`}>
        <h3 style={styles.sectionTitle}>Meals on {date}</h3>
        {isLoading && <p aria-live="polite">Loading…</p>}
        {!isLoading && meals.length === 0 && <p style={{ color: '#6b7280' }}>No meals logged yet.</p>}
        {(meals as any[]).map((meal) => (
          <article key={meal.id} style={styles.mealCard} aria-label={`${meal.type} meal`}>
            <div style={styles.mealHeader}>
              <span style={styles.mealType}>{meal.type}</span>
              <button
                onClick={() => deleteMeal.mutate(meal.id)}
                style={styles.deleteBtn}
                aria-label={`Delete ${meal.type} meal`}
              >
                Delete
              </button>
            </div>
            {meal.items?.map((item: any) => (
              <div key={item.id} style={styles.mealItem}>
                <span>{item.foodItem?.name}</span>
                <span style={{ color: '#6b7280', fontSize: 13 }}>×{item.qty}</span>
              </div>
            ))}
          </article>
        ))}
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 640, margin: '32px auto', padding: '0 16px', fontFamily: 'Inter, sans-serif' },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 20 },
  controls: { marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 },
  typeRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  typeBtn: { padding: '6px 14px', borderRadius: 20, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 13 },
  activeType: { background: '#16a34a', color: '#fff', borderColor: '#16a34a' },
  form: { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 12 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  row: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  label: { fontSize: 12, fontWeight: 500, color: '#374151' },
  input: { padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 },
  btn: { padding: '10px', borderRadius: 8, background: '#16a34a', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  error: { color: '#ef4444', fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 12 },
  mealCard: { background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  mealHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  mealType: { fontWeight: 600, color: '#16a34a', fontSize: 13 },
  deleteBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13 },
  mealItem: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px solid #f3f4f6', fontSize: 14 },
};
