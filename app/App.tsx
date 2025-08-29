import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import WishlistScreen from './src/screens/WishlistScreen';
import AddScreen from './src/screens/AddScreen';
import { initDB } from './src/db';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['centscape://'],
  config: {
    screens: {
      Add: {
        path: '/add',
        parse: {
          url: (url: string) => decodeURIComponent(url),
        },
      },
      Wishlist: '/',
    },
  },
};

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await initDB();
      } catch (e) {
        console.error('DB init failed', e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <React.Fragment>
        {/* Simple splash while DB initializes */}
      </React.Fragment>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Wishlist" component={WishlistScreen} />
        <Stack.Screen name="Add" component={AddScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
