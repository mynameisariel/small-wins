import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getEntriesWithHighlights, Entry } from '../db/database';
import { formatDisplayDate } from '../db/dateUtils';
import { getMoodById, getMoodImage } from '../constants/moods';
import { useTheme } from '../context/ThemeContext';

export const WinsListScreen: React.FC = () => {
  const navigation = useNavigation();
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
    const moodKey = mood?.key || mood?.label.toLowerCase();
    const moodImage = moodKey ? getMoodImage(moodKey) : null;
    
    return (
      <View style={styles.entryCardContainer}>
        <ImageBackground
          source={require('../../assets/prompt.png')}
          style={styles.entryCard}
          resizeMode="cover"
        >
          <View style={styles.entryHeader}>
            <Text style={[styles.entryDate, { color: colors.textSecondary }]}>
              {formatDisplayDate(item.date)}
            </Text>
            {moodImage && (
              <View style={styles.moodIconContainer}>
                <Image
                  source={moodImage}
                  style={styles.moodIcon}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
          <View style={styles.entryContent}>
            <Text style={[styles.entryHighlight, { color: colors.textPrimary }]}>
              {item.highlight}
            </Text>
          </View>
        </ImageBackground>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.topButtonText, { color: colors.textPrimary }]}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={[styles.countText, { color: colors.textSecondary }]}>
          {filteredEntries.length}/{entries.length}
        </Text>

        <TouchableOpacity style={styles.topButton}>
          <Text style={[styles.topButtonText, { color: colors.textPrimary }]}>List View</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.cardBase, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Search your wins..."
          placeholderTextColor={colors.textSecondary}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  topButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  topButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  entryCardContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryCard: {
    padding: 20,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  moodIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodIcon: {
    width: 28,
    height: 28,
  },
  entryHighlight: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
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