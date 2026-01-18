import React, { useState, useEffect, useCallback } from 'react';
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
import { getEntryByDate, Entry } from '../db/database';
import { getMoodById } from '../constants/moods';
import { useTheme } from '../context/ThemeContext';
import { BlobCard } from '../components/BlobCard';
import { MoodIcon } from '../components/MoodIcon';

export const TodayScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [todayDate] = useState(getTodayLocalDate());
  const [entry, setEntry] = useState<Entry | null>(null);

  const loadTodayEntry = async () => {
    const todayEntry = await getEntryByDate(todayDate);
    setEntry(todayEntry);
  };

  useFocusEffect(
    useCallback(() => {
      loadTodayEntry();
    }, [])
  );

  const handleEditReflection = () => {
    // Navigate to ReflectionCheckInScreen with existing mood and highlight for editing
    if (entry) {
      navigation.navigate('ReflectionCheckIn' as never, {
        mood: entry.mood,
        highlight: entry.highlight,
        editMode: true,
        date: todayDate,
      } as never);
    } else {
      // If no entry, go to mood check-in flow
      navigation.navigate('MoodCheckIn' as never);
    }
  };

  const handleEditMood = () => {
    // Navigate to MoodCheckInScreen with existing mood pre-selected
    if (entry?.mood) {
      // For now, just navigate to mood screen - user will select new mood
      // Then navigate to reflection screen with new mood and existing highlight
      navigation.navigate('MoodCheckIn' as never, {
        existingHighlight: entry.highlight,
        existingDate: todayDate,
        editMode: true,
      } as never);
    } else {
      navigation.navigate('MoodCheckIn' as never);
    }
  };

  // If no entry exists, this shouldn't happen (first-open flow handles it)
  // But as fallback, show empty state with prompt to create entry
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
          <TouchableOpacity
            onPress={handleEditMood}
            style={styles.moodContainer}
            activeOpacity={0.7}
          >
            <View style={styles.moodWrapper}>
              {/* Use MoodIcon component or simple placeholder for now */}
              <View style={[styles.moodBlob, { backgroundColor: colors.cardBase }]}>
                <Text style={styles.moodEmoji}>{mood?.emoji || '😊'}</Text>
              </View>
            </View>
          </TouchableOpacity>
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
  },
  reflectionCard: {
    marginBottom: 24,
    minHeight: 120,
  },
  reflectionText: {
    fontSize: 18,
    lineHeight: 28,
  },
  moodContainer: {
    alignItems: 'flex-start',
    marginTop: 8,
  },
  moodWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodBlob: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    // Irregular blob shape simulation
    borderTopLeftRadius: 35,
    borderTopRightRadius: 45,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 30,
  },
  moodEmoji: {
    fontSize: 40,
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
});
