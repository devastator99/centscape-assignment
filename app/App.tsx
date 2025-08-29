import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { StyleSheet } from 'react-native';
import { Button, Text, Surface, PaperProvider } from 'react-native-paper';

// Define the type for our stack navigator's route parameters
type RootStackParamList = {
  Wishlist: undefined;
  Add: undefined;
};

// Create the stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

// Define the props type for the WishlistScreen component
type WishlistScreenProps = NativeStackScreenProps<RootStackParamList, 'Wishlist'>;

// WishlistScreen component
function WishlistScreen({ navigation }: WishlistScreenProps) {
  return (
    <Surface style={styles.container}>
      <Text style={styles.title}>Wishlist</Text>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Add')}
      >
        Add Item
      </Button>
    </Surface>
  );
}

// AddScreen component
function AddScreen() {
  return (
    <Surface style={styles.container}>
      <Text style={styles.title}>Add Screen (deep link url prefill goes here)</Text>
    </Surface>
  );
}

// Main App component
export default function App() {
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
    <PaperProvider>
      <NavigationContainer linking={linking}>
        <Stack.Navigator>
          <Stack.Screen name="Wishlist" component={WishlistScreen} />
          <Stack.Screen name="Add" component={AddScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    elevation: 0,
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
  },
});
