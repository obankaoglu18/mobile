import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input } from '../components/Input';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config/api';

export const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const [isSignUp, setIsSignUp] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        if (!email || !password || (isSignUp && !displayName)) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        if (isSignUp && password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const endpoint = isSignUp ? 'signup' : 'login';
            const response = await fetch(`${API_URL}/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isSignUp ? { email, password, displayName } : { email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Auth successful:', data.user);
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
                if (data.user && data.user.id) {
                    await AsyncStorage.setItem('userId', String(data.user.id));
                }
                Alert.alert('Success', isSignUp ? 'Account created!' : 'Welcome back!');
                navigation.replace('Map');
            } else {
                Alert.alert('Error', data.error || 'Authentication failed');
            }
        } catch (error) {
            console.error('Auth error:', error);
            Alert.alert('Error', 'Network or server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            {/* Decorative circles */}
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.logoContainer}>
                    <View style={styles.logoWrapper}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.appName}>kamu</Text>
                    <Text style={styles.tagline}>
                        🗺️ Discover Hidden Gems in Your City
                    </Text>
                </View>

                <View style={styles.formCard}>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleButton, !isSignUp && styles.toggleButtonActive]}
                            onPress={() => setIsSignUp(false)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.toggleText, !isSignUp && styles.toggleTextActive]}>
                                Sign In
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleButton, isSignUp && styles.toggleButtonActive]}
                            onPress={() => setIsSignUp(true)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.toggleText, isSignUp && styles.toggleTextActive]}>
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {isSignUp && (
                        <Input
                            label="Display Name"
                            placeholder="Your name"
                            value={displayName}
                            onChangeText={setDisplayName}
                            autoCapitalize="words"
                        />
                    )}

                    <Input
                        label="Email Address"
                        placeholder="you@example.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Input
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <TouchableOpacity
                        style={[styles.primaryButton, loading && styles.buttonDisabled]}
                        onPress={handleAuth}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.footerText}>
                        By continuing, you agree to our{"\n"}
                        <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    circle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: '#0F766E',
        opacity: 0.05,
    },
    circle1: {
        width: 300,
        height: 300,
        top: -100,
        right: -100,
    },
    circle2: {
        width: 200,
        height: 200,
        top: 150,
        left: -50,
    },
    circle3: {
        width: 150,
        height: 150,
        bottom: 100,
        right: 30,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingTop: 60,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoWrapper: {
        width: 110,
        height: 110,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0F766E',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 10,
        marginBottom: 24,
    },
    logo: {
        width: 90,
        height: 90,
    },
    appName: {
        fontSize: 48,
        fontWeight: '900',
        color: '#0F172A',
        letterSpacing: -2,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 17,
        color: '#475569',
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 24,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 5,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 14,
        padding: 5,
        marginBottom: 28,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 10,
    },
    toggleButtonActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#0F766E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    toggleText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#94A3B8',
    },
    toggleTextActive: {
        color: '#0F766E',
    },
    primaryButton: {
        backgroundColor: '#0F766E',
        borderRadius: 24,
        paddingVertical: 20,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        alignSelf: 'center',
        width: '100%',
        shadowColor: '#0F766E',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    footerText: {
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: 13,
        marginTop: 28,
        lineHeight: 20,
    },
    linkText: {
        color: '#0F766E',
        fontWeight: '600',
    },
});
