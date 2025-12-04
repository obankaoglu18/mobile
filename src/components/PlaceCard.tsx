import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface Place {
    id: string;
    name: string;
    category: string;
    rating?: number;
    imageUrl?: string;
    distance?: string; // e.g., "1.2 km"
}

interface PlaceCardProps {
    place: Place;
    onPress: () => void;
}

export const PlaceCard = ({ place, onPress }: PlaceCardProps) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            <Image
                source={{ uri: place.imageUrl || 'https://images.unsplash.com/photo-1519114097352-38159f912d6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
                style={styles.image}
            />
            <View style={styles.info}>
                <Text style={styles.category}>{place.category.toUpperCase()}</Text>
                <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
                <View style={styles.footer}>
                    {place.rating && (
                        <View style={styles.ratingContainer}>
                            <Text style={styles.star}>★</Text>
                            <Text style={styles.rating}>{place.rating.toFixed(1)}</Text>
                        </View>
                    )}
                    {place.distance && (
                        <Text style={styles.distance}>{place.distance}</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        alignItems: 'center',
    },
    image: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
    },
    info: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    category: {
        fontSize: 10,
        fontWeight: '700',
        color: '#0F766E',
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    star: {
        fontSize: 10,
        color: '#D97706',
        marginRight: 2,
    },
    rating: {
        fontSize: 12,
        fontWeight: '700',
        color: '#D97706',
    },
    distance: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
});
