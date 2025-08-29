import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import WishlistScreen from './src/screens/WishlistScreen';
import AddScreen from './src/screens/AddScreen';
import { initDB } from './src/db';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    initDB().catch((e) => console.error('DB init failed', e));
  }, []);

  const prefix = Linking.createURL('/');

  const linking = {
    prefixes: [prefix, 'centscape://'],
    config: {
      screens: {
        Add: 'add'
      }
    }
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Wishlist" component={WishlistScreen} />
        <Stack.Screen name="Add" component={AddScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
