import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MOODS } from '../constants/moods';

interface MoodSelectorProps {
  selectedMood: number | null;
  onSelectMood: (mood: number) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>How are you feeling today?</Text>
      <View style={styles.moodGrid}>
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.value;
          return (
            <TouchableOpacity
              key={mood.value}
              style={[
                styles.moodButton,
                isSelected && {
                  backgroundColor: mood.color,
                  transform: [{ scale: 1.1 }],
                },
              ]}
              onPress={() => onSelectMood(mood.value)}
            >
              <Text style={styles.emoji}>{mood.emoji}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  isSelected && styles.moodLabelSelected,
                ]}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    minWidth: 60,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  moodLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});