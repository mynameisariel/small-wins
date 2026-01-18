import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MOODS, getMoodImage } from '../constants/moods';
import { useTheme } from '../context/ThemeContext';
import { Image } from 'react-native';

export const MoodCheckInScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const params = route.params as any;
  
  // Get params
  const existingMood = params?.existingMood as number | undefined;
  const existingHighlight = params?.existingHighlight as string | undefined;
  const existingDate = params?.existingDate as string | undefined;
  const editMode = params?.editMode as boolean | undefined;
  
  const [selectedMood, setSelectedMood] = useState<number | null>(existingMood || null);

  useEffect(() => {
    if (existingMood) {
      setSelectedMood(existingMood);
    }
  }, [existingMood]);

  const handleSave = () => {
    if (selectedMood === null) {
      return; // Disabled button handles this
    }
    
    if (editMode) {
      // Edit mode: navigate to reflection edit screen with existing data
      (navigation as any).navigate('ReflectionCheckInEdit', {
        mood: selectedMood,
        highlight: existingHighlight,
        editMode: true,
        date: existingDate,
      });
    } else {
      // Daily flow: navigate to reflection check-in
      (navigation as any).navigate('ReflectionCheckIn', { mood: selectedMood });
    }
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
          <Text style={[styles.title, { color: colors.textPrimary }]}>
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
                    backgroundColor: isSelected ? colors.tabActive : colors.cardBase,
                    borderColor: isSelected ? colors.tabActive : colors.border,
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
                  {getMoodImage(mood.key || mood.label.toLowerCase()) ? (
                    <Image
                      source={getMoodImage(mood.key || mood.label.toLowerCase())!}
                      style={styles.moodImage}
                      resizeMode="contain"
                    />
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.moodLabel,
                    {
                      color: isSelected ? colors.buttonPrimaryText : colors.textPrimary,
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
                selectedMood !== null ? colors.buttonPrimary : colors.buttonDisabled,
            },
          ]}
          onPress={handleSave}
          disabled={selectedMood === null}
          activeOpacity={selectedMood !== null ? 0.7 : 1}
        >
          <Text
            style={[
              styles.saveButtonText,
              { color: selectedMood !== null ? colors.buttonPrimaryText : colors.textTertiary },
            ]}
          >
            {editMode ? 'Next' : 'Save'}
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
  moodImage: {
    width: 48,
    height: 48,
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
