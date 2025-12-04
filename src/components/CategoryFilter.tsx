import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';

interface CategoryFilterProps {
    categories: string[];
    selectedCategory: string | null;
    onSelect: (category: string) => void;
}

export const CategoryFilter = ({ categories, selectedCategory, onSelect }: CategoryFilterProps) => {
    return (
        <View style={styles.wrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >
                <TouchableOpacity
                    style={[
                        styles.chip,
                        selectedCategory === null && styles.chipSelected
                    ]}
                    onPress={() => onSelect('All')}
                >
                    <Text style={[
                        styles.text,
                        selectedCategory === null && styles.textSelected
                    ]}>All</Text>
                </TouchableOpacity>

                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[
                            styles.chip,
                            selectedCategory === cat && styles.chipSelected
                        ]}
                        onPress={() => onSelect(cat)}
                    >
                        <Text style={[
                            styles.text,
                            selectedCategory === cat && styles.textSelected
                        ]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 16,
    },
    container: {
        paddingHorizontal: 24,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    chipSelected: {
        backgroundColor: '#0F766E',
        borderColor: '#0F766E',
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    textSelected: {
        color: '#FFFFFF',
    },
});
