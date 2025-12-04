import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import * as Location from 'expo-location';

const CATEGORIES = [
    { label: 'Select a category...', value: '' },
    { label: '🏖️ Beach', value: 'Beach' },
    { label: '☕ Café', value: 'Café' },
    { label: '🌳 Park', value: 'Park' },
    { label: '🏔️ Viewpoint', value: 'Viewpoint' },
    { label: '🍽️ Restaurant', value: 'Restaurant' },
    { label: '🎨 Art Gallery', value: 'Art Gallery' },
    { label: '🏛️ Museum', value: 'Museum' },
    { label: '🎭 Theater', value: 'Theater' },
    { label: '🛍️ Market', value: 'Market' },
];

export const AddPlaceScreen = ({ navigation, route }: any) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    const selectedLocation = route.params?.selectedLocation;

    const handleSubmit = async () => {
        if (!name || !category) {
            Alert.alert('Error', 'Name and Category are required');
            return;
        }

        setLoading(true);
        try {
            let lat, lng;

            if (selectedLocation) {
                lat = selectedLocation.lat;
                lng = selectedLocation.lng;
            } else {
                const location = await Location.getCurrentPositionAsync({});
                lat = location.coords.latitude;
                lng = location.coords.longitude;
            }

            const placeData = {
                name,
                description,
                category,
                tags,
                lat,
                lng,
                createdBy: 'user-1', // Using seeded user ID
            };

            // Use local IP for mobile device access
            const response = await fetch('http://192.168.1.103:3002/places', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(placeData),
            });

            if (!response.ok) {
                throw new Error('Failed to create place');
            }

            console.log('Place submitted successfully');
            Alert.alert('Success', 'Place added successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Error adding place:', error);
            Alert.alert('Error', 'Failed to add place');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.formCard}>
                <Text style={styles.sectionLabel}>Add a new place</Text>
                <Text style={styles.sectionTitle}>Share a hidden gem</Text>
                <Text style={styles.sectionSubtitle}>
                    Give it a name, vibe and tags so others can discover it.
                </Text>

                {selectedLocation ? (
                    <View style={[styles.locationCard, styles.locationCardSelected]}>
                        <Text style={styles.locationLabel}>📍 Using pinned location</Text>
                        <Text style={styles.locationCoords}>
                            {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                        </Text>
                    </View>
                ) : (
                    <View style={[styles.locationCard, styles.locationCardDefault]}>
                        <Text style={styles.locationLabel}>📍 Using current location</Text>
                        <Text style={styles.locationHint}>
                            Long‑press on the map to pin a custom spot.
                        </Text>
                    </View>
                )}

                <Input
                    label="Place name"
                    placeholder="e.g. Hidden Beach"
                    value={name}
                    onChangeText={setName}
                />

                <Input
                    label="Description"
                    placeholder="What makes this place special?"
                    multiline
                    numberOfLines={4}
                    value={description}
                    onChangeText={setDescription}
                />

                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.categoryLabel}>Category</Text>
                    <TouchableOpacity
                        style={styles.categoryPicker}
                        onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                    >
                        <Text style={category ? styles.categorySelectedText : styles.categoryPlaceholderText}>
                            {category || 'Select a category...'}
                        </Text>
                        <Text style={styles.categoryArrow}>▼</Text>
                    </TouchableOpacity>
                    
                    {showCategoryPicker && (
                        <View style={styles.categoryDropdown}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat.value}
                                    style={styles.categoryOption}
                                    onPress={() => {
                                        setCategory(cat.value);
                                        setShowCategoryPicker(false);
                                    }}
                                >
                                    <Text style={styles.categoryOptionText}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <Input
                    label="Tags"
                    placeholder="e.g. quiet, sunset, good coffee"
                    value={tags}
                    onChangeText={setTags}
                />

                <View style={styles.buttonRow}>
                    <Button
                        variant="secondary"
                        title="Cancel"
                        onPress={() => navigation.goBack()}
                        style={{ minWidth: 120 }}
                    />
                    <View style={styles.buttonSpacer} />
                    <Button
                        title={loading ? 'Saving…' : 'Save place'}
                        onPress={handleSubmit}
                        disabled={loading}
                        style={{ minWidth: 140 }}
                    />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 24,
        paddingBottom: 32,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 5,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F766E',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 20,
    },
    locationCard: {
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 20,
    },
    locationCardSelected: {
        backgroundColor: '#ECFEFF',
        borderWidth: 1,
        borderColor: '#22C55E',
    },
    locationCardDefault: {
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    locationLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0F172A',
    },
    locationCoords: {
        fontSize: 12,
        color: '#0F766E',
        marginTop: 2,
    },
    locationHint: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    buttonSpacer: {
        width: 16,
    },
    categoryLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    categoryPicker: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#0F766E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    categorySelectedText: {
        fontSize: 16,
        color: '#0F172A',
        fontWeight: '500',
    },
    categoryPlaceholderText: {
        fontSize: 16,
        color: '#94A3B8',
    },
    categoryArrow: {
        fontSize: 12,
        color: '#64748B',
    },
    categoryDropdown: {
        marginTop: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        maxHeight: 300,
    },
    categoryOption: {
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    categoryOptionText: {
        fontSize: 16,
        color: '#0F172A',
        fontWeight: '500',
    },
});
