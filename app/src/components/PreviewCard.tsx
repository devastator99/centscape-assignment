import React from 'react';
import { View, Text, Image } from 'react-native';

export default function PreviewCard({ preview }: { preview: any }) {
  return (
    <View style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8 }}>
      <Image source={ preview.image ? { uri: preview.image } : require('../assets/fallback.png') } style={{ width: '100%', height: 180, marginBottom: 8 }} />
      <Text style={{ fontWeight: '600', marginBottom: 4 }}>{preview.title ?? 'No title'}</Text>
      <Text>{preview.price ?? 'N/A' } {preview.currency ? ` ${preview.currency}` : ''}</Text>
      <Text style={{ color: '#666', marginTop: 4 }}>{preview.siteName ?? (preview.sourceUrl ? new URL(preview.sourceUrl).hostname : '')}</Text>
    </View>
  );
}
