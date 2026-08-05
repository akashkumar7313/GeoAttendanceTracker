import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Coordinates, PlaceResult, PlaceSuggestion } from '../types';
import { getPlaceDetails, searchPlaces } from '../services/geocode.service';
import { COLORS } from '../constants';

interface OfficeSearchProps {
  /** Fired when the user picks a place from the results. */
  onSelect: (place: PlaceResult) => void;
  /** The user's GPS location, used to bias search results near them. */
  userLocation?: Coordinates | null;
}

/**
 * Search box that lets the user find their office via Google Places and
 * pick it, returning the selected place's name and coordinates.
 */
export function OfficeSearch({ onSelect, userLocation }: OfficeSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    setError(null);
    debounceRef.current = setTimeout(async () => {
      const { results: places, error: searchError } = await searchPlaces(
        trimmed,
        userLocation,
      );
      setResults(places);
      setError(searchError);
      setSearching(false);
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, userLocation]);

  const handleSelect = async (suggestion: PlaceSuggestion) => {
    setQuery('');
    setResults([]);
    Keyboard.dismiss();
    const { place, error: detailError } = await getPlaceDetails(
      suggestion.placeId,
    );
    if (place) {
      setError(null);
      onSelect(place);
    } else {
      setError(
        detailError ||
          'Could not load coordinates for this place. Please try another.',
      );
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputContainer}>
        <Icon name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search your office location…"
          placeholderTextColor={COLORS.textSecondary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCorrect={false}
          returnKeyType="search"
        />
        {searching ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {focused && (results.length > 0 || searching) ? (
        <View style={styles.results}>
          {searching && results.length === 0 ? (
            <View style={styles.resultItem}>
              <Text style={styles.resultText}>Searching…</Text>
            </View>
          ) : null}
          {results.map((suggestion, index) => (
            <Pressable
              key={`${suggestion.placeId}-${index}`}
              onPress={() => handleSelect(suggestion)}
              style={({ pressed }) => [
                styles.resultItem,
                pressed && styles.resultItemPressed,
              ]}
            >
              <Icon
                name="place"
                size={18}
                color={COLORS.primary}
                style={styles.resultIcon}
              />
              <Text style={styles.resultText} numberOfLines={2}>
                {suggestion.name}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    padding: 0,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.danger,
  },
  results: {
    marginTop: 6,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  resultItemPressed: {
    backgroundColor: COLORS.background,
  },
  resultIcon: {
    flexShrink: 0,
  },
  resultText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
});
