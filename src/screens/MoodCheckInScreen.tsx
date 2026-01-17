import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MOODS } from '../constants/moods';
import { useTheme } from '../context/ThemeContext';

export const MoodCheckInScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const handleSave = () => {
    if (selectedMood === null) {
      return; // Disabled button handles this
    }
    // Navigate to ReflectionCheckInScreen with selected mood
    navigation.navigate('ReflectionCheckIn' as never, { mood: selectedMood } as never);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            In this moment, how do you feel?
          </Text>
        </View>

        <View style={styles.moodGrid}>
          {MOODS.map((mood) => {
            const isSelected = selectedMood === mood.value;
            return (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.moodButton,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => setSelectedMood(mood.value)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.moodIcon,
                    {
                      backgroundColor: isSelected
                        ? 'rgba(255,255,255,0.2)'
                        : 'rgba(0,0,0,0.05)',
                    },
                  ]}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                </View>
                <Text
                  style={[
                    styles.moodLabel,
                    {
                      color: isSelected ? colors.primary : colors.text,
                    },
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor:
                selectedMood !== null ? colors.primary : colors.border,
            },
          ]}
          onPress={handleSave}
          disabled={selectedMood === null}
          activeOpacity={selectedMood !== null ? 0.7 : 1}
        >
          <Text
            style={[
              styles.saveButtonText,
              { color: selectedMood !== null ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 36,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  moodButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  moodIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
