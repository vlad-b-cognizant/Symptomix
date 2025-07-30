import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { theme } from './src/theme/theme';

import HomeScreen from './src/screens/HomeScreen';
import SymptomWizardScreen from './src/screens/SymptomWizardScreen';
import DiagnosticResultsScreen from './src/screens/DiagnosticResultsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ 
              title: 'Symptomix',
              headerStyle: {
                backgroundColor: theme.colors.primary,
              }
            }} 
          />
          <Stack.Screen 
            name="SymptomWizard" 
            component={SymptomWizardScreen} 
            options={{ title: 'Symptom Assessment' }} 
          />
          <Stack.Screen 
            name="DiagnosticResults" 
            component={DiagnosticResultsScreen} 
            options={{ title: 'Your Results' }} 
          />
          <Stack.Screen 
            name="History" 
            component={HistoryScreen} 
            options={{ title: 'Assessment History' }} 
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ title: 'Profile' }} 
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </PaperProvider>
  );
}
