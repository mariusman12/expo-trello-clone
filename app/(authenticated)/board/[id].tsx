import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSupabase } from "@/context/SupabaseContext";
import { Board } from "@/types/enums";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import BoardArea from "@/components/Board/BoardArea";
type Props = {};

const Page = (props: Props) => {
  const { id, bg } = useLocalSearchParams<{ id: string; bg?: string }>();
  console.log(id);
  const { getBoardInfo } = useSupabase();
  const [board, setBoard] = useState<Board>({});
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  useEffect(() => {
    if (!id) return;
    loadBoardInfo();
  }, [id]);

  const loadBoardInfo = async () => {
    const data = await getBoardInfo!(id);
    console.log("Data = ", data);
    setBoard(data);
  };

  const CustomHeader = () => (
    <BlurView intensity={80} tint={"dark"} style={{ paddingTop: top }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.dismiss()}>
          <Ionicons name="close" size={24} color={Colors.fontLight} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: Colors.fontLight, fontSize: 16 }}>
            {board.title}
          </Text>
          <Text style={{ color: Colors.fontLight, fontSize: 12 }}>
            Workspace of {board?.users?.first_name ?? "Cornel"}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 14 }}>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons
              name="filter-circle-outline"
              size={24}
              color={Colors.fontLight}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={Colors.fontLight}
            />
          </TouchableOpacity>

          <Link href={`/(authenticated)/board/settings?id=${id}`} asChild>
            <TouchableOpacity onPress={() => {}}>
              <MaterialCommunityIcons
                name="dots-horizontal"
                size={26}
                color={Colors.fontLight}
              />
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </BlurView>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: bg,
        paddingTop: headerHeight,
      }}
    >
      <Stack.Screen
        options={{
          title: board?.title,
          headerTransparent: true,
          header: () => <CustomHeader />,
        }}
      />
      <Text>Boards carousel</Text>
      {board && <BoardArea board={board} />}
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "",
    paddingHorizontal: 14,
    height: 50,
  },
});
