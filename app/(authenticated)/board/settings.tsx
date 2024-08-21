import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useSupabase } from "@/context/SupabaseContext";
import { Colors } from "@/constants/Colors";
import { Board, User } from "@/types/enums";
import { Ionicons } from "@expo/vector-icons";
import UserListItem from "@/components/UserListItem";

type Props = {};

const Page = (props: Props) => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getBoardInfo, updateBoard, deleteBoard, getBoardMember } =
    useSupabase();
  const router = useRouter();
  const [board, setBoard] = useState<Board>();
  const [member, setMember] = useState<User[]>([]);

  useEffect(() => {
    if (!id) return;
    loadInfo();
  }, []);

  const loadInfo = async () => {
    const data = await getBoardInfo!(id!);
    setBoard(data);

    const member = await getBoardMember!(id!);
    setMember(member);
    console.log(member);
  };

  const onUpdateBoard = async () => {
    console.log("update board");
    const updated = await updateBoard!(board!);
    setBoard(updated);
  };

  const onDelete = async () => {
    await deleteBoard!(`${id}`);
    router.dismissAll();
  };

  return (
    <View>
      <View style={styles.container}>
        <Text style={{ color: Colors.grey, fontSize: 12, marginBottom: 5 }}>
          Board name
        </Text>
        <TextInput
          value={board?.title}
          onChangeText={(text) => setBoard({ ...board!, title: text })}
          style={{ fontSize: 16, color: Colors.fontDark }}
          returnKeyType="done"
          enterKeyHint="done"
          onEndEditing={onUpdateBoard}
        />
      </View>
      <View style={styles.container}>
        <View style={{ flexDirection: "row", gap: 14 }}>
          <Ionicons name="person-outline" size={18} color={Colors.fontDark} />
          <Text
            style={{ fontWeight: "bold", color: Colors.fontDark, fontSize: 16 }}
          >
            Member
          </Text>
        </View>
      </View>

      <FlatList
        data={member}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <UserListItem element={item} onPress={() => {}} />
        )}
        contentContainerStyle={{ gap: 8 }}
      />

      <Link href={`/(authenticated)/board/invite?id=${id}`} asChild>
        <TouchableOpacity style={styles.fullBtn}>
          <Text style={{ fontSize: 16, color: Colors.fontLight }}>
            Manage board members
          </Text>
        </TouchableOpacity>
      </Link>
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <Text style={{ color: "red" }}> Delete board</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 8,
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  deleteBtn: {
    backgroundColor: "#fff",
    padding: 8,
    marginHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  fullBtn: {
    backgroundColor: Colors.primary,
    padding: 8,
    marginLeft: 32,
    marginRight: 16,
    marginTop: 8,
    borderRadius: 6,
    alignItems: "center",
  },
});
