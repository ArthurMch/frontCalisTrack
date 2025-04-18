// @/components/AppModal.tsx
import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Dimensions 
} from "react-native";

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  confirmButton?: {
    text: string;
    onPress: () => void;
  };
  cancelButton?: {
    text: string;
    onPress: () => void;
  };
}

const AppModal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  confirmButton,
  cancelButton
}) => {
  // Définir les couleurs en fonction du type
  const getTitleColor = () => {
    switch (type) {
      case 'success': return '#2ecc71';
      case 'error': return '#e74c3c';
      case 'info': 
      default: return '#3498db';
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'success': return styles.successButton;
      case 'error': return styles.errorButton;
      case 'info': 
      default: return styles.infoButton;
    }
  };

  // Si on est en mode confirmation (avec deux boutons)
  const isConfirmation = confirmButton && cancelButton;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={isConfirmation ? undefined : onClose}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: getTitleColor() }]}>
              {title}
            </Text>
          </View>
          
          <View style={styles.modalBody}>
            <Text style={styles.modalMessage}>{message}</Text>
          </View>
          
          <View style={[
            styles.modalFooter, 
            isConfirmation && styles.confirmFooter
          ]}>
            {isConfirmation ? (
              // Mode avec deux boutons
              <>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={cancelButton?.onPress}
                >
                  <Text style={[styles.modalButtonText, { color: '#333' }]}>
                    {cancelButton?.text || 'Annuler'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, getButtonStyle()]}
                  onPress={confirmButton?.onPress}
                >
                  <Text style={styles.modalButtonText}>
                    {confirmButton?.text || 'Confirmer'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              // Mode avec un seul bouton
              <TouchableOpacity
                style={[styles.modalButton, getButtonStyle()]}
                onPress={onClose}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const screenWidth = Dimensions.get("window").width;
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: screenWidth * 0.8,
    maxWidth: 330,
    minHeight: 180,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalBody: {
    padding: 20,
    alignItems: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    alignItems: "center",
  },
  confirmFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  errorButton: {
    backgroundColor: "#e74c3c",
  },
  successButton: {
    backgroundColor: "#2ecc71",
  },
  infoButton: {
    backgroundColor: "#3498db",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
});

export default AppModal;