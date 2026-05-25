import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Sparkles, User, Briefcase, Mail, Key, UserCheck, ShieldCheck, Phone, MapPin, Building } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'WORKER' | 'EMPLOYER'>('WORKER');
  
  // Worker specific fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cnp, setCnp] = useState('');
  const [idSeries, setIdSeries] = useState('');
  
  // Employer specific fields
  const [companyName, setCompanyName] = useState('');
  const [cui, setCui] = useState('');
  const [address, setAddress] = useState('');
  
  // Location
  const [city, setCity] = useState('Timișoara');
  const [county, setCounty] = useState('Timiș');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setError(null);
    
    // Basic validation
    if (!email || !password || !city || !county) {
      setError('Vă rugăm să completați emailul, parola și locația.');
      return;
    }

    if (role === 'WORKER') {
      if (!fullName || !phone || !cnp || !idSeries) {
        setError('Te rugăm să completezi toate datele pentru conformitate ITM (Nume, Telefon, CNP, Serie CI).');
        return;
      }
      if (cnp.length !== 13) {
        setError('CNP-ul românesc trebuie să aibă exact 13 cifre.');
        return;
      }
    } else {
      if (!companyName || !cui || !address) {
        setError('Te rugăm să completezi Numele Companiei, CUI și Adresa.');
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Sign up the user in Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Eroare la crearea contului.');
        setLoading(false);
        return;
      }

      // 2. Insert into public 'users' table
      const { data: userRow, error: userInsertError } = await supabase
        .from('users')
        .insert({
          auth_id: authData.user.id,
          role: role,
        })
        .select('id')
        .single();

      if (userInsertError || !userRow) {
        setError(userInsertError?.message || 'Eroare la crearea înregistrării de utilizator.');
        setLoading(false);
        return;
      }

      // 3. Insert into respective profile table
      if (role === 'WORKER') {
        const { error: profileError } = await supabase.from('worker_profiles').insert({
          user_id: userRow.id,
          full_name: fullName,
          phone_number: phone,
          city,
          county,
          cnp,
          id_card_series: idSeries,
        });

        if (profileError) {
          setError(profileError.message);
          setLoading(false);
          return;
        }
      } else {
        const { error: profileError } = await supabase.from('employer_profiles').insert({
          user_id: userRow.id,
          company_name: companyName,
          cui,
          address,
          city,
          county,
        });

        if (profileError) {
          setError(profileError.message);
          setLoading(false);
          return;
        }
      }

      // Successful registration
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || 'A apărut o eroare neașteptată.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.glowCircle} />

        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Sparkles size={28} color="#e5c158" />
            <Text style={styles.logoText}>Gigtim</Text>
          </View>
          <Text style={styles.title}>Creează cont nou</Text>
          <Text style={styles.subtitle}>Alătură-te platformei de zilieri din Timișoara</Text>
        </View>

        <View style={styles.card}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Role Selection */}
          <Text style={styles.label}>TIPUL CONTULUI</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'WORKER' && styles.roleButtonActive]} 
              onPress={() => setRole('WORKER')}
            >
              <User size={18} color={role === 'WORKER' ? '#ffffff' : '#64748b'} />
              <Text style={[styles.roleButtonText, role === 'WORKER' && styles.roleButtonTextActive]}>Lucrător (Student)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'EMPLOYER' && styles.roleButtonActive]} 
              onPress={() => setRole('EMPLOYER')}
            >
              <Briefcase size={18} color={role === 'EMPLOYER' ? '#ffffff' : '#64748b'} />
              <Text style={[styles.roleButtonText, role === 'EMPLOYER' && styles.roleButtonTextActive]}>Angajator (Companie)</Text>
            </TouchableOpacity>
          </View>

          {/* Common Fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <View style={styles.inputWrapper}>
              <Mail size={16} color="#64748b" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="nume@exemplu.ro"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PAROLĂ</Text>
            <View style={styles.inputWrapper}>
              <Key size={16} color="#64748b" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="minim 6 caractere"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Worker Specific Fields */}
          {role === 'WORKER' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NUME COMPLET</Text>
                <View style={styles.inputWrapper}>
                  <UserCheck size={16} color="#64748b" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder="Popescu Ionuț"
                    placeholderTextColor="#94a3b8"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>TELEFON</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={16} color="#64748b" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder="07xx xxx xxx"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CNP (REGISTRUL ZILIERILOR ITM)</Text>
                <View style={styles.inputWrapper}>
                  <ShieldCheck size={16} color="#64748b" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder="13 cifre"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    maxLength={13}
                    value={cnp}
                    onChangeText={setCnp}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>SERIE ȘI NR. CI (BULETIN)</Text>
                <View style={styles.inputWrapper}>
                  <ShieldCheck size={16} color="#64748b" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder="Ex: TM 123456"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="characters"
                    value={idSeries}
                    onChangeText={setIdSeries}
                  />
                </View>
              </View>
            </>
          )}

          {/* Employer Specific Fields */}
          {role === 'EMPLOYER' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NUME COMPANIE</Text>
                <View style={styles.inputWrapper}>
                  <Building size={16} color="#64748b" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder="SC Restaurant SRL"
                    placeholderTextColor="#94a3b8"
                    value={companyName}
                    onChangeText={setCompanyName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CUI (COD FISCAL)</Text>
                <View style={styles.inputWrapper}>
                  <ShieldCheck size={16} color="#64748b" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder="Ex: RO12345678"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="characters"
                    value={cui}
                    onChangeText={setCui}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ADRESĂ SEDIU</Text>
                <View style={styles.inputWrapper}>
                  <MapPin size={16} color="#64748b" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder="Str. Victoriei, Nr. 1"
                    placeholderTextColor="#94a3b8"
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>
              </View>
            </>
          )}

          {/* Shared Location Fields */}
          <View style={styles.gridContainer}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>JUDEȚ</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input}
                  placeholder="Timiș"
                  placeholderTextColor="#94a3b8"
                  value={county}
                  onChangeText={setCounty}
                />
              </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>ORAȘ</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input}
                  placeholder="Timișoara"
                  placeholderTextColor="#94a3b8"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>ÎNREGISTRARE</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ai deja cont?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Conectează-te</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
  },
  glowCircle: {
    position: 'absolute',
    top: -30,
    left: -30,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0, 43, 127, 0.15)',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    height: 42,
  },
  roleButtonActive: {
    backgroundColor: '#002b7f',
    borderColor: '#002b7f',
  },
  roleButtonText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#ffffff',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 6,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13.5,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    backgroundColor: '#002b7f',
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#002b7f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    gap: 6,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  footerLink: {
    color: '#e5c158',
    fontSize: 14,
    fontWeight: '600',
  },
});
