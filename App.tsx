import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import "./global.css";
import { MapScreen } from './src/screens/MapScreen';
import { AddPlaceScreen } from './src/screens/AddPlaceScreen';
import { AddReviewScreen } from './src/screens/AddReviewScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen name="AddPlace" component={AddPlaceScreen} options={{ title: 'Add Place' }} />
        <Stack.Screen name="AddReview" component={AddReviewScreen} options={{ title: 'Write Review' }} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
