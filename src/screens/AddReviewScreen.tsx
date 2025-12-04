import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.103:3002';

export const AddReviewScreen = () => {
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { placeId, placeName } = route.params;

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Error', 'Please select a rating');
            return;
        }

        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'You must be logged in to review');
                return;
            }

            const reviewData = {
                placeId,
                rating,
                text,
                userId,
            };

            const response = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData),
            });

            if (response.ok) {
                Alert.alert('Success', 'Review added successfully!');
                navigation.goBack();
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.error || 'Failed to add review');
            }
        } catch (error) {
            console.error('Review submit error:', error);
            Alert.alert('Error', 'Failed to add review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Reviewing: {placeName}</Text>

            <Text style={styles.label}>Rating</Text>
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                        <Text style={[styles.star, star <= rating && styles.starActive]}>★</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Input
                label="Review"
                placeholder="Share your experience..."
                multiline
                numberOfLines={4}
                value={text}
                onChangeText={setText}
            />

            <Button
                title={loading ? "Submitting..." : "Submit Review"}
                onPress={handleSubmit}
                disabled={loading}
                style={styles.button}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 24,
        marginTop: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 8,
    },
    star: {
        fontSize: 40,
        color: '#CBD5E1',
    },
    starActive: {
        color: '#F59E0B',
    },
    button: {
        marginTop: 24,
    },
});
