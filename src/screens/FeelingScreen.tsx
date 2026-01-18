import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MOODS } from '../constants/moods';

export const FeelingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const handleSave = () => {
    if (selectedMood !== null) {
      // Navigate to Highlight screen with selected mood
      navigation.navigate('Highlight' as never, { mood: selectedMood } as never);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Feeling</Text>
          
          <View style={styles.questionContainer}>
            <Text style={styles.question}>In this moment,</Text>
            <Text style={styles.question}>how do you feel?</Text>
          </View>

          <View style={styles.moodGrid}>
            {MOODS.map((mood) => {
              const isSelected = selectedMood === mood.value;
              return (
                <TouchableOpacity
                  key={mood.value}
                  style={[
                    styles.moodButton,
                    { backgroundColor: isSelected ? mood.color : '#E5E7EB' },
                  ]}
                  onPress={() => setSelectedMood(mood.value)}
                >
                  <Text style={styles.emoji}>{mood.emoji}</Text>
                  <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, !selectedMood && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!selectedMood}
          >
            <Text style={styles.saveButtonText}>save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 40,
  },
  questionContainer: {
    marginBottom: 40,
  },
  question: {
    fontSize: 24,
    color: '#111827',
    lineHeight: 32,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
  },
  moodButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: '#374151',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '400',
  },
});