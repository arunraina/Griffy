import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleRegister() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (!error) router.replace('/(tabs)/home');
  }

  return (
    <View>
      <Text>Register</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      <Button title="Create Account" onPress={handleRegister} />
    </View>
  );
}
