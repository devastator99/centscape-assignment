import React from 'react';
import { View, ViewStyle } from 'react-native';

function Box({ style }: { style?: ViewStyle }) {
  return <View style={[{ backgroundColor: '#e8e8e8', borderRadius: 4 }, style]} />;
}

export default function Skeleton() {
  return (
    <View style={{ padding: 16 }}>
      <Box style={{ height: 180, marginBottom: 12 }} />
      <Box style={{ height: 20, width: '70%', marginBottom: 8 }} />
      <Box style={{ height: 16, width: '40%', marginBottom: 4 }} />
      <Box style={{ height: 16, width: '50%', marginTop: 12 }} />
    </View>
  );
}
