import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Board, TaskList, TaskListFake } from "@/types/enums";
import { SafeAreaView } from "react-native-safe-area-context";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { useSupabase } from "@/context/SupabaseContext";
import ListStart from "./ListStart";
import { Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import ListView from "./ListView";
interface BoardAreaProps {
  board?: Board;
}

const BoardArea = ({ board }: BoardAreaProps) => {
  const { width, height } = useWindowDimensions();
  const ref = useRef<ICarouselInstance>(null);
  const { getBoardLists, addBoardList } = useSupabase();
  const [data, setData] = useState<Array<TaskList | TaskListFake>>([
    { id: undefined },
  ]);
  const [startListActive, setStartListActive] = useState(false);
  const progress = useSharedValue(0);
  useEffect(() => {
    if (!board) return;
    loadBoardList();
  }, [board]);
  const loadBoardList = async () => {
    const lists = await getBoardLists!(board!.id);
    setData([...lists, { id: undefined }]);
  };

  const onSaveNewList = async (title: string) => {
    setStartListActive(false);
    const { data: newItem } = await addBoardList!(board!.id, title);
    data.pop();
    setData([...data, newItem, { id: undefined }]);
  };

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index,
    });
  };
  const onListDeleted = (id: string) => {
    setData(data.filter((item) => item.id !== id));
  };
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <Carousel
        data={data}
        width={width}
        height={height}
        loop={false}
        ref={ref}
        pagingEnabled
        onProgressChange={progress}
        renderItem={({ index, item }: any) => (
          <>
            {item.id && (
              <ListView
                key={index}
                taskList={item}
                onDelete={() => onListDeleted(item.id)}
              />
            )}
            {item.id === undefined && (
              <View
                key={index}
                style={{ paddingTop: 20, paddingHorizontal: 30 }}
              >
                {startListActive && (
                  <ListStart
                    onCancel={() => setStartListActive(false)}
                    onSave={onSaveNewList}
                  />
                )}
                {!startListActive && (
                  <TouchableOpacity
                    style={styles.listAddBtn}
                    onPress={() => setStartListActive(true)}
                  >
                    <Text style={{}}>Add List</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
      ></Carousel>
      <Pagination.Basic
        progress={progress}
        data={data}
        dotStyle={{ backgroundColor: "#fffff5c", borderRadius: 40 }}
        size={8}
        activeDotStyle={{ backgroundColor: "#fff" }}
        containerStyle={{ gap: 10, marginTop: 10 }}
      />
    </SafeAreaView>
  );
};

export default BoardArea;

const styles = StyleSheet.create({
  listAddBtn: {
    backgroundColor: "#00000047",
    height: 44,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
