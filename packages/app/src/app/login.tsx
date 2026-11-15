import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { Button, Card, Input, Label, Text, Title } from '@/components/ui';
import { Rise } from '@/components/lab/Rise';
import { signIn, signUp } from '@/lib/auth';
import { posthog } from '@/lib/posthog';
import { posthogLogger } from '@/lib/posthog-logger';
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
          posthog?.capture('user_signed_in');
          posthogLogger.authenticationCompleted('sign_in');
          router.back();
        }
      } else {
        const result = await signUp.email({ email, password, name });
        if (result.error) {
          setError(result.error.message || 'Sign up failed');
        } else {
          posthog?.capture('user_signed_up');
          posthogLogger.authenticationCompleted('sign_up');
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
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', padding: spacing.md, gap: spacing.lg }}>
          <Rise>
            <Title variant="4xl">{mode === 'signin' ? 'Sign in' : 'Sign up'}</Title>
          </Rise>

          <Rise index={1}>
            <Card style={{ padding: spacing.lg, gap: spacing.md }}>
              {mode === 'signup' && (
                <View style={{ gap: spacing.sm }}>
                  <Label>Name</Label>
                  <Input placeholder="Your name" autoCapitalize="words" autoComplete="name" textContentType="name" value={name} onChangeText={setName} />
                </View>
              )}

              <View style={{ gap: spacing.sm }}>
                <Label>Email</Label>
                <Input
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={{ gap: spacing.sm }}>
                <Label>Password</Label>
                <Input
                  placeholder="••••••••"
                  secureTextEntry
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  textContentType={mode === 'signin' ? 'password' : 'newPassword'}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {error ? (
                <View accessibilityRole="alert" style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center', borderLeftWidth: 2, borderLeftColor: colors.brand.red, paddingLeft: spacing.sm }}>
                  <Text variant="sm">{error}</Text>
                </View>
              ) : null}

              <Button onPress={handleSubmit} disabled={!isValid} loading={loading}>
                {mode === 'signin' ? 'Sign in' : 'Sign up'}
              </Button>
            </Card>
          </Rise>

          <Rise index={2}>
            <Button variant="ghost" onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}>
              {mode === 'signin' ? 'Create an account' : 'I have an account'}
            </Button>
          </Rise>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
