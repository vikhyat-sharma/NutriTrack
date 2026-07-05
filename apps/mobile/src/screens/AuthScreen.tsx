import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useLogin, useRegister } from '../hooks/queries';

interface FormValues {
  email: string;
  password: string;
}

export default function AuthScreen({ navigation }: any) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const login = useLogin();
  const register = useRegister();
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    const mutation = tab === 'login' ? login : register;
    await mutation.mutateAsync(data);
    navigation.replace('Main');
  };

  const isPending = login.isPending || register.isPending;

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>MacroWise</Text>
      <View style={styles.tabs}>
        {(['login', 'register'] as const).map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.activeTab]}>
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Controller
        control={control}
        name="email"
        rules={{ required: 'Email required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" onChangeText={onChange} value={value} />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        rules={{ required: 'Password required', minLength: { value: 8, message: 'Min 8 chars' } }}
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={onChange} value={value} />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <TouchableOpacity style={styles.btn} onPress={handleSubmit(onSubmit)} disabled={isPending}>
        {isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{tab === 'login' ? 'Sign In' : 'Create Account'}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f9fafb' },
  logo: { fontSize: 32, fontWeight: '700', color: '#16a34a', textAlign: 'center', marginBottom: 32 },
  tabs: { flexDirection: 'row', marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#16a34a' },
  tabText: { fontSize: 15, color: '#6b7280' },
  activeTabText: { color: '#16a34a', fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 12 },
  btn: { backgroundColor: '#16a34a', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#ef4444', fontSize: 12, marginBottom: 8 },
});
