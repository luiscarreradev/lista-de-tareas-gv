import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { ForwardedRef, useCallback, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Todo } from "@/types";
import { createTodo, updateTodo } from "@/api/todos";

const AddTodoSchema = z.object({
  titulo: z.string({ required_error: "Obligatorio" }).min(2, {
    message: "El título debe terner al menos 2 caracteres",
  }),
  descripcion: z.string().optional().nullable(),
  fecha_vencimiento: z.coerce
    .date()
    .min(new Date(new Date().setHours(0, 0, 0, 0)), {
      message: "La fecha no puede ser anterior a hoy",
    })
    .optional()
    .nullable(),
});

export default function AddTodoModal({
  modalRef,
  onSave,
  taskToEdit,
  onModalClose,
}: {
  modalRef: ForwardedRef<BottomSheetModal>;
  onSave: () => void;
  taskToEdit: Todo | null;
  onModalClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEditing = !!taskToEdit;
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { mutate: createTask, isPending: isCreating } = useMutation({
    mutationFn: createTodo,
    onSuccess: (newData) => {
      onSave();
      queryClient.setQueryData(["tareas"], (oldData: Todo[] | undefined) => {
        const newCreatedTodo = newData?.[0];
        return oldData && newCreatedTodo
          ? [...oldData, newCreatedTodo]
          : newCreatedTodo
          ? [newCreatedTodo]
          : oldData;
      });
      queryClient.invalidateQueries({ queryKey: ["tareas"] });
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const { mutate: updateTask, isPending: isUpdating } = useMutation({
    mutationFn: updateTodo,
    onSuccess: () => {
      onSave();
      queryClient.invalidateQueries({ queryKey: ["tareas"] });
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Todo>({
    resolver: zodResolver(AddTodoSchema),
    defaultValues: {
      titulo: "",
      descripcion: null,
      fecha_vencimiento: null,
    },
  });

  useEffect(() => {
    if (isEditing) {
      reset(taskToEdit);
    }
  }, [isEditing, taskToEdit, reset]);

  const onSubmit = (data: Todo) => {
    if (isEditing && taskToEdit) {
      updateTask({ ...data, id: taskToEdit.id });
    } else {
      createTask(data);
    }
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={modalRef}
        enableDynamicSizing={true}
        enablePanDownToClose
        enableDismissOnClose
        onDismiss={() => {
          reset();
          onModalClose();
        }}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.backgroundModal}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.addTodoTitle}>
              {isEditing ? "Editar Tarea" : "Agrega una tarea"}
            </Text>
          </View>

          <Controller
            control={control}
            name="titulo"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  onChangeText={onChange}
                  placeholder="¿Qué tarea quieres hacer?*"
                  placeholderTextColor="#d3d3d3"
                  value={value}
                  style={[
                    styles.inputTodo,
                    {
                      borderColor: errors.titulo ? "#a61414" : "transparent",
                    },
                  ]}
                  editable={!isCreating && !isUpdating}
                />
                {!!errors.titulo && (
                  <Text style={styles.errorMessage}>
                    {errors.titulo?.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="descripcion"
            render={({ field: { onChange, value } }) => (
              <TextInput
                onChangeText={onChange}
                placeholder="¿En qué consiste la tarea?"
                placeholderTextColor="#d3d3d3"
                value={value || ""}
                style={styles.inputTodo}
                editable={!isCreating && !isUpdating}
              />
            )}
          />

          <Controller
            control={control}
            name="fecha_vencimiento"
            render={({ field: { onChange, value } }) => (
              <View style={{ gap: 5 }}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {value
                      ? new Date(value).toLocaleDateString()
                      : "Seleccionar fecha de vencimiento"}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={value ? new Date(value) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(
                      event: DateTimePickerEvent,
                      selectedDate?: Date
                    ) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        onChange(selectedDate);
                      }
                    }}
                  />
                )}
              </View>
            )}
          />

          <TouchableOpacity
            style={styles.saveTodo}
            onPress={handleSubmit(onSubmit)}
            disabled={isCreating || isUpdating}
          >
            <Text>{isEditing ? "Guardar Cambios" : "Guardar tarea"}</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  backgroundModal: {
    backgroundColor: "#fbfbfb",
  },
  contentContainer: {
    flex: 1,
    gap: 10,
    paddingTop: 5,
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addTodoTitle: {
    fontFamily: "Roboto",
    fontSize: 18,
    color: "#2b2c2d",
  },
  inputTodo: {
    backgroundColor: "#fbfbfb",
    borderColor: "transparent",
    borderWidth: 1,
    color: "#2b2c2d",
    borderRadius: 8,
    height: 40,
    padding: 8,
    shadowColor: "#2b2c2d",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  saveTodo: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  inputContainer: {
    position: "relative",
  },
  errorMessage: {
    color: "#9e0606",
    fontSize: 12,
    position: "absolute",
    left: 5,
    top: -8,
    backgroundColor: "#ffffff",
  },
  dateButton: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d3d3d3",
    backgroundColor: "#fbfbfb",
  },
  dateButtonText: {
    color: "#2b2c2d",
  },
});