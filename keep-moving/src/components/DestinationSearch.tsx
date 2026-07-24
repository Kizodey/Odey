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
import { theme } from '../theme';
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
        placeholderTextColor={theme.color.subtext}
        selectionColor={theme.color.accent}
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
    backgroundColor: theme.color.cardBg,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 20,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: '600',
    color: theme.color.text,
    ...theme.shadow.card,
  },
  list: {
    marginTop: 8,
    backgroundColor: theme.color.cardBg,
    borderRadius: theme.radius.card,
    maxHeight: 280,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8eaf5',
  },
  name: { fontSize: 15, fontWeight: '700', color: theme.color.text },
  address: { fontSize: 13, color: theme.color.subtext, marginTop: 2 },
});
