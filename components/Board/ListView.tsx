import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
  TextInput,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Task, TaskList } from "@/types/enums";
import { DefaultTheme } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useSupabase } from "@/context/SupabaseContext";
import DraggableFlatList, {
  DragEndParams,
} from "react-native-draggable-flatlist";
import * as Haptics from "expo-haptics";
import ListItem from "./ListItem";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useAuth } from "@clerk/clerk-expo";

export interface ListViewProps {
  taskList: TaskList;
  onDelete: () => void;
}

type Props = {};

const ListView = ({ taskList, onDelete }: ListViewProps) => {
  const [listName, setListName] = useState(taskList.title);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["40%"], []);
  const [isAdding, setIsAdding] = useState(false);
  const {
    deleteBoardList,
    updateBoardList,
    getListCards,
    addListCard,
    updateCard,
    getRealtimeCardSubscription,
    uploadFile,
  } = useSupabase();
  const [task, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  const { userId } = useAuth();
  useEffect(() => {
    loadListTasks();
  }, []);
  const handleRealtimeChanges = (
    update: RealtimePostgresChangesPayload<any>
  ) => {
    console.log("REALTIME UPDATE:", update);
    const record = update.new?.id ? update.new : update.old;
    const event = update.eventType;

    if (!record) return;

    if (event === "INSERT") {
      setTasks((prev) => {
        return [...prev, record];
      });
    } else if (event === "UPDATE") {
      setTasks((prev) => {
        return prev
          .map((task) => {
            if (task.id === record.id) {
              return record;
            }
            return task;
          })
          .filter((task) => !task.done)
          .sort((a, b) => a.position - b.position);
      });
    } else if (event === "DELETE") {
      setTasks((prev) => {
        return prev.filter((task) => task.id !== record.id);
      });
    } else {
      console.log("Unhandled event", event);
    }
  };
  const onAddCard = async () => {
    const { data } = await addListCard!(
      taskList.id,
      taskList.board_id,
      newTask,
      task.length
    );
    setIsAdding(false);
    setNewTask("");
    setTasks([...task, data]);
  };

  const loadListTasks = async () => {
    const cards = await getListCards!(taskList.id);
    console.log(cards);
    setTasks(cards);
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        opacity={0.2}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
        onPress={() => bottomSheetModalRef.current?.close()}
      />
    ),
    []
  );

  const onUpdateTaskList = async () => {
    await updateBoardList!(taskList, listName);
  };

  const onDeleteTaskList = async () => {
    await deleteBoardList!(taskList.id);
    bottomSheetModalRef.current?.close();
    onDelete();
  };

  const onTaskDropped = async (params: DragEndParams<Task>) => {
    const newData = params.data.map((item, index) => {
      return { ...item, position: index };
    });
    setTasks(newData);

    newData.forEach(async (item) => {
      await updateCard!(item);
    });
  };

  const onSelectImage = async () => {
    // await ImagePicker.requestCameraPermissionsAsync();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const img = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(img.uri, {
        encoding: "base64",
      });
      const fileName = `${new Date().getTime()}-${userId}.${
        img.type === "image" ? "png" : "mp4"
      }`;
      const filePath = `${taskList.board_id}/${fileName}`;
      const contentType = img.type === "image" ? "image/png" : "video/mp4";
      const storagePath = await uploadFile!(filePath, base64, contentType);

      if (storagePath) {
        await addListCard!(
          taskList.id,
          taskList.board_id,
          fileName,
          task.length,
          storagePath
        );
      }
    }
  };

  return (
    <BottomSheetModalProvider>
      <View style={{ paddingTop: 20, paddingHorizontal: 30 }}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.listTitle}>{listName}</Text>
            <TouchableOpacity
              onPress={() => bottomSheetModalRef.current?.present()}
            >
              <MaterialCommunityIcons
                name="dots-horizontal"
                size={22}
                color={Colors.grey}
              />
            </TouchableOpacity>
          </View>

          {/* To do draggable lis=t */}
          <DraggableFlatList
            data={task}
            keyExtractor={(item) => item.id}
            renderItem={ListItem}
            containerStyle={{
              paddingBottom: 4,
              maxHeight: "80%",
            }}
            onDragEnd={onTaskDropped}
            onDragBegin={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }
            onPlaceholderIndexChange={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }
            contentContainerStyle={{
              gap: 4,
            }} // insigh content
          />

          {isAdding && (
            <TextInput
              autoFocus
              style={styles.input}
              value={newTask}
              onChangeText={setNewTask}
            />
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 8,
              marginVertical: 8,
            }}
          >
            {!isAdding && (
              <>
                <TouchableOpacity
                  onPress={() => setIsAdding(true)}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Ionicons name="add" size={14} />
                  <Text style={{ fontSize: 12 }}>Add Card</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onSelectImage}>
                  <Ionicons name="image-outline" size={18} />
                </TouchableOpacity>
              </>
            )}
            {isAdding && (
              <>
                <TouchableOpacity onPress={() => setIsAdding(false)}>
                  <Text style={{ fontSize: 14, color: Colors.primary }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onAddCard}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: Colors.primary,
                      fontWeight: "bold",
                    }}
                  >
                    Add
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
      <BottomSheetModal
        enablePanDownToClose
        enableOverDrag={false}
        backdropComponent={renderBackdrop}
        handleStyle={{
          backgroundColor: DefaultTheme.colors.background,
          borderRadius: 8,
        }}
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
      >
        <View style={styles.container}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Button
              title="Cancel"
              onPress={() => bottomSheetModalRef.current?.close()}
            />
          </View>
          <View
            style={{
              backgroundColor: "white",
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Text style={{ color: Colors.grey, fontSize: 12, marginBottom: 5 }}>
              {" "}
              List{" "}
            </Text>

            <TextInput
              style={{ fontSize: 16, color: Colors.fontDark }}
              value={listName}
              onChangeText={setListName}
              returnKeyType="done"
              enterKeyHint="done"
              onEndEditing={onUpdateTaskList}
            />
          </View>
          <TouchableOpacity onPress={onDeleteTaskList} style={styles.deleteBtn}>
            <Text>Delete List</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default ListView;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F3EFFC",
    borderRadius: 4,
    padding: 6,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    alignItems: "center",
  },
  input: {
    padding: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.2,
    borderRadius: 4,
  },
  listTitle: {
    paddingVertical: 8,
    fontWeight: "500",
  },
  deleteBtn: {
    backgroundColor: "#fff",
    padding: 8,
    marginHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  container: {
    backgroundColor: DefaultTheme.colors.background,
    flex: 1,
    gap: 16,
  },
});
