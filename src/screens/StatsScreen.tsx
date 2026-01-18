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
import { Calendar } from 'react-native-calendars';
import { getAllEntries, getStreakStats, StreakStats } from '../db/database';
import { getMoodById } from '../constants/moods';
import { useTheme } from '../context/ThemeContext';

export const StatsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [markedDates, setMarkedDates] = useState<any>({});
  const [stats, setStats] = useState<StreakStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalEntries: 0,
    thisWeekCount: 0,
    thisMonthCount: 0,
  });

  const loadData = async () => {
    const entries = await getAllEntries();
    const streakData = await getStreakStats();
    
    // Build marked dates for calendar
    const marked: any = {};
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
              color: colors.buttonPrimaryText,
              fontWeight: 'bold',
            },
          },
        };
      }
    });

    setMarkedDates(marked);
    setStats(streakData);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    onPress?: () => void;
  }> = ({ title, value, subtitle, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: colors.cardBase }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: colors.tabActive }]}>
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Stats 📊
          </Text>
        </View>

        {/* Mood Calendar */}
        <View style={styles.calendarSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Mood Colors 🎨
          </Text>
          
          <Calendar
            markingType="custom"
            markedDates={markedDates}
            theme={{
              backgroundColor: colors.background,
              calendarBackground: colors.cardBase,
              textSectionTitleColor: colors.textSecondary,
              selectedDayBackgroundColor: colors.tabActive,
              selectedDayTextColor: colors.buttonPrimaryText,
              todayTextColor: colors.tabActive,
              dayTextColor: colors.textPrimary,
              textDisabledColor: colors.textTertiary,
              monthTextColor: colors.textPrimary,
              textMonthFontWeight: 'bold',
              textMonthFontSize: 18,
            }}
            style={[styles.calendar, { backgroundColor: colors.cardBase }]}
          />
        </View>

        {/* Streak Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Current Streak"
            value={`${stats.currentStreak} 🔥`}
            subtitle={stats.currentStreak > 0 ? 'Keep it up!' : ''}
          />
          <StatCard
            title="Longest Streak"
            value={`${stats.longestStreak} 🏆`}
          />
        </View>

        {/* Total Entries - Tappable */}
        <TouchableOpacity
          style={[styles.totalCard, { backgroundColor: colors.cardBase, borderColor: colors.border }]}
          onPress={() => navigation.navigate('PastWins' as never)}
        >
          <View style={styles.totalCardContent}>
            <View>
              <Text style={[styles.totalValue, { color: colors.textPrimary }]}>
                {stats.totalEntries}
              </Text>
              <Text style={[styles.totalTitle, { color: colors.textSecondary }]}>
                Total Reflections 🌟
              </Text>
            </View>
            <Text style={[styles.arrow, { color: colors.tabActive }]}>→</Text>
          </View>
        </TouchableOpacity>

        {stats.totalEntries === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Start tracking to see your stats!
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
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  statSubtitle: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  totalCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  totalCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  totalTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  calendarSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
