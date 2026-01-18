export const MOODS = [
  { value: 1, emoji: '😊', label: 'Happy', color: '#F59E0B' },
  { value: 2, emoji: '😔', label: 'Disappointed', color: '#6B7280' },
  { value: 3, emoji: '😌', label: 'Content', color: '#10B981' },
  { value: 4, emoji: '😢', label: 'Sad', color: '#3B82F6' },
  { value: 5, emoji: '😴', label: 'Tired', color: '#6366F1' },
  { value: 6, emoji: '😐', label: 'Normal', color: '#9CA3AF' },
  { value: 7, emoji: '😟', label: 'Hurt', color: '#EF4444' },
  { value: 8, emoji: '😰', label: 'Anxious', color: '#EC4899' },
  { value: 9, emoji: '😠', label: 'Angry', color: '#DC2626' },
  { value: 10, emoji: '🥱', label: 'Sleepy', color: '#8B5CF6' },
  { value: 11, emoji: '😎', label: 'Confident', color: '#06B6D4' },
  { value: 12, emoji: '😑', label: 'Numb', color: '#64748B' },
];

export const getMoodById = (value: number) => {
  return MOODS.find(m => m.value === value) || MOODS[5]; // Default to Normal
};