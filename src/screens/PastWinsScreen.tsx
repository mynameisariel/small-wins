import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getEntriesWithHighlights, Entry } from '../db/database';
import { formatDisplayDate } from '../db/dateUtils';
import { getMoodById, getMoodImage } from '../constants/moods';
import { Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NOTE_WIDTH = SCREEN_WIDTH * 0.8;
const NOTE_HEIGHT = SCREEN_HEIGHT * 0.6;

// Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const PastWinsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [shuffledEntries, setShuffledEntries] = useState<Entry[]>([]);
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'deck' | 'list'>('deck');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const loadAndShuffle = async () => {
    const entries = await getEntriesWithHighlights();
    const shuffled = shuffleArray(entries);
    setShuffledEntries(shuffled);
    setAllEntries(entries);
    setFilteredEntries(entries);
    setCurrentIndex(0);
    slideAnim.setValue(0);
  };

  useFocusEffect(
    useCallback(() => {
      loadAndShuffle();
    }, [])
  );

  const handleNext = () => {
    if (currentIndex < shuffledEntries.length - 1) {
      // Slide in from right
      slideAnim.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
      
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      // Slide new note in from left
      slideAnim.setValue(-1);
      setCurrentIndex((prev) => prev - 1);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  };

  // Trigger animation when index changes (for initial load)
  useEffect(() => {
    if (currentIndex > 0 && shuffledEntries.length > 0) {
      slideAnim.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [shuffledEntries.length]);

  const currentEntry = shuffledEntries[currentIndex];
  const canGoNext = currentIndex < shuffledEntries.length - 1;
  const canGoPrev = currentIndex > 0;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredEntries(allEntries);
    } else {
      const filtered = allEntries.filter((entry) =>
        entry.highlight?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredEntries(filtered);
    }
  };

  const renderListEntry = ({ item }: { item: Entry }) => {
    const mood = item.mood ? getMoodById(item.mood) : null;
    const moodKey = mood?.key || mood?.label.toLowerCase();
    const moodImage = moodKey ? getMoodImage(moodKey) : null;
    return (
      <View style={[styles.entryCard, { backgroundColor: colors.cardBase, borderColor: colors.border }]}>
        <View style={styles.entryHeader}>
          <Text style={[styles.entryDate, { color: colors.textSecondary }]}>
            {formatDisplayDate(item.date)}
          </Text>
          {moodImage && (
            <View style={styles.moodIconContainer}>
              <Image
                source={moodImage}
                style={styles.moodImage}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
        <Text style={[styles.entryHighlight, { color: colors.textPrimary }]}>
          {item.highlight}
        </Text>
      </View>
    );
  };

  // Calculate rotation for each note in the stack (stable rotation based on entry id)
  const getRotation = (entryId: number, stackIndex: number): number => {
    if (stackIndex === 0) return 0; // Top note is straight
    // Use entry id to generate a stable but varied rotation
    const hash = (entryId * 17) % 100;
    return ((hash / 100) * 6 - 3); // -3 to +3 degrees
  };

  // Render note cards in a stack
  const renderNoteStack = () => {
    if (shuffledEntries.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            No wins yet!
          </Text>
          <Text style={styles.emptyMessage}>
            Start recording your daily highlights to see them here.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => {
              navigation.navigate('Today' as never);
            }}
          >
            <Text style={styles.emptyButtonText}>Write Today's Win</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Show up to 3 notes: current + next 2 (for stacked effect)
    const visibleCount = Math.min(3, shuffledEntries.length - currentIndex);
    const notes = [];

    for (let i = 0; i < visibleCount; i++) {
      const entryIndex = currentIndex + i;
      const entry = shuffledEntries[entryIndex];
      const isTopNote = i === 0;
      const rotation = getRotation(entry.id, i);
      const offsetX = i * 8;
      const offsetY = i * 8;
      const scale = 1 - i * 0.03;
      const opacity = 1 - i * 0.15;

      const mood = entry.mood ? getMoodById(entry.mood) : null;

      // Animation only for the top note when transitioning
      const translateX = isTopNote
        ? slideAnim.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH, 0],
          })
        : offsetX;
      const translateY = offsetY;
      const rotateZ = `${rotation}deg`;

      notes.push(
        <Animated.View
          key={entry.id}
          style={[
            styles.noteCardContainer,
            {
              transform: [
                { translateX: isTopNote ? translateX : offsetX },
                { translateY },
                { rotateZ },
                { scale: isTopNote ? 1 : scale },
              ],
              opacity: isTopNote ? 1 : opacity,
              zIndex: visibleCount - i,
            },
          ]}
        >
          <View style={[styles.noteCard, { backgroundColor: colors.cardBase, borderColor: colors.border }]}>
            <View style={styles.noteHeader}>
              <Text style={[styles.noteDate, { color: colors.textSecondary }]}>
                {formatDisplayDate(entry.date)}
              </Text>
              {mood && getMoodImage(mood.key || mood.label.toLowerCase()) && (
                <View style={styles.moodIndicator}>
                  <Image
                    source={getMoodImage(mood.key || mood.label.toLowerCase())!}
                    style={styles.moodImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>
            <Text style={[styles.noteText, { color: colors.textPrimary }]}>
              {entry.highlight}
            </Text>
          </View>
        </Animated.View>
      );
    }

    return <View style={styles.stackContainer}>{notes}</View>;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.topButtonText, { color: colors.textPrimary }]}>
            ← Back
          </Text>
        </TouchableOpacity>

        {viewMode === 'deck' && shuffledEntries.length > 0 && (
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {currentIndex + 1} / {shuffledEntries.length}
          </Text>
        )}

        {viewMode === 'list' && allEntries.length > 0 && (
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
          </Text>
        )}

        <TouchableOpacity
          style={styles.topButton}
          onPress={() => setViewMode(viewMode === 'deck' ? 'list' : 'deck')}
        >
          <Text style={[styles.topButtonText, { color: colors.textPrimary }]}>
            {viewMode === 'deck' ? 'List View' : 'Deck View'}
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'deck' ? (
        <>
          {/* Notes Stack Container */}
          <View style={styles.contentArea}>
            {renderNoteStack()}
          </View>

          {/* Tap Zones - Full Height */}
          {shuffledEntries.length > 0 && (
            <View style={styles.tapZones}>
              <TouchableOpacity
                style={[styles.tapZone, styles.leftZone]}
                onPress={handlePrev}
                disabled={!canGoPrev}
                activeOpacity={canGoPrev ? 0.3 : 1}
              />
              <TouchableOpacity
                style={[styles.tapZone, styles.rightZone]}
                onPress={handleNext}
                disabled={!canGoNext}
                activeOpacity={canGoNext ? 0.3 : 1}
              />
            </View>
          )}
        </>
      ) : (
        <View style={styles.listContainer}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.cardBase, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Search your wins..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <FlatList
            data={filteredEntries}
            renderItem={renderListEntry}
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
        </View>
      )}
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
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  stackContainer: {
    width: NOTE_WIDTH,
    height: NOTE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteCardContainer: {
    position: 'absolute',
    width: NOTE_WIDTH,
    minHeight: NOTE_HEIGHT * 0.6,
    maxHeight: NOTE_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  noteCard: {
    width: '100%',
    height: '100%',
    minHeight: NOTE_HEIGHT * 0.6,
    padding: 24,
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  noteDate: {
    fontSize: 18,
    fontWeight: '600',
  },
  moodIndicator: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodImage: {
    width: 70,
    height: 70,
  },
  noteText: {
    fontSize: 30,
    lineHeight: 28,
    fontWeight: '400',
  },
  tapZones: {
    position: 'absolute',
    top: 100,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  tapZone: {
    flex: 1,
  },
  leftZone: {},
  rightZone: {},
  listContainer: {
    flex: 1,
  },
  searchInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginHorizontal: 20,
    marginVertical: 16,
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
  moodIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#111827',
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    color: '#6B7280',
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});