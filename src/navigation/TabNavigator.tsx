import React from 'react';
import { Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TodayScreen } from '../screens/TodayScreen';
import { WinsScreen } from '../screens/WinsScreen';
import { MoodScreen } from '../screens/MoodScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8, // <-- INCREASED for iOS
          height: Platform.OS === 'ios' ? 88 : 60, // <-- INCREASED for iOS
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 4, // <-- ADJUSTED
        },
        tabBarIconStyle: {
          marginTop: 4, // <-- ADDED for better spacing
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarLabel: 'Today',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>📝</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Wins"
        component={WinsScreen}
        options={{
          tabBarLabel: 'Small Wins',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🌟</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Moods"
        component={MoodScreen}
        options={{
          tabBarLabel: 'Mood Colors',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🎨</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};