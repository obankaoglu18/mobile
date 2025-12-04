import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { CategoryFilter } from './CategoryFilter';
import { PlaceCard } from './PlaceCard';

const { width } = Dimensions.get('window');

interface MapBottomSheetProps {
    places: any[];
    onPlaceSelect: (place: any) => void;
    selectedCategory: string | null;
    onCategorySelect: (category: string | null) => void;
    onChange?: (index: number) => void;
    bookmarks: any[];
}

const CATEGORIES = ['Park', 'Cafe', 'Library', 'Museum', 'Plaza'];

export const MapBottomSheet = ({ places, onPlaceSelect, selectedCategory, onCategorySelect, onChange, bookmarks }: MapBottomSheetProps) => {
    // ref
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [showBookmarks, setShowBookmarks] = useState(false);

    // variables
    const snapPoints = useMemo(() => ['15%', '45%', '90%'], []);

    // Filter places
    const filteredPlaces = useMemo(() => {
        if (showBookmarks) return bookmarks;
        if (!selectedCategory) return places;
        return places.filter(p => p.category === selectedCategory);
    }, [places, selectedCategory, showBookmarks, bookmarks]);

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={1}
            snapPoints={snapPoints}
            backgroundStyle={styles.background}
            handleIndicatorStyle={styles.handle}
            onChange={onChange}
        >
            <View style={styles.header}>
                <Text style={styles.title}>{showBookmarks ? 'My Bookmarks' : 'Explore Nearby'}</Text>
                <TouchableOpacity onPress={() => setShowBookmarks(!showBookmarks)}>
                    <Text style={styles.bookmarkButtonText}>
                        {showBookmarks ? 'Show All' : 'My Bookmarks'}
                    </Text>
                </TouchableOpacity>
            </View>

            {!showBookmarks && (
                <CategoryFilter
                    categories={CATEGORIES}
                    selectedCategory={selectedCategory}
                    onSelect={(cat) => onCategorySelect(cat === 'All' ? null : cat)}
                />
            )}

            <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
                {!showBookmarks && (
                    <View style={styles.suggestionContainer}>
                        <Text style={styles.sectionTitle}>For You</Text>
                        <View style={styles.suggestionCard}>
                            <Text style={styles.suggestionIcon}>☀️</Text>
                            <View>
                                <Text style={styles.suggestionTitle}>Sunny Day!</Text>
                                <Text style={styles.suggestionText}>Perfect for a walk in the park.</Text>
                            </View>
                        </View>
                    </View>
                )}

                <Text style={styles.sectionTitle}>
                    {showBookmarks ? `${bookmarks.length} Saved Places` : 'Nearby Places'}
                </Text>

                {filteredPlaces.map((place) => (
                    <PlaceCard
                        key={place.id}
                        place={place}
                        onPress={() => onPlaceSelect(place)}
                    />
                ))}

                {filteredPlaces.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            {showBookmarks ? 'No bookmarks yet.' : 'No places found in this category.'}
                        </Text>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </BottomSheetScrollView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    background: {
        backgroundColor: 'white',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    handle: {
        backgroundColor: '#E2E8F0',
        width: 40,
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
    },
    bookmarkButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F766E',
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginTop: 8,
        marginBottom: 12,
    },
    suggestionContainer: {
        marginBottom: 24,
    },
    suggestionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDFA',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#CCFBF1',
    },
    suggestionIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    suggestionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F766E',
        marginBottom: 2,
    },
    suggestionText: {
        fontSize: 12,
        color: '#0F766E',
        opacity: 0.8,
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        color: '#64748B',
        fontStyle: 'italic',
    },
});
