import 'react-datepicker/dist/react-datepicker.css';
import '@/global.css';
import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  focused: boolean;
}) {
  const { name, color, focused } = props;
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <FontAwesome size={22} style={{ marginBottom: 0 }} name={name} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  const activeColor = '#4a90e2'; 
  const inactiveColor = '#8E8E93';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Training',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="bicycle" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercise"
        options={{
          title: 'Exercise',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="heartbeat" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 110,
    backgroundColor: '#ffffff',
    borderTopWidth: 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.24)',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 15,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)', 
  },
});