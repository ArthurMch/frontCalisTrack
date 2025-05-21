import 'react-datepicker/dist/react-datepicker.css';
import '@/global.css';
import React, { useState, useEffect, JSX } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  StyleSheet,
  ViewStyle,
  TextStyle
} from 'react-native';

const isWeb = Platform.OS === 'web';
let ReactDatePicker: any = null;
if (isWeb) {
  // @ts-ignore
  ReactDatePicker = require('react-datepicker').default;
}

interface CustomDatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  format?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  style?: ViewStyle;
}

interface CalendarDateObject {
  date: Date;
  isCurrentMonth: boolean;
  isSelectable: boolean;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value = new Date(),
  onChange,
  format = 'dd/MM/yyyy',
  minDate = new Date(1900, 0, 1),
  maxDate = new Date(2100, 11, 31),
  disabled = false,
  style = {},
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(value || new Date());
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(selectedDate));
  const [displayedDates, setDisplayedDates] = useState<CalendarDateObject[]>([]);

  useEffect(() => {
    generateCalendarDates();
  }, [currentMonth]);

  useEffect(() => {
    setSelectedDate(value || new Date());
    setCurrentMonth(new Date(value || new Date()));
  }, [value]);

  const formatDate = (date: Date): string => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return format
      .replace('dd', day)
      .replace('MM', month)
      .replace('yyyy', year.toString());
  };

  const generateCalendarDates = (): void => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - firstDay.getDay());
    const dates = [];
    const totalDays = 42;
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDay);
      currentDate.setDate(startDay.getDate() + i);
      const isCurrentMonth = currentDate.getMonth() === month;
      const minDateCopy = new Date(minDate);
      const maxDateCopy = new Date(maxDate);
      const isSelectable =
        currentDate >= new Date(minDateCopy.setHours(0, 0, 0, 0)) &&
        currentDate <= new Date(maxDateCopy.setHours(23, 59, 59, 999));
      dates.push({
        date: new Date(currentDate),
        isCurrentMonth,
        isSelectable
      });
    }
    setDisplayedDates(dates);
  };

  const changeMonth = (increment: number): void => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
  };

  const handleDateSelection = (date: Date): void => {
    setSelectedDate(date);
    if (onChange) {
      onChange(date);
    }
    setModalVisible(false);
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const renderCalendarHeader = (): JSX.Element => (
    <View style={styles.calendarHeader}>
      <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
        <Text style={styles.arrowText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.monthTitle}>
        {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </Text>
      <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowButton}>
        <Text style={styles.arrowText}>→</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDaysOfWeek = (): JSX.Element => {
    const daysOfWeek: string[] = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
    return (
      <View style={styles.daysOfWeekRow}>
        {daysOfWeek.map((day, index) => (
          <View key={index} style={styles.dayOfWeekCell}>
            <Text style={styles.dayOfWeekText}>{day}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCalendarDates = (): JSX.Element => {
    const rows: CalendarDateObject[][] = [];
    for (let i = 0; i < displayedDates.length; i += 7) {
      const week = displayedDates.slice(i, i + 7);
      rows.push(week);
    }
    return (
      <View style={styles.calendarGrid}>
        {rows.map((week, rowIndex) => (
          <View key={`week-${rowIndex}`} style={styles.weekRow}>
            {week.map((dateObj, colIndex) => {
              const isSelected = isDateSelected(dateObj.date);
              return (
                <TouchableOpacity
                  key={`date-${rowIndex}-${colIndex}`}
                  style={[
                    styles.dateCell,
                    !dateObj.isCurrentMonth && styles.differentMonthDate,
                    !dateObj.isSelectable && styles.disabledDate,
                    isSelected && styles.selectedDate
                  ]}
                  onPress={() => {
                    if (dateObj.isSelectable) {
                      handleDateSelection(dateObj.date);
                    }
                  }}
                  disabled={!dateObj.isSelectable}
                >
                  <Text style={[
                    styles.dateText,
                    !dateObj.isCurrentMonth && styles.differentMonthText,
                    !dateObj.isSelectable && styles.disabledDateText,
                    isSelected && styles.selectedDateText
                  ]}>
                    {dateObj.date.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  // Rendu pour le web avec react-datepicker
  if (isWeb && ReactDatePicker) {
    return (
      <div style={{ width: '100%', ...(Object.fromEntries(Object.entries(style).filter(([_, v]) => v !== null))) }}>
        <ReactDatePicker
          selected={selectedDate}
          onChange={(date: Date) => {
            setSelectedDate(date);
            onChange(date);
          }}
          dateFormat={format.replace('yyyy', 'yyyy').replace('dd', 'dd').replace('MM', 'MM')}
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          portalId="datepicker-portal"
          customInput={
            <button
              style={{
                width: '100%',
                backgroundColor: disabled ? '#e0e0e0' : '#f0f0f0',
                padding: 15,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#ccc',
                justifyContent: 'center',
                fontSize: 16,
                color: disabled ? '#999' : '#333',
                cursor: disabled ? 'not-allowed' : 'pointer'
              }}
              disabled={disabled}
            >
              {selectedDate ? formatDate(selectedDate) : 'Sélectionner une date'}
            </button>
          }
        />
      </div>
    );
  }

  // Rendu mobile (modal custom)
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.pickerButton, disabled && styles.disabledButton]}
        onPress={() => setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={[styles.dateDisplay, disabled && styles.disabledText]}>
          {selectedDate ? formatDate(selectedDate) : 'Sélectionner une date'}
        </Text>
      </TouchableOpacity>
      {!isWeb && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sélectionnez une date</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButton}>×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.calendarContainer}>
                {renderCalendarHeader()}
                {renderDaysOfWeek()}
                {renderCalendarDates()}
              </ScrollView>
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.todayButton}
                  onPress={() => {
                    const today = new Date();
                    setCurrentMonth(today);
                    handleDateSelection(today);
                  }}
                >
                  <Text style={styles.todayButtonText}>Aujourd'hui</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    width: '100%',
  } as ViewStyle,
  pickerButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
  } as ViewStyle,
  dateDisplay: {
    fontSize: 16,
  } as TextStyle,
  disabledButton: {
    backgroundColor: '#e0e0e0',
    opacity: 0.7,
  } as ViewStyle,
  disabledText: {
    color: '#999',
  } as TextStyle,
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  } as ViewStyle,
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  } as ViewStyle,
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  } as ViewStyle,
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  } as TextStyle,
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
  } as TextStyle,
  calendarContainer: {
    padding: 10,
  } as ViewStyle,
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  } as ViewStyle,
  monthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,
  arrowButton: {
    padding: 10,
  } as ViewStyle,
  arrowText: {
    fontSize: 20,
  } as TextStyle,
  daysOfWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  } as ViewStyle,
  dayOfWeekCell: {
    flex: 1,
    alignItems: 'center',
  } as ViewStyle,
  dayOfWeekText: {
    fontWeight: 'bold',
    fontSize: 14,
  } as TextStyle,
  calendarGrid: {
    marginBottom: 10,
  } as ViewStyle,
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  } as ViewStyle,
  dateCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  } as ViewStyle,
  dateText: {
    fontSize: 14,
  } as TextStyle,
  differentMonthDate: {
    opacity: 0.4,
  } as ViewStyle,
  differentMonthText: {
    color: '#999',
  } as TextStyle,
  disabledDate: {
    opacity: 0.3,
  } as ViewStyle,
  disabledDateText: {
    color: '#aaa',
  } as TextStyle,
  selectedDate: {
    backgroundColor: '#007bff',
  } as ViewStyle,
  selectedDateText: {
    color: 'white',
    fontWeight: 'bold',
  } as TextStyle,
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  } as ViewStyle,
  todayButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  } as ViewStyle,
  todayButtonText: {
    color: 'white',
    fontWeight: 'bold',
  } as TextStyle,
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  } as ViewStyle,
  cancelButtonText: {
    color: '#333',
  } as TextStyle,
});
 
export default CustomDatePicker;