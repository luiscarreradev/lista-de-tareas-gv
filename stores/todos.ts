import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Todo } from "@/types";
import { storage } from "./storage";

type TodoStore = {
  todos: Todo[],
  addTodo: (todo: Todo) => void,
}

const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],
      addTodo: (todo: Todo) => {
        set((state) => ({ todos: [...state.todos, todo]}))
      }
    }),
    {
      name: "todos-storage",
      storage: createJSONStorage(() => storage),
    }
  )
);

export default useTodoStore;