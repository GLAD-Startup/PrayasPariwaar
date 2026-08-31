import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { api } from "../../lib/api";

export default function MobileVolunteerScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState("");
  const [availability, setAvailability] = useState("Weekends");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !phone || !skills) {
      Alert.alert("Missing Fields", "Please fill in your name, email, phone, and skills.");
      return;
    }

    setLoading(true);
    const res = await api.post("/volunteers", {
      name,
      email,
      phone,
      skills,
      availability,
      areaOfInterest: "Emergency Blood Desk & Logistics",
    });
    setLoading(false);

    if (res.data?.success) {
      Alert.alert("Welcome to Prayas!", res.data.message);
      setName("");
      setEmail("");
      setPhone("");
      setSkills("");
    } else {
      Alert.alert("Error", res.error || "Registration failed.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Prayas Volunteer Taskforce</Text>
        <Text style={styles.subtitle}>
          Join our network of over 3,200 first responders saving lives across India.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Volunteer Registration</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name *"
          placeholderTextColor="#94A3B8"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email Address *"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone / WhatsApp Number *"
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <TextInput
          style={styles.input}
          placeholder="Skills (e.g. Medical, Driver, IT, Coordination) *"
          placeholderTextColor="#94A3B8"
          value={skills}
          onChangeText={setSkills}
        />

        <TextInput
          style={styles.input}
          placeholder="Availability (e.g. Weekends, On-Call)"
          placeholderTextColor="#94A3B8"
          value={availability}
          onChangeText={setAvailability}
        />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? "Submitting..." : "Join as a Volunteer"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
  },
  input: {
    height: 46,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    marginBottom: 12,
  },
  submitBtn: {
    height: 48,
    backgroundColor: "#D97706",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
