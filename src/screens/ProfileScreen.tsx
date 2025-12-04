import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const API_URL = 'http://192.168.1.103:3002';

export const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                navigation.replace('Login');
                return;
            }

            const response = await fetch(`${API_URL}/auth/me`, {
                headers: { 'x-user-id': userId },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                Alert.alert('Error', 'Failed to fetch profile');
            }
        } catch (error) {
            console.error('Profile fetch error:', error);
            Alert.alert('Error', 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        navigation.replace('Login');
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'We need permission to access your photos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        setUploading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;

            const formData = new FormData();
            formData.append('photo', {
                uri,
                name: 'profile.jpg',
                type: 'image/jpeg',
            } as any);

            const uploadRes = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const { url } = await uploadRes.json();
            const fullUrl = `${API_URL}${url}`;

            const updateRes = await fetch(`${API_URL}/auth/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId,
                },
                body: JSON.stringify({ avatarUrl: fullUrl }),
            });

            if (updateRes.ok) {
                const updatedUser = await updateRes.json();
                setUser(updatedUser);
                Alert.alert('Success', 'Profile picture updated!');
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0F766E" />
            </View>
        );
    }

    if (!user) return null;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Profile Header */}
                <View style={styles.headerCard}>
                    <View style={styles.avatarContainer}>
                        {uploading ? (
                            <ActivityIndicator color="#0F766E" size="large" />
                        ) : (
                            <Image
                                source={{ uri: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=0F766E&color=fff&size=200` }}
                                style={styles.avatar}
                            />
                        )}
                        <TouchableOpacity style={styles.editAvatarButton} onPress={pickImage}>
                            <Text style={styles.editAvatarText}>📷</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.displayName}>{user.displayName}</Text>
                    <Text style={styles.email}>{user.email}</Text>
                    <View style={styles.locationContainer}>
                        <Text style={styles.locationText}>📍 {user.homeCity || 'Istanbul, TR'}</Text>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, styles.statCardOrange]}>
                        <Text style={styles.statValue}>{user.contributionPoints || 0}</Text>
                        <Text style={styles.statLabel}>Points</Text>
                    </View>
                    <View style={[styles.statCard, styles.statCardPurple]}>
                        <Text style={styles.statValue}>{user.trustScore?.toFixed(1) || '0.0'}</Text>
                        <Text style={styles.statLabel}>Trust Score</Text>
                    </View>
                </View>

                {/* Contributions Section */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>My Contributions</Text>
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>🗺️</Text>
                        <Text style={styles.emptyStateSubtext}>No contributions yet</Text>
                        <Text style={styles.emptyStateHint}>Start exploring and add places!</Text>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Text style={styles.logoutButtonText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: 20,
        paddingTop: 60,
    },
    headerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 5,
        marginBottom: 20,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFFFFF',
        shadowColor: '#0F766E',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#0F766E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    editAvatarText: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    displayName: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0F172A',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    email: {
        fontSize: 15,
        color: '#64748B',
        marginBottom: 12,
    },
    locationContainer: {
        backgroundColor: '#F1F5F9',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginTop: 8,
    },
    locationText: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    statCardOrange: {
        backgroundColor: '#F97316',
    },
    statCardPurple: {
        backgroundColor: '#8B5CF6',
    },
    statValue: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '600',
        opacity: 0.9,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 20,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyStateText: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyStateSubtext: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '600',
        marginBottom: 6,
    },
    emptyStateHint: {
        fontSize: 14,
        color: '#94A3B8',
    },
    logoutButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 40,
    },
    logoutButtonText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '700',
    },
});
