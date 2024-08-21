import { StyleSheet, Text, View } from "react-native";
import React from "react";

type Props = {};

const Cards = (props: Props) => {
  return (
    <View style={{ flex: 1, backgroundColor: "green" }}>
      <Text>my-cards</Text>
    </View>
  );
};

export default Cards;

const styles = StyleSheet.create({});
