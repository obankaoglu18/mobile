import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Dimensions, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Button } from './Button';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const { height } = Dimensions.get('window');
const API_URL = 'http://192.168.1.103:3002';

interface Place {
    id: string;
    name: string;
    description?: string;
    category: string;
    rating?: number;
    avgRating?: number;
    ratingCount?: number;
    imageUrl?: string;
    images?: string[];
    lat: number;
    lng: number;
}

interface Review {
    id: string;
    rating: number;
    text: string;
    createdAt: string;
    user: {
        displayName: string;
        avatarUrl?: string;
    };
}

interface PlaceDetailsSheetProps {
    place: Place | null;
    onClose: () => void;
    onUpdate?: () => void;
}

// Mock images for demo fallback
const MOCK_IMAGES = [
    'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1496417263034-38ec4f0d665a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519114097352-38159f912d6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
];

export const PlaceDetailsSheet = ({ place, onClose, onUpdate }: PlaceDetailsSheetProps) => {
    const slideAnim = useRef(new Animated.Value(height)).current;
    const navigation = useNavigation<any>();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [address, setAddress] = useState<string>('');
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [placeImages, setPlaceImages] = useState<string[]>([]);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loadingBookmark, setLoadingBookmark] = useState(false);

    useEffect(() => {
        if (place) {
            Animated.spring(slideAnim, {
                toValue: height * 0.3, // Show 70% of the sheet
                useNativeDriver: true,
                damping: 20,
                mass: 0.8,
            }).start();

            fetchReviews();
            fetchAddress();
            checkBookmarkStatus();
            setPlaceImages(place.images && place.images.length > 0 ? place.images : [place.imageUrl || MOCK_IMAGES[0], ...MOCK_IMAGES.slice(1)]);
        } else {
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [place]);

    const checkBookmarkStatus = async () => {
        if (!place) return;
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;

            const response = await fetch(`${API_URL}/bookmarks`, {
                headers: { 'x-user-id': userId }
            });
            if (response.ok) {
                const bookmarks = await response.json();
                const isSaved = bookmarks.some((b: any) => b.id === place.id);
                setIsBookmarked(isSaved);
            }
        } catch (error) {
            console.error('Failed to check bookmark status:', error);
        }
    };

    const toggleBookmark = async () => {
        if (!place) return;
        setLoadingBookmark(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Login Required', 'Please login to bookmark places.');
                return;
            }

            if (isBookmarked) {
                // Remove bookmark
                const response = await fetch(`${API_URL}/bookmarks/${place.id}`, {
                    method: 'DELETE',
                    headers: { 'x-user-id': userId }
                });
                if (response.ok) {
                    setIsBookmarked(false);
                    onUpdate?.();
                }
            } else {
                // Add bookmark
                const response = await fetch(`${API_URL}/bookmarks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': userId
                    },
                    body: JSON.stringify({ placeId: place.id })
                });
                if (response.ok) {
                    setIsBookmarked(true);
                    onUpdate?.();
                }
            }
        } catch (error) {
            console.error('Failed to toggle bookmark:', error);
            Alert.alert('Error', 'Failed to update bookmark');
        } finally {
            setLoadingBookmark(false);
        }
    };

    const fetchReviews = async () => {
        if (!place) return;
        setLoadingReviews(true);
        try {
            const response = await fetch(`${API_URL}/reviews/place/${place.id}`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    const fetchAddress = async () => {
        if (!place) return;
        try {
            const result = await Location.reverseGeocodeAsync({
                latitude: place.lat,
                longitude: place.lng,
            });

            if (result.length > 0) {
                const addr = result[0];
                const addressString = `${addr.street || ''} ${addr.streetNumber || ''}, ${addr.city || ''}`;
                setAddress(addressString.trim());
            }
        } catch (error) {
            console.error('Failed to fetch address:', error);
            setAddress('Address not available');
        }
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
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        if (!place) return;
        setUploading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'You must be logged in to add photos');
                return;
            }

            const formData = new FormData();
            formData.append('photo', {
                uri,
                name: 'place.jpg',
                type: 'image/jpeg',
            } as any);

            // 1. Upload file
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

            // 2. Create photo record
            const photoRes = await fetch(`${API_URL}/photos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: fullUrl,
                    placeId: place.id,
                    userId,
                }),
            });

            if (photoRes.ok) {
                setPlaceImages(prev => [fullUrl, ...prev]);
                Alert.alert('Success', 'Photo added!');
            } else {
                throw new Error('Failed to save photo record');
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    if (!place) return null;

    const rating = place.avgRating || place.rating || 0;
    const reviewCount = place.ratingCount || 0;

    return (
        <Animated.View
            style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
        >
            <View style={styles.handleContainer}>
                <View style={styles.handle} />
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.category}>{place.category.toUpperCase()}</Text>
                        <Text style={styles.title}>{place.name}</Text>
                        <View style={styles.ratingContainer}>
                            <Text style={styles.ratingStar}>★</Text>
                            <Text style={styles.ratingText}>{rating.toFixed(1)} ({reviewCount} reviews)</Text>
                        </View>
                        {address ? (
                            <Text style={styles.addressText}>📍 {address}</Text>
                        ) : null}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={toggleBookmark}
                            style={[styles.bookmarkButton, isBookmarked && styles.bookmarkButtonActive]}
                            disabled={loadingBookmark}
                        >
                            <Text style={[styles.bookmarkIcon, isBookmarked && styles.bookmarkIconActive]}>
                                {isBookmarked ? '♥' : '♡'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Images Horizontal Scroll */}
                <View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.imageScroll}
                        contentContainerStyle={styles.imageScrollContent}
                    >
                        <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage} disabled={uploading}>
                            {uploading ? (
                                <ActivityIndicator color="#64748B" />
                            ) : (
                                <>
                                    <Text style={styles.addPhotoIcon}>📷</Text>
                                    <Text style={styles.addPhotoText}>Add Photo</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        {placeImages.map((img, index) => (
                            <Image
                                key={index}
                                source={{ uri: img }}
                                style={styles.image}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Description */}
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.description}>
                    {place.description || "A wonderful place to visit. Experience the local culture and enjoy the beautiful scenery."}
                </Text>

                {/* Reviews Section */}
                <View style={styles.reviewsHeader}>
                    <Text style={styles.sectionTitle}>Reviews</Text>
                    <TouchableOpacity onPress={() => {
                        onClose();
                        navigation.navigate('AddReview', { placeId: place.id, placeName: place.name });
                    }}>
                        <Text style={styles.seeAllText}>Write a Review</Text>
                    </TouchableOpacity>
                </View>

                {reviews.length === 0 ? (
                    <View style={styles.emptyReviews}>
                        <Text style={styles.emptyReviewsText}>No reviews yet. Be the first!</Text>
                    </View>
                ) : (
                    reviews.map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.avatar}>
                                <Image
                                    source={{ uri: review.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user.displayName)}&background=random` }}
                                    style={{ width: 40, height: 40, borderRadius: 20 }}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewerName}>{review.user.displayName}</Text>
                                    <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</Text>
                                </View>
                                <View style={styles.starsRow}>
                                    {[...Array(5)].map((_, k) => (
                                        <Text key={k} style={[styles.starSmall, k < review.rating ? styles.starFilled : styles.starEmpty]}>★</Text>
                                    ))}
                                </View>
                                {review.text && <Text style={styles.reviewText}>{review.text}</Text>}
                            </View>
                        </View>
                    ))
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.actionBar}>
                <Button
                    title="Directions"
                    variant="outline"
                    style={{ flex: 1, marginRight: 12 }}
                    onPress={() => {
                        Alert.alert('Directions', `Navigating to ${place.name}...`);
                    }}
                />
                <Button
                    title="Add Review"
                    variant="primary"
                    style={{ flex: 1 }}
                    onPress={() => {
                        onClose();
                        navigation.navigate('AddReview', { placeId: place.id, placeName: place.name });
                    }}
                />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 20,
        zIndex: 100,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingBottom: 120, // Space for action bar
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    category: {
        fontSize: 12,
        fontWeight: '700',
        color: '#0F766E', // Primary color
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 8,
        lineHeight: 34,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    ratingStar: {
        color: '#F59E0B',
        fontSize: 16,
        marginRight: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    addressText: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
    },
    closeButtonText: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '600',
    },
    bookmarkButton: {
        padding: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        marginTop: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookmarkButtonActive: {
        backgroundColor: '#FFE4E6',
    },
    bookmarkIcon: {
        fontSize: 20,
        color: '#94A3B8',
    },
    bookmarkIconActive: {
        color: '#E11D48',
    },
    imageScroll: {
        marginBottom: 24,
        marginHorizontal: -24, // Break out of padding
    },
    imageScrollContent: {
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    image: {
        width: 280,
        height: 180,
        borderRadius: 16,
        marginRight: 12,
        backgroundColor: '#F1F5F9',
    },
    addPhotoButton: {
        width: 120,
        height: 180,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        marginRight: 12, // Reduced margin since it's first
    },
    addPhotoIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    addPhotoText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#475569',
        lineHeight: 24,
        marginBottom: 32,
    },
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllText: {
        color: '#0F766E',
        fontWeight: '600',
        fontSize: 14,
    },
    reviewCard: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    reviewerName: {
        fontWeight: '700',
        color: '#1E293B',
        fontSize: 14,
    },
    reviewDate: {
        color: '#94A3B8',
        fontSize: 12,
    },
    starsRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    starSmall: {
        fontSize: 12,
        marginRight: 2,
    },
    starFilled: {
        color: '#F59E0B',
    },
    starEmpty: {
        color: '#E2E8F0',
    },
    reviewText: {
        color: '#475569',
        fontSize: 14,
        lineHeight: 20,
    },
    emptyReviews: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
    },
    emptyReviewsText: {
        color: '#64748B',
        fontStyle: 'italic',
    },
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        flexDirection: 'row',
        paddingBottom: 40, // Safe area
    },
});
