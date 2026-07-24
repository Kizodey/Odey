import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { config } from '../config';
import { getPlacesService } from '../services/places/PlacesService';
import type { LatLng, Place } from '../types';

type Props = {
  near: LatLng;
  onSelect(place: Place): void;
};

export function DestinationSearch({ near, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [focused, setFocused] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (!focused) return;
    debounce.current = setTimeout(async () => {
      try {
        const places = await getPlacesService().autocomplete(query, near);
        setResults(places);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query, focused, near]);

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        placeholder={
          config.mode === 'mock' ? 'Search demo destinations…' : 'Where to?'
        }
        placeholderTextColor="#8a8a8a"
        value={query}
        onChangeText={setQuery}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        returnKeyType="search"
      />
      {focused && results.length > 0 && (
        <FlatList
          style={styles.list}
          keyboardShouldPersistTaps="handled"
          data={results}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => {
                setQuery(item.name);
                setResults([]);
                setFocused(false);
                onSelect(item);
              }}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.address} numberOfLines={1}>
                {item.address}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  list: {
    marginTop: 6,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    maxHeight: 280,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  name: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  address: { fontSize: 13, color: '#777', marginTop: 2 },
});
