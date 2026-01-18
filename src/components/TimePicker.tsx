import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';

interface TimePickerProps {
  hour: number;
  minute: number;
  onTimeChange: (hour: number, minute: number) => void;
}

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 40;

// Generate hours (1-12 for 12-hour format with AM/PM, or 0-23 for 24-hour)
const generateHours = (): number[] => {
  return Array.from({ length: 24 }, (_, i) => i); // 0-23 for 24-hour format
};

// Generate minutes (0-59)
const generateMinutes = (): number[] => {
  return Array.from({ length: 60 }, (_, i) => i);
};

const formatHour = (hour: number): string => {
  return hour.toString().padStart(2, '0');
};

const formatMinute = (minute: number): string => {
  return minute.toString().padStart(2, '0');
};

const formatDisplayTime = (hour: number, minute: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${formatMinute(minute)} ${period}`;
};

export const TimePicker: React.FC<TimePickerProps> = ({
  hour: initialHour,
  minute: initialMinute,
  onTimeChange,
}) => {
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to initial values
    if (hourScrollRef.current) {
      hourScrollRef.current.scrollTo({
        y: hour * ITEM_HEIGHT,
        animated: false,
      });
    }
    if (minuteScrollRef.current) {
      minuteScrollRef.current.scrollTo({
        y: minute * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, []);

  useEffect(() => {
    onTimeChange(hour, minute);
  }, [hour, minute]);

  const hours = generateHours();
  const minutes = generateMinutes();

  const handleHourScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const newHour = Math.max(0, Math.min(23, index));
    if (newHour !== hour) {
      setHour(newHour);
    }
  };

  const handleMinuteScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const newMinute = Math.max(0, Math.min(59, index));
    if (newMinute !== minute) {
      setMinute(newMinute);
    }
  };

  const renderPickerItems = (items: number[], selectedValue: number, onScroll: (event: any) => void) => {
    return (
      <ScrollView
        ref={selectedValue === hour ? hourScrollRef : minuteScrollRef}
        style={styles.pickerColumn}
        contentContainerStyle={styles.pickerContent}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onScroll}
        onScrollEndDrag={onScroll}
      >
        {items.map((item) => (
          <View key={item} style={styles.pickerItem}>
            <Text
              style={[
                styles.pickerItemText,
                selectedValue === item && styles.pickerItemTextSelected,
              ]}
            >
              {item.toString().padStart(2, '0')}
            </Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        {renderPickerItems(hours, hour, handleHourScroll)}
        <Text style={styles.separator}>:</Text>
        {renderPickerItems(minutes, minute, handleMinuteScroll)}
      </View>
      <Text style={styles.displayTime}>
        {formatDisplayTime(hour, minute)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT * 5, // Show 5 items
    backgroundColor: colors.cardBase,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  pickerColumn: {
    flex: 1,
    maxHeight: ITEM_HEIGHT * 5,
  },
  pickerContent: {
    paddingVertical: ITEM_HEIGHT * 2, // Padding to center items
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  pickerItemTextSelected: {
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  separator: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  displayTime: {
    marginTop: 16,
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
