import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';



export default function TrainingDetails() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Training Details</Text>
        <FontAwesome name="info-circle" size={24} color="black" />
        </View>
    );
    }