import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router'; // <-- 1. Importa 'router'
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react'; // <-- 2. Importa 'useEffect'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import AuthProvider, { useAuth } from '@/providers/AuthProvider';

const queryClient = new QueryClient();

function InitialLayout() {
  // Ahora también pedimos la 'session' para saber si el usuario está logueado
  const { loading, session } = useAuth();
  useReactQueryDevTools(queryClient);

  // --- 3. ESTE ES EL NUEVO "GUARDIA DE LA PUERTA" ---
  useEffect(() => {
    // Si todavía estamos cargando, no hacemos nada.
    if (loading) {
      return;
    }

    // Si la carga ha terminado Y no hay sesión,
    // damos la orden de ir a la pantalla de signin.
    if (!session) {
      router.replace('/(auth)/signin');
    } 
    // Si la carga ha terminado Y SÍ hay sesión,
    // nos aseguramos de que el usuario esté en la pantalla principal.
    else {
      router.replace('/');
    }
  }, [loading, session]); // Este código se ejecuta cada vez que 'loading' o 'session' cambian.


  // Mientras carga, no mostramos nada para evitar parpadeos.
  // El useEffect de arriba se encargará de la redirección.
  if (loading) {
    return null;
  }

  // Solo mostramos las pantallas una vez que la carga ha terminado.
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen 
        name="index"
      />
      <Stack.Screen
        name="(auth)/signin/index"
        options={{ 
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="(auth)/signup/index"
        options={{ 
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    IcoMoon: require('../assets/fonts/icomoon.ttf'),
    Roboto: require('../assets/fonts/Roboto-Medium.ttf'),
    RobotoBold: require('../assets/fonts/Roboto-Bold.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <InitialLayout />
          <StatusBar style="dark" />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </AuthProvider>
  );
}