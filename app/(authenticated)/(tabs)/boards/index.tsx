import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useSupabase } from "@/context/SupabaseContext";
import { Board } from "@/types/enums";
import { Link, useFocusEffect } from "expo-router";
import { Colors } from "@/constants/Colors";

type Props = {};

const Page = (props: Props) => {
  const { getBoards } = useSupabase();
  const [refreshing, setRefreshing] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadBoards();
    }, [])
  );
  const loadBoards = async () => {
    const data = await getBoards!();
    setBoards(data);
  };
  const ListItem = ({ item }: { item: Board }) => (
    <Link
      href={`/(authenticated)/board/${item.id}?bg=${encodeURIComponent(
        item.background
      )}`}
      key={item.id}
      style={styles.listItem}
      asChild
    >
      <TouchableOpacity>
        <View
          style={[styles.colorBlock, { backgroundColor: item.background }]}
        />
        <Text style={{ fontSize: 16 }}>{item.title}</Text>
      </TouchableOpacity>
    </Link>
  );
  return (
    <View style={styles.container}>
      <FlatList
        data={boards}
        contentContainerStyle={styles.list}
        renderItem={ListItem}
        ItemSeparatorComponent={() => (
          <View
            style={{
              height: StyleSheet.hairlineWidth,
              backgroundColor: Colors.grey,
              marginStart: 50,
            }}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadBoards} />
        }
      />
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    flex: 1,
  },
  list: {
    borderColor: Colors.grey,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    gap: 10,
  },
  colorBlock: {
    width: 30,
    height: 30,
    borderRadius: 4,
  },
});
