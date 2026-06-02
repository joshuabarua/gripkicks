import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { Text, Button, Input, Card } from '@/components/ui';
import { signIn, signUp } from '@/lib/auth';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        const result = await signIn.email({ email, password });
        if (result.error) {
          setError(result.error.message || 'Sign in failed');
        } else {
          router.back();
        }
      } else {
        const result = await signUp.email({ email, password, name });
        if (result.error) {
          setError(result.error.message || 'Sign up failed');
        } else {
          router.back();
        }
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const isValid = email && password && (mode === 'signin' || name);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.lg }}>
          <View style={{ gap: spacing.sm, alignItems: 'center' }}>
            <Text variant="3xl" weight="bold" color="accent">
              {mode === 'signin' ? 'Welcome back' : 'Join the crew'}
            </Text>
            <Text variant="base" color="secondary">
              {mode === 'signin'
                ? 'Sign in to your GripKicks account'
                : 'Create your GripKicks account'}
            </Text>
          </View>

          <Card style={{ padding: spacing.lg, gap: spacing.md }}>
            {mode === 'signup' && (
              <View style={{ gap: spacing.sm }}>
                <Text variant="sm" weight="medium">
                  Name
                </Text>
                <Input
                  placeholder="Your name"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View style={{ gap: spacing.sm }}>
              <Text variant="sm" weight="medium">
                Email
              </Text>
              <Input
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={{ gap: spacing.sm }}>
              <Text variant="sm" weight="medium">
                Password
              </Text>
              <Input
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {error ? (
              <Text variant="sm" color="destructive">
                {error}
              </Text>
            ) : null}

            <Button onPress={handleSubmit} disabled={loading || !isValid}>
              {loading
                ? mode === 'signin' ? 'Signing in...' : 'Signing up...'
                : mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </Button>

            <Button variant="ghost" onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}>
              <Text variant="sm" color="secondary">
                {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </Text>
            </Button>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
