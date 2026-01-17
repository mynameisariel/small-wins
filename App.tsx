import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Platform, Alert, View, Text, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabNavigator } from './src/navigation/TabNavigator';
import { initDb } from './src/db/database';

// Configure notification behavior - FIXED for SDK 53+
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NOTIFICATION_SCHEDULED_KEY = 'notification_scheduled';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      // Initialize database
      await initDb();

      // Request notification permissions and schedule
      await setupNotifications();

      setIsReady(true);
    } catch (error) {
      console.error('Initialization error:', error);
      Alert.alert('Error', 'Failed to initialize app');
    }
  };

  const setupNotifications = async () => {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }

      // Check if already scheduled
      const isScheduled = await AsyncStorage.getItem(NOTIFICATION_SCHEDULED_KEY);
      if (isScheduled === 'true') {
        console.log('Notifications already scheduled');
        return;
      }

      // Schedule daily notification at 9 PM - FIXED trigger format
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Small Wins 🌟',
          body: "What's one good thing that happened today?",
          data: { screen: 'Today' },
        },
        trigger: {
          // seconds: 10,
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 13,
          minute: 0,
          channelId: 'default',
        },
      });

      // Mark as scheduled
      await AsyncStorage.setItem(NOTIFICATION_SCHEDULED_KEY, 'true');
      console.log('✅ Daily notification scheduled for 9 PM');
    } catch (error) {
      console.error('Notification setup error:', error);
    }
  };

  // Handle notification tap
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        // User tapped notification - app will open to Today screen (default tab)
        console.log('Notification tapped:', response);
      }
    );

    return () => subscription.remove();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <TabNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
  },
});