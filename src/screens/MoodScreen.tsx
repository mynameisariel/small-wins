import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, DateData } from 'react-native-calendars';
import { getAllEntries, Entry } from '../db/database';
import { getMoodById } from '../constants/moods';

export const MoodScreen: React.FC = () => {
  const [markedDates, setMarkedDates] = useState<any>({});
  const [stats, setStats] = useState({ total: 0, withMood: 0 });

  const loadMoodData = async () => {
    const entries = await getAllEntries();
    const marked: any = {};
    let moodCount = 0;

    entries.forEach((entry) => {
      if (entry.mood) {
        const mood = getMoodById(entry.mood);
        marked[entry.date] = {
          selected: true,
          selectedColor: mood.color,
          customStyles: {
            container: {
              backgroundColor: mood.color,
            },
            text: {
              color: '#FFFFFF',
              fontWeight: 'bold',
            },
          },
        };
        moodCount++;
      }
    });

    setMarkedDates(marked);
    setStats({ total: entries.length, withMood: moodCount });
  };

  useFocusEffect(
    useCallback(() => {
      loadMoodData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Mood Colors 🎨</Text>
          <Text style={styles.subtitle}>
            {stats.withMood} days tracked
          </Text>
        </View>

        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Your moods:</Text>
          <View style={styles.legendGrid}>
            {[
              { emoji: '😞', label: 'Rough', color: '#6B7280' },
              { emoji: '😕', label: 'Meh', color: '#3B82F6' },
              { emoji: '😊', label: 'Good', color: '#10B981' },
              { emoji: '😄', label: 'Great', color: '#F59E0B' },
              { emoji: '🤩', label: 'Amazing', color: '#EC4899' },
            ].map((mood) => (
              <View key={mood.label} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: mood.color }]}
                />
                <Text style={styles.legendLabel}>
                  {mood.emoji} {mood.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Calendar
          markingType="custom"
          markedDates={markedDates}
          theme={{
            backgroundColor: '#FFFFFF',
            calendarBackground: '#FFFFFF',
            textSectionTitleColor: '#6B7280',
            selectedDayBackgroundColor: '#3B82F6',
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: '#3B82F6',
            dayTextColor: '#111827',
            textDisabledColor: '#D1D5DB',
            monthTextColor: '#111827',
            textMonthFontWeight: 'bold',
            textMonthFontSize: 18,
          }}
          style={styles.calendar}
        />

        {stats.withMood === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Start tracking your moods to see{'\n'}the colors of your life!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
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
  legendContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  legendGrid: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  calendar: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
});