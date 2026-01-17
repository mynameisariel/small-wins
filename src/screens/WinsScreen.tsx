import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getEntriesWithHighlights, Entry } from '../db/database';
import { formatDisplayDate } from '../db/dateUtils';
import { getMoodById } from '../constants/moods';

export const WinsScreen: React.FC = () => {
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
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryDate}>{formatDisplayDate(item.date)}</Text>
          {mood && (
            <View
              style={[styles.moodDot, { backgroundColor: mood.color }]}
            />
          )}
        </View>
        <Text style={styles.entryHighlight}>{item.highlight}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Small Wins 🌟</Text>
        <Text style={styles.subtitle}>
          {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
        </Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search your wins..."
        placeholderTextColor="#9CA3AF"
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
            <Text style={styles.emptyText}>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  searchInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  entryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#6B7280',
  },
  moodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  entryHighlight: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
});