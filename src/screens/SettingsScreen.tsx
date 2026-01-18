import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { deleteAllEntries, generateTestData } from '../db/database';
import { useTheme } from '../context/ThemeContext';
import { TimePicker } from '../components/TimePicker';

const NOTIFICATION_TIME_KEY = 'notification_time';
const NOTIFICATION_SCHEDULED_KEY = 'notification_scheduled';

export const SettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [notificationHour, setNotificationHour] = useState(21);
  const [notificationMinute, setNotificationMinute] = useState(0);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      
      console.log(`Reminder updated to ${formatTime(hour, minute)}`);
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

  const handleGenerateTestData = () => {
    Alert.alert(
      'Generate Test Data',
      'This will create 2 months worth of sample reflections for testing. Existing entries will be updated if dates overlap.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            try {
              await generateTestData();
              Alert.alert('Success', 'Test data generated! Check your Stats tab.');
            } catch (error) {
              Alert.alert('Error', 'Failed to generate test data');
            }
          },
        },
      ]
    );
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

  const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
  }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
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
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Settings ⚙️
          </Text>
        </View>

        {/* Notification Time */}
        <SettingSection title="Daily Reminders">
          <TimePicker
            hour={notificationHour}
            minute={notificationMinute}
            onTimeChange={(hour, minute) => {
              setNotificationHour(hour);
              setNotificationMinute(minute);
              // Debounce notification update
              if (updateTimerRef.current) {
                clearTimeout(updateTimerRef.current);
              }
              updateTimerRef.current = setTimeout(() => {
                updateNotificationTime(hour, minute);
              }, 1000);
            }}
          />
        </SettingSection>

        {/* Data Management */}
        <SettingSection title="Data">
          <TouchableOpacity
            style={[styles.testButton, { borderColor: colors.tabActive, backgroundColor: colors.cardBase }]}
            onPress={handleGenerateTestData}
          >
            <Text style={[styles.testButtonText, { color: colors.tabActive }]}>
              Generate Test Data (2 months)
            </Text>
          </TouchableOpacity>
          <Text style={[styles.testDescription, { color: colors.textSecondary }]}>
            Create sample reflections for testing
          </Text>
          
          <TouchableOpacity
            style={[styles.dangerButton, { borderColor: colors.danger, marginTop: 16 }]}
            onPress={handleResetData}
          >
            <Text style={[styles.dangerButtonText, { color: colors.danger }]}>
              Reset All Data
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
  testButton: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  testDescription: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
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
