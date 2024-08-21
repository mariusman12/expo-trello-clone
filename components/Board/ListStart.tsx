import { StyleSheet, Text, TextInput, View } from "react-native";
import React, { useState } from "react";
import { Colors } from "@/constants/Colors";
import { TouchableOpacity } from "react-native-gesture-handler";

export interface ListStartProps {
  onCancel: () => void;
  onSave: (title: string) => void;
}
type Props = {};

const ListStart = ({ onCancel, onSave }: ListStartProps) => {
  const [listTitle, setListTitle] = useState("");

  return (
    <View style={styles.card}>
      <TextInput
        style={styles.input}
        placeholder="Enter list title"
        value={listTitle}
        onChangeText={setListTitle}
        autoFocus
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 8,
        }}
      >
        <TouchableOpacity onPress={onCancel}>
          <Text>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onSave(listTitle)}>
          <Text>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ListStart;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: 6,
    marginBottom: 16,
    width: "100%",
    height: 90,
  },
  input: {
    padding: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.grey,
    borderRadius: 4,
    marginBottom: 8,
  },
});
