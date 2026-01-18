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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getEntriesWithHighlights, Entry } from '../db/database';
import { formatDisplayDate } from '../db/dateUtils';
import { getMoodById } from '../constants/moods';

export const WinsListScreen: React.FC = () => {
  const navigation = useNavigation();
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
          <Text style={styles.entryDate}>
            {formatDisplayDate(item.date)}
          </Text>
          {mood && (
            <View style={[styles.moodCircle, { backgroundColor: mood.color }]}>
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            </View>
          )}
        </View>
        <Text style={styles.entryHighlight}>
          {item.highlight}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.topButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.countText}>
          {filteredEntries.length}/{entries.length}
        </Text>

        <TouchableOpacity style={styles.topButton}>
          <Text style={styles.topButtonText}>List View</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search your wins..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

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
    backgroundColor: '#DCC4C6',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  topButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  topButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  entryCard: {
    backgroundColor: '#E8D5C4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  moodCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 18,
  },
  entryHighlight: {
    fontSize: 16,
    lineHeight: 24,
    color: '#111827',
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
    color: '#6B7280',
  },
});