import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { deleteAllEntries } from '../db/database';
import { useTheme } from '../context/ThemeContext';

const NOTIFICATION_TIME_KEY = 'notification_time';
const NOTIFICATION_SCHEDULED_KEY = 'notification_scheduled';

export const SettingsScreen: React.FC = () => {
  const { theme, setTheme, colors, activeTheme } = useTheme();
  const [notificationHour, setNotificationHour] = useState(21);
  const [notificationMinute, setNotificationMinute] = useState(0);

  useEffect(() => {
    loadNotificationTime();
  }, []);

  const loadNotificationTime = async () => {
    try {
      const saved = await AsyncStorage.getItem(NOTIFICATION_TIME_KEY);
      if (saved) {
        const { hour, minute } = JSON.parse(saved);
        setNotificationHour(hour);
        setNotificationMinute(minute);
      }
    } catch (error) {
      console.error('Error loading notification time:', error);
    }
  };

  const updateNotificationTime = async (hour: number, minute: number) => {
    try {
      // Save new time
      await AsyncStorage.setItem(
        NOTIFICATION_TIME_KEY,
        JSON.stringify({ hour, minute })
      );
      
      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Reschedule with new time
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Small Wins 🌟',
          body: "What's one good thing that happened today?",
          data: { screen: 'Today' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'default',
        },
      });

      setNotificationHour(hour);
      setNotificationMinute(minute);
      
      Alert.alert(
        'Reminder Updated',
        `Daily reminder set for ${formatTime(hour, minute)}`
      );
    } catch (error) {
      console.error('Error updating notification:', error);
      Alert.alert('Error', 'Failed to update reminder time');
    }
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your reflections and cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllEntries();
              Alert.alert('Success', 'All data has been deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete data');
            }
          },
        },
      ]
    );
  };

  const TimeOption: React.FC<{ hour: number; minute: number; label: string }> = ({
    hour,
    minute,
    label,
  }) => {
    const isSelected = notificationHour === hour && notificationMinute === minute;
    return (
      <TouchableOpacity
        style={[
          styles.timeOption,
          {
            backgroundColor: isSelected ? colors.primary : colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={() => updateNotificationTime(hour, minute)}
      >
        <Text
          style={[
            styles.timeText,
            { color: isSelected ? '#FFFFFF' : colors.text },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
  }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Settings ⚙️
          </Text>
        </View>

        {/* Theme Settings */}
        <SettingSection title="Appearance">
          <View style={styles.themeButtons}>
            {(['light', 'dark', 'auto'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: theme === t ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setTheme(t)}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    { color: theme === t ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {t === 'light' ? '☀️ Light' : t === 'dark' ? '🌙 Dark' : '🔄 Auto'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingSection>

        {/* Notification Time */}
        <SettingSection title="Daily Reminder">
          <Text style={[styles.currentTime, { color: colors.textSecondary }]}>
            Current: {formatTime(notificationHour, notificationMinute)}
          </Text>
          <View style={styles.timeGrid}>
            <TimeOption hour={8} minute={0} label="8:00 AM" />
            <TimeOption hour={12} minute={0} label="12:00 PM" />
            <TimeOption hour={18} minute={0} label="6:00 PM" />
            <TimeOption hour={21} minute={0} label="9:00 PM" />
            <TimeOption hour={22} minute={0} label="10:00 PM" />
            <TimeOption hour={23} minute={0} label="11:00 PM" />
          </View>
        </SettingSection>

        {/* Danger Zone */}
        <SettingSection title="Data">
          <TouchableOpacity
            style={[styles.dangerButton, { borderColor: colors.danger }]}
            onPress={handleResetData}
          >
            <Text style={[styles.dangerButtonText, { color: colors.danger }]}>
              🗑️ Reset All Data
            </Text>
          </TouchableOpacity>
          <Text style={[styles.dangerWarning, { color: colors.textSecondary }]}>
            This will permanently delete all reflections
          </Text>
        </SettingSection>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Small Wins v1.0
          </Text>
        </View>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  currentTime: {
    fontSize: 14,
    marginBottom: 12,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dangerButton: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerWarning: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 12,
  },
});