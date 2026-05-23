import { View, Text, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

export default function EventDetail() {
  const { id } = useLocalSearchParams();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F4F6FB",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "700", color: "#332047" }}>
        Detalle del evento
      </Text>

      <Text style={{ marginTop: 12, fontSize: 18 }}>
        ID del evento: {id}
      </Text>

      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          marginTop: 30,
          backgroundColor: "#7B2DF0",
          paddingHorizontal: 30,
          paddingVertical: 16,
          borderRadius: 20,
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}