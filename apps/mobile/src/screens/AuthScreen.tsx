import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useLogin, useRegister } from '../hooks/queries';
import type { AxiosError } from 'axios';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

interface FormValues {
  email: string;
  password: string;
}

function getErrorMessage(err: unknown, tab: 'login' | 'register'): string {
  const status = (err as AxiosError)?.response?.status;
  if (!status) return 'Network error. Check your connection.';
  if (status === 401) return 'Incorrect email or password.';
  if (status === 409) return 'An account with this email already exists.';
  if (status === 429) return 'Too many attempts. Please wait a minute.';
  return tab === 'login' ? 'Sign in failed.' : 'Registration failed.';
}

export default function AuthScreen({ navigation }: Props) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [serverError, setServerError] = useState<string | null>(null);
  const login = useLogin();
  const register = useRegister();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  const switchTab = (t: 'login' | 'register') => {
    setTab(t);
    reset();
    setServerError(null);
  };

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      if (tab === 'login') {
        await login.mutateAsync(data);
      } else {
        await register.mutateAsync(data);
      }
      navigation.replace('Main');
    } catch (err) {
      setServerError(getErrorMessage(err, tab));
    }
  };

  const isPending = login.isPending || register.isPending;

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>MacroWise</Text>

      <View style={styles.tabs} accessibilityRole="tablist">
        {(['login', 'register'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => switchTab(t)}
            style={[styles.tab, tab === t && styles.activeTab]}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
          >
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Controller
        control={control}
        name="email"
        rules={{ required: 'Email is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            onChangeText={onChange}
            value={value}
            accessibilityLabel="Email address"
          />
        )}
      />
      {errors.email && <Text style={styles.error} accessibilityRole="alert">{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        rules={{ required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Password"
            secureTextEntry
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            onChangeText={onChange}
            value={value}
            accessibilityLabel="Password"
          />
        )}
      />
      {errors.password && <Text style={styles.error} accessibilityRole="alert">{errors.password.message}</Text>}

      {serverError && (
        <View style={styles.serverErrorBox} accessibilityRole="alert">
          <Text style={styles.serverErrorText}>{serverError}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.btn, isPending && styles.btnDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
        accessibilityRole="button"
        accessibilityState={{ busy: isPending }}
      >
        {isPending
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>{tab === 'login' ? 'Sign In' : 'Create Account'}</Text>
        }
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
  inputError: { borderColor: '#ef4444' },
  btn: { backgroundColor: '#16a34a', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#ef4444', fontSize: 12, marginBottom: 8 },
  serverErrorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 8, padding: 12, marginBottom: 12 },
  serverErrorText: { color: '#b91c1c', fontSize: 13 },
});
