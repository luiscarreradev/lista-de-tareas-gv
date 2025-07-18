import { Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTodo, deleteTodo } from "@/api/todos";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Todo } from "@/types";

import { IconSymbol } from "./ui/IconSymbol";

export default function TodoItem({ todo, onStartEdit }: { todo: Todo, onStartEdit: (task: Todo) => void; }) {
  const queryClient = useQueryClient();

  const { mutate: toggleComplete } = useMutation({
    mutationFn: updateTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tareas"] });
    },
    onError: (error) => {
      console.error("Error al actualizar la tarea:", error);
    },
  });

  const { mutate: deleteTask } = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tareas"] });
    },
    onError: (error) => {
      console.error("Error al eliminar la tarea:", error);
      alert("No se pudo eliminar la tarea.");
    },
  });

  const handleLongPress = () => {
    Alert.alert(
      "Acciones de Tarea",
      `¿Qué deseas hacer con "${todo.titulo}"?`,
      [
        {
          text: "Eliminar",
          onPress: () => deleteTask(todo.id),
          style: "destructive",
        },
        {
          text: "Editar",
          onPress: () => onStartEdit(todo),
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  };

  const getContainerStyle = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = todo.fecha_vencimiento ? new Date(todo.fecha_vencimiento) : null;

    if (dueDate && dueDate < today) {
      return { backgroundColor: "#ffdddd" };
    }

    if (todo.completed) {
      return { backgroundColor: "#ddffdd" };
    }

    return {};
  };

  const handleToggleComplete = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = todo.fecha_vencimiento ? new Date(todo.fecha_vencimiento) : null;
    const isOverdue = dueDate && dueDate < today;
    if (isOverdue && !todo.completed) {
      alert("No puedes marcar como completada una tarea que ya está vencida.");
      return;
    }

    toggleComplete({ id: todo.id, completed: !todo.completed });
  };

  return (
    <TouchableOpacity
      style={[styles.todoItem, getContainerStyle()]}
      onPress={handleToggleComplete}
      onLongPress={handleLongPress}
    >
      <IconSymbol
        name={todo.completed ? "checkmark.circle.fill" : "circle"}
        color="#000"
      />
      <View>
        <Text style={styles.todoItemText}>{todo.titulo}</Text>
        {todo.descripcion && (
          <Text style={styles.todoItemDescription}>{todo.descripcion}</Text>
        )}
        {todo.fecha_vencimiento && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              Vence: {new Date(todo.fecha_vencimiento).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  todoItem: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#d3d3d3",
  },
  todoItemText: {
    color: "#2b2c2d",
  },
  todoItemDescription: {
    color: "#c8c8c8",
    fontSize: 12,
    fontFamily: "RobotoRegular",
  },
  dateContainer: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateText: {
    fontSize: 12,
    color: "#888",
    fontFamily: "Roboto",
  },
});
