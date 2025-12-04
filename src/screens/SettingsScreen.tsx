import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const SettingsScreen = () => {
    const navigation = useNavigation<any>();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [locationEnabled, setLocationEnabled] = React.useState(true);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Settings</Text>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Edit Profile</Text>
                        <Text style={styles.settingChevron}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Change Password</Text>
                        <Text style={styles.settingChevron}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Privacy</Text>
                        <Text style={styles.settingChevron}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Notifications Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>

                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Push Notifications</Text>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: '#E2E8F0', true: '#0F766E' }}
                            thumbColor={'#FFFFFF'}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Location Services</Text>
                        <Switch
                            value={locationEnabled}
                            onValueChange={setLocationEnabled}
                            trackColor={{ false: '#E2E8F0', true: '#0F766E' }}
                            thumbColor={'#FFFFFF'}
                        />
                    </View>
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>

                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Language</Text>
                        <View style={styles.settingRow}>
                            <Text style={styles.settingValue}>English</Text>
                            <Text style={styles.settingChevron}>›</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Theme</Text>
                        <View style={styles.settingRow}>
                            <Text style={styles.settingValue}>Light</Text>
                            <Text style={styles.settingChevron}>›</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>

                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Terms of Service</Text>
                        <Text style={styles.settingChevron}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Privacy Policy</Text>
                        <Text style={styles.settingChevron}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingLabel}>App Version</Text>
                        <Text style={styles.settingValue}>1.0.0</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => navigation.replace('Login')}
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
    content: {
        padding: 20,
        paddingTop: 60,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 34,
        fontWeight: '900',
        color: '#0F172A',
        letterSpacing: -1,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginLeft: 16,
        marginTop: 12,
        marginBottom: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    settingLabel: {
        fontSize: 16,
        color: '#0F172A',
        fontWeight: '500',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingValue: {
        fontSize: 16,
        color: '#64748B',
        marginRight: 8,
    },
    settingChevron: {
        fontSize: 24,
        color: '#CBD5E1',
        fontWeight: '300',
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
        marginTop: 8,
        marginBottom: 40,
    },
    logoutButtonText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '700',
    },
});
