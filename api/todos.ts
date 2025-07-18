import { supabase } from "@/lib/supabase";
import { Todo } from "@/types";

export default async function getTodos() {
  const { data, error } = await supabase.from("tareas").select("*");

  if (error) {
    throw error;
  }

  return data;
}

export async function createTodo(formData: Todo) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("No hay una sesión de usuario activa.");
  }

  const { data, error } = await supabase
    .from("tareas")
    .insert({
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      fecha_vencimiento: formData.fecha_vencimiento,
      user_id: session.user.id,
    })
    .select();

  if (error) {
    console.error("Error detallado desde api/todos.ts:", error);
    throw error;
  }

  return data;
}

export async function updateTodo({
  id,
  ...updatedFields
}: {
  id: string;
  [key: string]: any;
}) {
  const { data, error } = await supabase
    .from("tareas")
    .update(updatedFields)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error al actualizar la tarea:", error);
    throw error;
  }
  return data;
}

export async function deleteTodo(id: string) {
  const { error } = await supabase.from("tareas").delete().eq("id", id);

  if (error) {
    console.error("Error al eliminar la tarea:", error);
    throw error;
  }
}
