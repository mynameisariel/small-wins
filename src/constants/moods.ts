import { ImageSourcePropType } from 'react-native';

// Centralized mood image mapping
// Note: If an image is missing, it will be handled gracefully in components
export const MOOD_IMAGES: Record<string, ImageSourcePropType> = {
  happy: require('../../assets/happy.png'),
  disappointed: require('../../assets/disappointed.png'),
  content: require('../../assets/content.png'),
  sad: require('../../assets/sad.png'),
  tired: require('../../assets/tired.png'),
  normal: require('../../assets/normal.png'),
  // hurt.png doesn't exist in assets - using sad.png as fallback
  hurt: require('../../assets/sad.png'),
  anxious: require('../../assets/anxious.png'),
  angry: require('../../assets/angry.png'),
  sleepy: require('../../assets/sleepy.png'),
  confident: require('../../assets/confident.png'),
  numb: require('../../assets/numb.png'),
};

export const MOODS = [
  { value: 1, label: 'Happy', color: '#F59E0B', key: 'happy' },
  { value: 2, label: 'Disappointed', color: '#6B7280', key: 'disappointed' },
  { value: 3, label: 'Content', color: '#10B981', key: 'content' },
  { value: 4, label: 'Sad', color: '#3B82F6', key: 'sad' },
  { value: 5, label: 'Tired', color: '#6366F1', key: 'tired' },
  { value: 6, label: 'Normal', color: '#9CA3AF', key: 'normal' },
  { value: 7, label: 'Hurt', color: '#EF4444', key: 'hurt' },
  { value: 8, label: 'Anxious', color: '#EC4899', key: 'anxious' },
  { value: 9, label: 'Angry', color: '#DC2626', key: 'angry' },
  { value: 10, label: 'Sleepy', color: '#8B5CF6', key: 'sleepy' },
  { value: 11, label: 'Confident', color: '#3f261c', key: 'confident' },
  { value: 12, label: 'Numb', color: '#64748B', key: 'numb' },
];

export const getMoodById = (value: number) => {
  return MOODS.find(m => m.value === value) || MOODS[5]; // Default to Normal
};

export const getMoodImage = (moodKey: string): ImageSourcePropType | null => {
  return MOOD_IMAGES[moodKey.toLowerCase()] || null;
};