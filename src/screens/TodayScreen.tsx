import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getTodayLocalDate, formatDisplayDate } from '../db/dateUtils';
import { getEntriesWithHighlights, getEntryByDate, Entry } from '../db/database';
import { getMoodById } from '../constants/moods';
import { useTheme } from '../context/ThemeContext';
import { BlobCard } from '../components/BlobCard';
import { MoodIcon } from '../components/MoodIcon';

export const TodayScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [todayDate] = useState(getTodayLocalDate());
  const [entry, setEntry] = useState<Entry | null>(null);
  const [hasAnyReflections, setHasAnyReflections] = useState<boolean | null>(null);

  const loadTodayEntry = async () => {
    const todayEntry = await getEntryByDate(todayDate);
    setEntry(todayEntry);
  };

  const loadHasAnyReflections = async () => {
    const highlights = await getEntriesWithHighlights();
    setHasAnyReflections(highlights.length > 0);
  };

  useFocusEffect(
    useCallback(() => {
      // Keep these separate so the UI can render today entry ASAP.
      // We still want to know whether the DB is completely empty for the "Write Today's Win" button.
      loadTodayEntry();
      loadHasAnyReflections();
    }, [todayDate])
  );

  const handleEditReflection = () => {
    if (entry) {
      // Navigate to edit screen in nested stack (tabs stay visible)
      (navigation as any).navigate('ReflectionCheckInEdit', {
        mood: entry.mood,
        highlight: entry.highlight,
        editMode: true,
        date: todayDate,
      });
    } else {
      // Shouldn't happen, but fallback
      (navigation as any).navigate('MoodCheckInEdit');
    }
  };

  const handleEditMood = () => {
    if (entry) {
      // Navigate to mood edit screen in nested stack (tabs stay visible)
      (navigation as any).navigate('MoodCheckInEdit', {
        existingMood: entry.mood,
        existingHighlight: entry.highlight,
        existingDate: todayDate,
        editMode: true,
      });
    } else {
      (navigation as any).navigate('MoodCheckInEdit');
    }
  };

  const handleStartNewReflection = () => {
    // "Edit flow" is used here so we stay within the Today tab stack.
    (navigation as any).navigate('MoodCheckInEdit', {
      editMode: true,
      existingDate: todayDate,
    });
  };

  // If no entry exists, show empty state
  if (!entry) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Today</Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {formatDisplayDate(todayDate)}
            </Text>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No entry yet for today
            </Text>

            {hasAnyReflections === false && (
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors.buttonPrimary }]}
                onPress={handleStartNewReflection}
                activeOpacity={0.8}
              >
                <Text style={[styles.emptyButtonText, { color: colors.buttonPrimaryText }]}>
                  Write Today's Win
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const mood = entry.mood ? getMoodById(entry.mood) : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Today</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {formatDisplayDate(todayDate)}
          </Text>
        </View>

        {/* Reflection Blob Card - Tappable */}
        <BlobCard variant="reflection" onPress={handleEditReflection} style={styles.reflectionCard}>
          <Text style={[styles.reflectionText, { color: colors.textPrimary }]}>
            {entry.highlight || 'Tap to add a reflection...'}
          </Text>
        </BlobCard>

        {/* Mood Icon - Tappable */}
        {entry.mood && (
          <View style={styles.moodIconWrapper}>
            <TouchableOpacity
              onPress={handleEditMood}
              style={styles.moodContainer}
              activeOpacity={0.7}
            >
              <MoodIcon moodValue={entry.mood} size="large" showBlob={true} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 52,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 25,
  },
  reflectionCard: {
    marginBottom: 24,
    minHeight: 120,
  },
  reflectionText: {
    fontSize: 22,
    lineHeight: 28,
  },
  moodIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 32,
    marginBottom: 20,
  },
  moodContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
