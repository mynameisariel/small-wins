import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getEntriesWithHighlights, Entry } from '../db/database';
import { formatDisplayDate } from '../db/dateUtils';
import { getMoodById } from '../constants/moods';
import { useTheme } from '../context/ThemeContext';

export const WinsListScreen: React.FC = () => {
  const { colors } = useTheme();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadEntries = async () => {
    const data = await getEntriesWithHighlights();
    setEntries(data);
    setFilteredEntries(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredEntries(entries);
    } else {
      const filtered = entries.filter((entry) =>
        entry.highlight?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredEntries(filtered);
    }
  };

  const renderEntry = ({ item }: { item: Entry }) => {
    const mood = item.mood ? getMoodById(item.mood) : null;
    return (
      <View style={[styles.entryCard, { backgroundColor: colors.cardBase, borderColor: colors.border }]}>
        <View style={styles.entryHeader}>
          <Text style={[styles.entryDate, { color: colors.textSecondary }]}>
            {formatDisplayDate(item.date)}
          </Text>
          {mood && (
            <View style={[styles.moodDot, { backgroundColor: mood.color }]} />
          )}
        </View>
        <Text style={[styles.entryHighlight, { color: colors.textPrimary }]}>
          {item.highlight}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          All Wins 🌟
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {filteredEntries.length}{' '}
          {filteredEntries.length === 1 ? 'entry' : 'entries'}
        </Text>
      </View>

      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: colors.cardBase,
            color: colors.textPrimary,
            borderColor: colors.border,
          },
        ]}
        placeholder="Search your wins..."
        placeholderTextColor={colors.textSecondary}
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery
                ? 'No wins found'
                : 'No wins yet!\nStart recording your daily highlights.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  searchInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  entryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  moodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  entryHighlight: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
