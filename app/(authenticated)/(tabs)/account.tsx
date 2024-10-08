import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useAuth } from "@clerk/clerk-expo";

type Props = {};

const Page = (props: Props) => {
  const { signOut } = useAuth();
  return (
    <View style={{ flex: 1, backgroundColor: "red" }}>
      <Button title="Sign Out" onPress={() => signOut()} />
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({});
