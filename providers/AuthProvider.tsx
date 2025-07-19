// providers/AuthProvider.tsx

import { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type AuthData = {
  loading: boolean;
  session: Session | null;
  userName: string | null;
};

const AuthContext = createContext<AuthData>({
  loading: true,
  session: null,
  userName: null,
});

interface Props {
  children: React.ReactNode;
}

export default function AuthProvider(props: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // onAuthStateChange se encarga de todo. Se activa al cargar la app
    // y cada vez que el estado de autenticación cambia (login, logout).
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setSession(session);

        // Extraemos el nombre del usuario de la sesión
        const currentUserName = session?.user?.user_metadata?.name || null;
        setUserName(currentUserName);

        // Una vez que hemos comprobado todo, la carga ha terminado.
        setLoading(false);

        // Redirigimos al usuario a la pantalla correcta.
        // Esto lo dejamos fuera del listener para evitar redirecciones innecesarias
      }
    );

    // Esta es la función de "limpieza" que se ejecuta cuando el componente se desmonta.
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ loading, session, userName }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);