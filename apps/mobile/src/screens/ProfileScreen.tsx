import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useUpdateProfile } from '../hooks/queries';

interface ProfileForm {
  name: string;
  age: string;
  gender: string;
  heightCm: string;
  weightKg: string;
  activityLevel: string;
  fitnessGoal: string;
  targetWeightKg: string;
}

const GENDERS = ['MALE', 'FEMALE', 'OTHER'];
const ACTIVITY_LEVELS = ['SEDENTARY', 'LIGHT_MODERATE', 'ACTIVE', 'VERY_ACTIVE'];
const GOALS = ['LOSE', 'MAINTAIN', 'GAIN'];

export default function ProfileScreen({ navigation }: any) {
  const updateProfile = useUpdateProfile();
  const { control, handleSubmit } = useForm<ProfileForm>({ defaultValues: { gender: 'MALE', activityLevel: 'ACTIVE', fitnessGoal: 'MAINTAIN' } });

  const onSubmit = async (data: ProfileForm) => {
    await updateProfile.mutateAsync({
      name: data.name,
      age: parseInt(data.age),
      gender: data.gender,
      heightCm: parseFloat(data.heightCm),
      weightKg: parseFloat(data.weightKg),
      activityLevel: data.activityLevel,
      fitnessGoal: data.fitnessGoal,
      targetWeightKg: data.targetWeightKg ? parseFloat(data.targetWeightKg) : undefined,
    });
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your Profile</Text>

      {[
        { name: 'name' as const, label: 'Name', placeholder: 'Your name' },
        { name: 'age' as const, label: 'Age', placeholder: 'Age', numeric: true },
        { name: 'heightCm' as const, label: 'Height (cm)', placeholder: '175', numeric: true },
        { name: 'weightKg' as const, label: 'Weight (kg)', placeholder: '75', numeric: true },
        { name: 'targetWeightKg' as const, label: 'Target Weight (kg, optional)', placeholder: 'Optional', numeric: true },
      ].map(({ name, label, placeholder, numeric }) => (
        <View key={name} style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <Controller control={control} name={name} render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder={placeholder} keyboardType={numeric ? 'numeric' : 'default'} onChangeText={onChange} value={value} />
          )} />
        </View>
      ))}

      <SegmentField control={control} name="gender" label="Gender" options={GENDERS} />
      <SegmentField control={control} name="activityLevel" label="Activity Level" options={ACTIVITY_LEVELS} />
      <SegmentField control={control} name="fitnessGoal" label="Fitness Goal" options={GOALS} />

      <TouchableOpacity style={styles.btn} onPress={handleSubmit(onSubmit)} disabled={updateProfile.isPending}>
        {updateProfile.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Profile</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function SegmentField({ control, name, label, options }: { control: any; name: any; label: string; options: string[] }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Controller control={control} name={name} render={({ field: { onChange, value } }) => (
        <View style={styles.segmentRow}>
          {options.map((opt) => (
            <TouchableOpacity key={opt} onPress={() => onChange(opt)} style={[styles.segment, value === opt && styles.activeSegment]}>
              <Text style={[styles.segmentText, value === opt && styles.activeSegmentText]}>
                {opt.charAt(0) + opt.slice(1).toLowerCase().replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, fontSize: 15 },
  segmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segment: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' },
  activeSegment: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  segmentText: { fontSize: 13, color: '#374151' },
  activeSegmentText: { color: '#fff' },
  btn: { backgroundColor: '#16a34a', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
