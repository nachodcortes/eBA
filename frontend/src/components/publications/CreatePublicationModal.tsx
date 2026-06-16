import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ProfileAvatarLink from "../ProfileAvatarLink";
import { Usuario } from "../../types/Usuario";

type Props = {
  visible: boolean;
  usuarioActual: Usuario | null;
  texto: string;
  onChangeTexto: (texto: string) => void;
  onClose: () => void;
  onPublish: () => void;
};

export default function CreatePublicationModal({
  visible,
  usuarioActual,
  texto,
  onChangeTexto,
  onClose,
  onPublish,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 18 : 0}
      >
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Nueva publicación</Text>

            <TouchableOpacity onPress={onPublish} disabled={!texto.trim()}>
              <Text
                style={[
                  styles.modalPublishText,
                  !texto.trim() && styles.modalPublishTextDisabled,
                ]}
              >
                Publicar
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContent}
          >
            <View style={styles.tweetBox}>
              <ProfileAvatarLink
                usuario={usuarioActual || ({ nombre: "Yo" } as Usuario)}
                size={42}
                fallbackToProfile
              />

              <TextInput
                style={styles.tweetInput}
                placeholder="¿Qué querés decir sobre este evento?"
                placeholderTextColor="#9A96A8"
                value={texto}
                onChangeText={onChangeTexto}
                multiline
                autoFocus
                scrollEnabled
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: Platform.OS === "ios" ? 24 : 18,
    maxHeight: "86%",
    minHeight: 320,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  modalContent: {
    paddingBottom: 18,
  },
  modalCancelText: {
    color: "#6F6D7A",
    fontSize: 14,
    fontWeight: "800",
  },
  modalTitle: {
    color: "#332047",
    fontSize: 16,
    fontWeight: "900",
  },
  modalPublishText: {
    color: "#8B35E8",
    fontSize: 14,
    fontWeight: "900",
  },
  modalPublishTextDisabled: {
    color: "#C8B8E8",
  },
  tweetBox: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tweetInput: {
    flex: 1,
    minHeight: 210,
    maxHeight: 360,
    marginLeft: 12,
    fontSize: 18,
    color: "#332047",
    lineHeight: 26,
    textAlignVertical: "top",
    outlineStyle: "none" as any,
  },
});
