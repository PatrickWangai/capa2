import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';

// Auth screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// App screens
import HomeScreen from '../screens/home/HomeScreen';
import MarketsScreen from '../screens/markets/MarketsScreen';
import AssetDetailScreen from '../screens/markets/AssetDetailScreen';
import PortfolioScreen from '../screens/portfolio/PortfolioScreen';
import DepositScreen from '../screens/deposit/DepositScreen';
import AccountScreen from '../screens/account/AccountScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DARK = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: '#020617', card: '#0f172a', border: '#1e293b', text: '#f1f5f9', primary: '#2563EB' },
};

const TAB_ICON: Record<string, string> = {
  Home: '⊙', Markets: '◈', Portfolio: '◉', Deposit: '⊕', Account: '○',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, color: focused ? '#2563EB' : '#64748b' }}>{TAB_ICON[name]}</Text>;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#1e293b', paddingBottom: 4 },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748b',
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Markets" component={MarketsScreen} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} />
      <Tab.Screen name="Deposit" component={DepositScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="AssetDetail" component={AssetDetailScreen}
        options={{ headerShown: true, headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#f1f5f9', title: '' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { accessToken, hydrated } = useAuthStore();

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#2563EB" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={DARK}>
      {accessToken ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
