import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { getAllItems, deleteItem } from '../db';
import { WishlistItem } from '../types';
import Skeleton from '../components/Skeleton';
import { useIsFocused } from '@react-navigation/native';

export default function WishlistScreen({ navigation }: any) {
  const [items, setItems] = useState<WishlistItem[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const focused = useIsFocused();

  async function load() {
    try {
      const list = await getAllItems();
      setItems(list);
    } catch (e) {
      console.error(e);
      setItems([]);
    }
  }

  useEffect(() => {
    if (focused) load();
  }, [focused]);

  if (items === null) {
    return <Skeleton />;
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
        ListEmptyComponent={() => <Text style={{ padding: 16 }}>No items yet. Add one from the Add screen.</Text>}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Image
              source={ item.image ? { uri: item.image } : require('../../assets/fallback.png') }
              style={{ width: 80, height: 80, marginRight: 12, backgroundColor: '#f4f4f4' }}
              onError={() => {/* fallback handled by source */}}
              accessibilityLabel={`Image of ${item.title ?? 'item'}`}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600' }}>{item.title ?? 'Untitled'}</Text>
              <Text>{item.price ?? 'N/A'}</Text>
              <Text style={{ color: '#666' }}>{item.siteName ?? (new URL(item.sourceUrl).hostname)}</Text>
              <Text style={{ color: '#aaa', fontSize: 12 }}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
            <TouchableOpacity onPress={() => { deleteItem(item.id).then(load); }} accessibilityLabel={`Delete item ${item.title ?? ''}`} style={{ padding: 8 }}>
              <Text style={{ color: 'crimson' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity onPress={() => navigation.navigate('Add')} style={{ position: 'absolute', right: 16, bottom: 16, backgroundColor: '#007bff', padding: 12, borderRadius: 24 }} accessibilityLabel="Open add screen button">
        <Text style={{ color: 'white' }}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}
