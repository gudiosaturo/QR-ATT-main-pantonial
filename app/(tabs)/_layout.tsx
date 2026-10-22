import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,

        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,

        tabBarStyle: styles.tabBar,

        tabBarItemStyle: styles.tabBarItem,

        tabBarLabelStyle: styles.tabBarLabel,

        tabBarHideOnKeyboard: true,

        headerStyle: styles.header,
        headerShadowVisible: false,

        headerTitleStyle: styles.headerTitle,
        headerTintColor: COLORS.primary,

        headerTitleAlign: 'center',

        sceneStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIcon : styles.icon}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan QR',
          tabBarLabel: 'Scan',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIcon : styles.icon}>
              <Ionicons
                name={focused ? 'qr-code' : 'qr-code-outline'}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: 'Attendance History',
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIcon : styles.icon}>
              <Ionicons
                name={focused ? 'time' : 'time-outline'}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="teacher"
        options={{
          title: 'Teacher Dashboard',
          tabBarLabel: 'Teacher',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIcon : styles.icon}>
              <Ionicons
                name={focused ? 'school' : 'school-outline'}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIcon : styles.icon}>
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    elevation: 8,
    shadowColor: COLORS.primaryDark,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },

  tabBarItem: {
    paddingVertical: 1,
  },

  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },

  header: {
    backgroundColor: COLORS.card,
  },

  headerTitle: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 17,
  },

  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    minHeight: 28,
  },

  activeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 38,
    minHeight: 30,
    borderRadius: 12,
    backgroundColor: COLORS.accentLight,
  },
});