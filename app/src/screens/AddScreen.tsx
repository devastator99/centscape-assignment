import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, ActivityIndicator, Alert } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { SERVER_URL } from '../config';
import { addItem } from '../db';
import { normalizeUrl } from '../utils/normalizeUrl';
import PreviewCard from '../components/PreviewCard';

type ParamList = {
  Add: { url?: string } | undefined;
};

export default function AddScreen() {
  const route = useRoute<RouteProp<ParamList, 'Add'>>();
  const prefilled = route.params?.url ?? '';
  const [url, setUrl] = useState(prefilled);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (prefilled) {
      setUrl(prefilled);
      handleFetch(prefilled);
    }
  }, [prefilled]);

  async function handleFetch(u?: string) {
    const toFetch = u ?? url;
    if (!toFetch) return Alert.alert('Enter a URL');
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const res = await fetch(`${SERVER_URL}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: toFetch })
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({error:'Unknown'}));
        throw new Error(err?.error ?? 'Failed to fetch preview');
      }
      const data = await res.json();
      setPreview(data);
    } catch (e: any) {
      console.error('Preview fetch error:', e);
      let errorMsg = e.message ?? 'Fetch failed';
      
      // Handle specific error cases with clearer messaging
      if (errorMsg.includes('maxContentLength') || errorMsg.includes('524288')) {
        errorMsg = 'Page too large (>512KB). Try a different product URL or a more specific product page.';
      } else if (errorMsg.includes('timeout')) {
        errorMsg = 'Request timed out. Check your connection and try again.';
      } else if (errorMsg.includes('Network')) {
        errorMsg = 'Network error. Check your connection and try again.';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!preview) return;
    const norm = normalizeUrl(preview.sourceUrl);
    try {
      const createdAt = new Date().toISOString();
      const id = await addItem({
        title: preview.title,
        image: preview.image,
        price: preview.price ?? null,
        currency: preview.currency ?? null,
        siteName: preview.siteName ?? null,
        sourceUrl: preview.sourceUrl,
        normalizedUrl: norm,
        createdAt
      });
      Alert.alert('Saved', `Item saved (id=${id})`);
    } catch (e: any) {
      Alert.alert('Save failed', e.message ?? 'Error');
    }
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        value={url}
        onChangeText={setUrl}
        placeholder="Paste product URL"
        autoCapitalize="none"
        autoCorrect={false}
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 8, marginBottom: 8 }}
        accessibilityLabel="URL input"
      />
      <Button title="Fetch Preview" onPress={() => handleFetch()} accessibilityLabel="Fetch preview button" />
      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
      {error && (
        <View style={{ marginTop: 12, padding: 12, backgroundColor: '#fff3cd', borderRadius: 8, borderWidth: 1, borderColor: '#ffeaa7' }}>
          <Text style={{ color: '#856404', marginBottom: 8 }}>{error}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="Retry" onPress={() => handleFetch()} accessibilityLabel="Retry fetch button" />
            <Button title="Clear" onPress={() => { setError(null); setUrl(''); }} color="#6c757d" accessibilityLabel="Clear and try different URL" />
          </View>
        </View>
      )}
      {preview && (
        <View style={{ marginTop: 12 }}>
          <PreviewCard preview={preview} />
          <Button title="Add to Wishlist" onPress={handleAdd} accessibilityLabel="Add to wishlist button" />
        </View>
      )}
    </View>
  );
}
