import { ReactNode } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import Logo from "./Logo";

type AuthLayoutProps = {
  children: ReactNode;
  compact?: boolean;
};

export default function AuthLayout({ children, compact = false }: AuthLayoutProps) {
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === "web" && width >= 900;

  return (
    <View style={[styles.screen, isDesktopWeb && styles.webScreen]}>
      <View style={[styles.shell, isDesktopWeb && styles.webShell]}>
        {isDesktopWeb && (
          <View style={styles.brandPanel}>
            <Logo size="large" centered={false} showText />

            <Text style={styles.brandTitle}>Conectá con personas reales</Text>
            <Text style={styles.brandText}>
              Descubrí eventos, hablá con gente que comparte tus intereses y
              armá conexiones antes, durante y después de cada plan.
            </Text>

            <Image
              source={require("../../assets/images/mascotaseba.png")}
              style={styles.brandImage}
              resizeMode="contain"
            />
          </View>
        )}

        <View
          style={[
            styles.formPanel,
            compact && styles.compactPanel,
            isDesktopWeb && styles.webFormPanel,
          ]}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F5FF",
  },
  webScreen: {
    minHeight: "100vh" as any,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 28,
  },
  shell: {
    flex: 1,
  },
  webShell: {
    width: "100%",
    maxWidth: 1080,
    minHeight: 680,
    flex: 0,
    flexDirection: "row",
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E2F8",
    boxShadow: "0px 24px 60px rgba(65,34,114,0.14)" as any,
  },
  brandPanel: {
    flex: 1,
    backgroundColor: "#F1ECFF",
    paddingHorizontal: 46,
    paddingVertical: 42,
    justifyContent: "center",
  },
  brandTitle: {
    marginTop: 18,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "900",
    color: "#332047",
  },
  brandText: {
    marginTop: 16,
    maxWidth: 420,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700",
    color: "#6F6A7E",
  },
  brandImage: {
    width: "100%",
    maxWidth: 360,
    height: 240,
    marginTop: 34,
    alignSelf: "center",
  },
  formPanel: {
    flex: 1,
  },
  compactPanel: {
    justifyContent: "center",
  },
  webFormPanel: {
    flex: 1,
    maxWidth: 500,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
});
