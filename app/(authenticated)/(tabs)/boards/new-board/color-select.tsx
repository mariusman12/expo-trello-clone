import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";

type Props = {};

const COLORS = [
  "#0079bf",
  "#d29034",
  "#519839",
  "#b04632",
  "#89609e",
  "#cd5a91",
  "#4bbf6b",
  "#00aecc",
  "#838c91",
];
export const DEFAULT_COLOR = COLORS[0];
const Page = (props: Props) => {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const router = useRouter();

  const onColorSelect = (color: string) => {
    setSelectedColor(color);
    router.setParams({ bg: color });
  };

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {COLORS.map((color) => (
        <TouchableOpacity
          key={color}
          onPress={() => onColorSelect(color)}
          style={{
            backgroundColor: color,
            height: 100,
            width: 100,
            margin: 5,
            borderRadius: 4,
            borderWidth: selectedColor === color ? 2 : 0,
            borderColor: Colors.fontDark,
          }}
        />
      ))}
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({});
