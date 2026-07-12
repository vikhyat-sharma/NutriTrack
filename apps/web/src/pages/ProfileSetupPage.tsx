import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useUpdateProfile } from '../hooks/queries';

interface ProfileForm {
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  heightCm: number;
  weightKg: number;
  activityLevel: 'SEDENTARY' | 'LIGHT_MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
  fitnessGoal: 'LOSE' | 'MAINTAIN' | 'GAIN';
  targetWeightKg?: number;
}

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>();

  const onSubmit = async (data: ProfileForm) => {
    await updateProfile.mutateAsync({ ...data, age: Number(data.age), heightCm: Number(data.heightCm), weightKg: Number(data.weightKg), targetWeightKg: data.targetWeightKg ? Number(data.targetWeightKg) : undefined });
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Set Up Your Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
        <Field label="Name" error={errors.name?.message}>
          <input {...register('name', { required: 'Required' })} style={styles.input} placeholder="Your name" />
        </Field>
        <div style={styles.row}>
          <Field label="Age" error={errors.age?.message}>
            <input {...register('age', { required: 'Required', min: 1 })} type="number" style={styles.input} />
          </Field>
          <Field label="Gender" error={errors.gender?.message}>
            <select {...register('gender', { required: 'Required' })} style={styles.input}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </Field>
        </div>
        <div style={styles.row}>
          <Field label="Height (cm)" error={errors.heightCm?.message}>
            <input {...register('heightCm', { required: 'Required', min: 1 })} type="number" style={styles.input} />
          </Field>
          <Field label="Weight (kg)" error={errors.weightKg?.message}>
            <input {...register('weightKg', { required: 'Required', min: 1 })} type="number" style={styles.input} />
          </Field>
        </div>
        <Field label="Activity Level" error={errors.activityLevel?.message}>
          <select {...register('activityLevel', { required: 'Required' })} style={styles.input}>
            <option value="SEDENTARY">Sedentary</option>
            <option value="LIGHT_MODERATE">Light / Moderate</option>
            <option value="ACTIVE">Active</option>
            <option value="VERY_ACTIVE">Very Active</option>
          </select>
        </Field>
        <Field label="Fitness Goal" error={errors.fitnessGoal?.message}>
          <select {...register('fitnessGoal', { required: 'Required' })} style={styles.input}>
            <option value="LOSE">Lose Weight</option>
            <option value="MAINTAIN">Maintain</option>
            <option value="GAIN">Gain Muscle</option>
          </select>
        </Field>
        <Field label="Target Weight (kg, optional)">
          <input {...register('targetWeightKg')} type="number" style={styles.input} placeholder="Optional" />
        </Field>
        <button type="submit" style={styles.btn} disabled={updateProfile.isPending}>
          {updateProfile.isPending ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</label>
      {children}
      {error && <span style={{ color: '#ef4444', fontSize: 12 }}>{error}</span>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 520, margin: '40px auto', padding: '0 16px' },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#111827' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'flex', gap: 12 },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15, width: '100%', boxSizing: 'border-box' },
  btn: { padding: 12, borderRadius: 8, background: '#16a34a', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
};
