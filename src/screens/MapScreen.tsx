import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet, TextInput, Keyboard } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PlaceDetailsSheet } from '../components/PlaceDetailsSheet';
import { MapBottomSheet } from '../components/MapBottomSheet';
import { API_URL } from '../config/api';
// @ts-ignore
import { featureCollection, point } from '@turf/helpers';

// TODO: Replace with valid public access token
Mapbox.setAccessToken('pk.eyJ1Ijoib3phbnNpbmEiLCJhIjoiY21pYXp0YnljMHJmMzJsc2EzZ3YybDRxMSJ9.4UajXCbMzWw7r6ygiX-0Aw');

export const MapScreen = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const [places, setPlaces] = useState<any[]>([]);
    const [tempLocation, setTempLocation] = useState<any>(null);
    const navigation = useNavigation<any>();
    const mapRef = useRef<Mapbox.MapView>(null);
    const cameraRef = useRef<Mapbox.Camera>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [followUser, setFollowUser] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Fetch places from API
    useFocusEffect(
        useCallback(() => {
            const fetchPlaces = async () => {
                try {
                    const response = await fetch(`${API_URL}/places`);
                    const data = await response.json();
                    setPlaces(data);
                } catch (error) {
                    console.error('Failed to fetch places:', error);
                    Alert.alert('Error', 'Failed to load places. Make sure the API is running.');
                }
            };
            fetchPlaces();
            // Clear temp location when returning to map
            setTempLocation(null);
        }, [])
    );

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            setPermissionStatus(status);
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, []);

    // Filter places based on search query and category
    const filteredPlaces = (places || []).filter(place => {
        if (!place) return false;
        const name = place.name || '';
        const category = place.category || '';
        const query = (searchQuery || '').toLowerCase();

        const matchesSearch = name.toLowerCase().includes(query) || category.toLowerCase().includes(query);
        const matchesCategory = selectedCategory ? category === selectedCategory : true;

        return matchesSearch && matchesCategory;
    });

    const handleSearchSubmit = () => {
        Keyboard.dismiss();
        if (filteredPlaces.length > 0) {
            setFollowUser(false);
            if (filteredPlaces.length === 1) {
                cameraRef.current?.setCamera({
                    centerCoordinate: [filteredPlaces[0].lng, filteredPlaces[0].lat],
                    zoomLevel: 14,
                    animationDuration: 1000,
                });
            } else {
                let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
                filteredPlaces.forEach(p => {
                    if (p.lng < minLng) minLng = p.lng;
                    if (p.lng > maxLng) maxLng = p.lng;
                    if (p.lat < minLat) minLat = p.lat;
                    if (p.lat > maxLat) maxLat = p.lat;
                });

                const padding = 0.01;
                cameraRef.current?.fitBounds(
                    [maxLng + padding, maxLat + padding],
                    [minLng - padding, minLat - padding],
                    [50, 50, 50, 50],
                    1000
                );
            }
        }
    };

    const handleLocationPress = () => {
        if (location) {
            setFollowUser(true);
            cameraRef.current?.setCamera({
                centerCoordinate: [location.coords.longitude, location.coords.latitude],
                zoomLevel: 14,
                animationDuration: 1000,
            });
        } else {
            Alert.alert('Location not available', 'Please wait while we fetch your location.');
        }
    };

    // Convert places to GeoJSON
    const placesGeoJSON = filteredPlaces.length > 0
        ? featureCollection(filteredPlaces.map(place => point([place.lng, place.lat], place)))
        : featureCollection([]);

    const onMapPress = (feature: any) => {
        setSelectedPlace(null);
        if (feature.geometry && feature.geometry.coordinates) {
            setTempLocation({
                lng: feature.geometry.coordinates[0],
                lat: feature.geometry.coordinates[1]
            });
        }
    };

    const onPointPress = async (event: any) => {
        if (event.features.length > 0) {
            const feature = event.features[0];
            const { cluster } = feature.properties;

            if (cluster) {
                setFollowUser(false);
                cameraRef.current?.setCamera({
                    centerCoordinate: feature.geometry.coordinates,
                    zoomLevel: 14,
                    animationDuration: 500,
                });
            } else {
                setSelectedPlace(feature.properties);
                setTempLocation(null);
            }
        }
    };

    const handlePlaceSelect = (place: any) => {
        setSelectedPlace(place);
        setFollowUser(false);
        cameraRef.current?.setCamera({
            centerCoordinate: [place.lng, place.lat],
            zoomLevel: 15,
            animationDuration: 1000,
        });
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <Mapbox.MapView
                    ref={mapRef}
                    style={{ flex: 1 }}
                    styleURL={Mapbox.StyleURL.Outdoors}
                    onPress={onMapPress}
                >
                    <Mapbox.Camera
                        ref={cameraRef}
                        zoomLevel={14}
                        followUserLocation={followUser}
                        followUserMode={Mapbox.UserTrackingMode.Follow}
                        animationMode={'flyTo'}
                        animationDuration={2000}
                    />

                    <Mapbox.UserLocation
                        visible={true}
                        showsUserHeadingIndicator={true}
                    />

                    {tempLocation && (
                        <Mapbox.PointAnnotation
                            id="tempLocation"
                            coordinate={[tempLocation.lng, tempLocation.lat]}
                        >
                            <View className="w-6 h-6 bg-red-500 rounded-full border-2 border-white items-center justify-center">
                                <View className="w-2 h-2 bg-white rounded-full" />
                            </View>
                        </Mapbox.PointAnnotation>
                    )}

                    <Mapbox.ShapeSource
                        id="placesSource"
                        cluster
                        clusterRadius={50}
                        clusterMaxZoomLevel={14}
                        shape={placesGeoJSON}
                        onPress={onPointPress}
                    >
                        <Mapbox.SymbolLayer
                            id="pointCount"
                            style={{
                                textField: ['get', 'point_count'],
                                textSize: 12,
                                textColor: '#ffffff',
                                textIgnorePlacement: true,
                                textAllowOverlap: true,
                            }}
                        />

                        <Mapbox.CircleLayer
                            id="clusteredPoints"
                            belowLayerID="pointCount"
                            filter={['has', 'point_count']}
                            style={{
                                circlePitchAlignment: 'map',
                                circleColor: '#0F766E',
                                circleRadius: 20,
                                circleOpacity: 0.7,
                                circleStrokeWidth: 2,
                                circleStrokeColor: 'white',
                            }}
                        />

                        <Mapbox.CircleLayer
                            id="singlePoint"
                            filter={['!', ['has', 'point_count']]}
                            style={{
                                circlePitchAlignment: 'map',
                                circleColor: '#F59E0B',
                                circleRadius: 10,
                                circleOpacity: 1,
                                circleStrokeWidth: 2,
                                circleStrokeColor: 'white',
                            }}
                        />
                    </Mapbox.ShapeSource>
                </Mapbox.MapView>

                {/* Top Bar with Search and Profile */}
                <View style={styles.topBar}>
                    <View style={styles.searchContainer}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search places..."
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            returnKeyType="search"
                            onSubmitEditing={handleSearchSubmit}
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => setMenuVisible(!menuVisible)}
                    >
                        <View style={styles.hamburgerIcon}>
                            <View style={styles.hamburgerLine} />
                            <View style={styles.hamburgerLine} />
                            <View style={styles.hamburgerLine} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Menu Popup */}
                {menuVisible && (
                    <View style={styles.menuPopup}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Profile'); }}>
                            <Text style={styles.menuText}>👤 Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Settings'); }}>
                            <Text style={styles.menuText}>⚙️ Settings</Text>
                        </TouchableOpacity>
                        <View style={styles.menuDivider} />
                        <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.replace('Login'); }}>
                            <Text style={[styles.menuText, { color: 'red' }]}>🚪 Logout</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Location Button */}
                <TouchableOpacity
                    style={styles.locationButton}
                    onPress={handleLocationPress}
                >
                    <Text style={styles.locationButtonText}>📍</Text>
                </TouchableOpacity>

                {/* Add Button */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddPlace', { selectedLocation: tempLocation })}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>

                {/* Persistent Bottom Sheet */}
                {!selectedPlace && (
                    <MapBottomSheet
                        places={places}
                        onPlaceSelect={handlePlaceSelect}
                        selectedCategory={selectedCategory}
                        onCategorySelect={setSelectedCategory}
                    />
                )}

                {/* Place Details Sheet (Modal/Overlay) */}
                <PlaceDetailsSheet place={selectedPlace} onClose={() => setSelectedPlace(null)} />
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    topBar: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        height: 50,
        borderRadius: 25,
        paddingHorizontal: 16,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
        height: '100%',
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    hamburgerIcon: {
        width: 24,
        height: 18,
        justifyContent: 'space-between',
    },
    hamburgerLine: {
        width: 24,
        height: 3,
        backgroundColor: '#0F766E',
        borderRadius: 2,
    },
    menuPopup: {
        position: 'absolute',
        top: 120,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 8,
        width: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 20,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1E293B',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 4,
    },
    locationButton: {
        position: 'absolute',
        bottom: 120, // Above the Add button
        right: 24,
        width: 48,
        height: 48,
        backgroundColor: 'white',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        zIndex: 10,
    },
    locationButtonText: {
        fontSize: 24,
    },
    addButton: {
        position: 'absolute',
        bottom: 40,
        right: 24,
        width: 64,
        height: 64,
        backgroundColor: '#0F766E',
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0F766E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 10,
    },
    addButtonText: {
        color: 'white',
        fontSize: 32,
        fontWeight: '300',
        marginTop: -4,
    },
});
