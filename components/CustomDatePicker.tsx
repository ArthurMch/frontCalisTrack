import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  StyleSheet
} from 'react-native';

interface CustomDatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  format?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  style?: any; // ViewStyle de React Native
}

/**
 * Interface pour un objet date affiché dans le calendrier
 */
interface CalendarDateObject {
  date: Date;
  isCurrentMonth: boolean;
  isSelectable: boolean;
}

/**
 * Composant DatePicker personnalisé compatible web et mobile
 */
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
  
  // Pour gérer différemment sur web et mobile
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    generateCalendarDates();
  }, [currentMonth]);

  useEffect(() => {
    setSelectedDate(value || new Date());
    setCurrentMonth(new Date(value || new Date()));
  }, [value]);

  // Log pour voir si le changement d'état de modalVisible est effectif
  useEffect(() => {
    console.log("Modal visible state changed:", modalVisible);
  }, [modalVisible]);

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
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    // Déterminer le premier jour à afficher (peut être du mois précédent)
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - firstDay.getDay());
    
    const dates: CalendarDateObject[] = [];
    const totalDays = 42; // 6 semaines complètes
    
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDay);
      currentDate.setDate(startDay.getDate() + i);
      
      // Déterminer si la date est dans le mois actuel
      const isCurrentMonth = currentDate.getMonth() === month;
      
      // Déterminer si la date est sélectionnable (entre min et max)
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
    
    // Fermer le modal après sélection
    setModalVisible(false);
  };

  const openDatePicker = (): void => {
    console.log("openDatePicker called, disabled:", disabled);
    if (!disabled) {
      if (isWeb) {
        // Sur le web, on utilise directement l'input natif en arrière-plan
        const input = document.getElementById('native-date-input');
        if (input) {
          (input as HTMLInputElement).click();
        }
      } else {
        // Sur mobile, on ouvre notre modal personnalisé
        console.log("Tentative d'ouverture du modal...");
        
        // Force update using a setTimeout
        setTimeout(() => {
          console.log("Setting modalVisible dans setTimeout");
          setModalVisible(true);
        }, 0);
      }
    }
  };

  const handleWebDateChange = (e: any): void => {
    const selectedDateFromInput = new Date(e.target.value);
    handleDateSelection(selectedDateFromInput);
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
    // Diviser les dates en rangées de 7 (une semaine)
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

  return (
    <View style={[styles.container, style]}>
      {/* Interface visible */}
      <TouchableOpacity
        style={[styles.pickerButton, disabled && styles.disabledButton]}
        onPress={openDatePicker}
        disabled={disabled}
      >
        <Text style={[styles.dateDisplay, disabled && styles.disabledText]}>
          {selectedDate ? formatDate(selectedDate) : 'Sélectionner une date'}
        </Text>
      </TouchableOpacity>

      {/* Support pour le web via input HTML natif (caché) */}
      {isWeb && (
        <input
          id="native-date-input"
          type="date"
          value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
          onChange={handleWebDateChange}
          min={minDate.toISOString().split('T')[0]}
          max={maxDate.toISOString().split('T')[0]}
          disabled={disabled}
          style={{ display: 'none' }}
        />
      )}

      {/* Rendu conditionnel du Modal pour éviter les problèmes potentiels */}
      {Platform.OS !== 'web' && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            console.log("Modal onRequestClose");
            setModalVisible(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sélectionnez une date</Text>
                <TouchableOpacity 
                  onPress={() => {
                    console.log("Fermeture du modal (bouton X)");
                    setModalVisible(false);
                  }}
                >
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
                  onPress={() => {
                    console.log("Fermeture du modal (bouton annuler)");
                    setModalVisible(false);
                  }}
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

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 10,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  dateDisplay: {
    fontSize: 16,
    color: '#333',
  },
  disabledText: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    padding: 5,
  },
  calendarContainer: {
    padding: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  arrowButton: {
    padding: 8,
  },
  arrowText: {
    fontSize: 18,
    color: '#007bff',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayOfWeekCell: {
    flex: 1,
    alignItems: 'center',
    padding: 5,
  },
  dayOfWeekText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  calendarGrid: {
    marginBottom: 10,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  dateCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  differentMonthDate: {
    opacity: 0.4,
  },
  differentMonthText: {
    color: '#999',
  },
  disabledDate: {
    opacity: 0.3,
  },
  disabledDateText: {
    color: '#ccc',
  },
  selectedDate: {
    backgroundColor: '#007bff',
  },
  selectedDateText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  todayButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  todayButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f44336',
    borderRadius: 5,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CustomDatePicker;