import React from 'react';
import { Dimensions, TouchableOpacity } from 'react-native';
import { Text, StyleSheet } from 'react-native';

interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
}

const CommunButton: React.FC<ButtonProps> = ({ label, onClick, disabled = false, className = '' }) => {
    const screenWidth = Dimensions.get("window").width
      const screenHeight = Dimensions.get("window").height;
    const styles = StyleSheet.create({
buttonStyle: {
    backgroundColor: "#4a90e2",
   padding: 16,
    borderRadius: 8,
    alignItems: "center",
    },
    buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    },
    });
    

    const hoverStyle: React.CSSProperties = {
        backgroundColor: disabled ? '#d3d3d3' : '#0056b3',
    };

    return (
        <TouchableOpacity style={styles.buttonStyle} onPress={onClick} disabled={disabled}>
                <Text style={styles.buttonText}>{label}</Text>
              </TouchableOpacity>
    );
};

export default CommunButton;