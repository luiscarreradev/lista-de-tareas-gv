import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { CustomIcon } from "./ui/CustomIcon";
import { useAuth } from "@/providers/AuthProvider";

export default function Header() {
  const queryClient = useQueryClient();
  const { userName } = useAuth();

  const logout = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {userName ? `Hola, ${userName}` : "Task List"}
        </Text>
      </View>
      <View style={styles.headerIcons}>
        <TouchableOpacity onPress={logout}>
          <CustomIcon name="logout" color="#2b2c2d" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    paddingTop: 40,
    gap: 10,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: "RobotoBold",
    fontSize: 18,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
