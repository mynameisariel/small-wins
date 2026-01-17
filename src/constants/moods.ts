export const MOODS = [
  { value: 1, emoji: '😞', label: 'Rough', color: '#6B7280' },
  { value: 2, emoji: '😕', label: 'Meh', color: '#3B82F6' },
  { value: 3, emoji: '😊', label: 'Good', color: '#10B981' },
  { value: 4, emoji: '😄', label: 'Great', color: '#F59E0B' },
  { value: 5, emoji: '🤩', label: 'Amazing', color: '#EC4899' },
];

export const getMoodById = (value: number) => {
  return MOODS.find(m => m.value === value) || MOODS[2];
};