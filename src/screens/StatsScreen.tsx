import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Calendar, DateData } from 'react-native-calendars';
import { getAllEntries, getStreakStats, StreakStats } from '../db/database';
import { getMoodById, getMoodImage } from '../constants/moods';
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
    
    // Build marked dates for calendar - store mood data for dayComponent
    const marked: any = {};
    entries.forEach((entry) => {
      if (entry.mood) {
        const mood = getMoodById(entry.mood);
        marked[entry.date] = {
          selected: true,
          moodValue: entry.mood, // Store mood value for dayComponent
          moodKey: mood.key || mood.label.toLowerCase(),
        };
      }
    });

    setMarkedDates(marked);
    setStats(streakData);
  };

  // Custom day component to show mood icon below date number
  const renderDay = (props: any) => {
    const day = props.date || props;
    const dateStr = day.dateString;
    const marking = markedDates[dateStr];
    const hasMood = marking && marking.moodValue;
    const moodKey = marking?.moodKey;
    const moodImage = moodKey ? getMoodImage(moodKey) : null;
    const state = props.state || day.state;

    return (
      <View style={styles.dayContainer}>
        <Text
          style={[
            styles.dayText,
            {
              color: state === 'disabled' ? colors.textTertiary : colors.textPrimary,
              fontSize: hasMood ? 12 : 14, // Smaller text when mood icon is present
            },
          ]}
        >
          {day.day}
        </Text>
        {hasMood && moodImage && (
          <Image
            source={moodImage}
            style={styles.dayMoodIcon}
            resizeMode="contain"
          />
        )}
      </View>
    );
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
    iconSource?: any;
    onPress?: () => void;
  }> = ({ title, value, subtitle, iconSource, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: colors.cardBase }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.statValueContainer}>
        <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
        {iconSource && (
          <Image source={iconSource} style={styles.statIcon} resizeMode="contain" />
        )}
      </View>
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
            Stats
          </Text>
        </View>

        {/* Mood Calendar */}
        <View style={styles.calendarSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Mood Colors
          </Text>
          
          <Calendar
            markingType="custom"
            markedDates={markedDates}
            dayComponent={renderDay}
            theme={{
              backgroundColor: colors.background,
              calendarBackground: colors.cardBase,
              textSectionTitleColor: colors.textSecondary,
              selectedDayBackgroundColor: 'transparent', // No background highlight
              selectedDayTextColor: colors.textPrimary,
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
            value={stats.currentStreak}
            subtitle={stats.currentStreak > 0 ? 'Keep it up!' : ''}
            iconSource={require('../../assets/daystreak.png')}
          />
          <StatCard
            title="Longest Streak"
            value={stats.longestStreak}
            iconSource={require('../../assets/longeststreak.png')}
          />
        </View>

        {/* Total Entries - Tappable */}
        <TouchableOpacity
          style={[styles.totalCard, { backgroundColor: colors.cardBase, borderColor: colors.border }]}
          onPress={() => navigation.navigate('PastWins' as never)}
        >
          <View style={styles.totalCardContent}>
            <View style={styles.totalLeftContent}>
              <View style={styles.totalValueContainer}>
                <Text style={[styles.totalValue, { color: colors.textPrimary }]}>
                  {stats.totalEntries}
                </Text>
                <Image
                  source={require('../../assets/totaltracked.png')}
                  style={styles.totalIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.totalTitle, { color: colors.textSecondary }]}>
                Total Reflections
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
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 6,
  },
  statIcon: {
    width: 24,
    height: 24,
  },
  totalValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalIcon: {
    width: 32,
    height: 32,
    marginLeft: 8,
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
  totalLeftContent: {
    flex: 1,
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
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    minHeight: 50,
    width: '100%',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 1,
  },
  dayMoodIcon: {
    width: 18,
    height: 18,
    marginTop: 1,
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
