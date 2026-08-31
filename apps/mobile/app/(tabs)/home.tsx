import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { BloodGroupDisplayMap } from "@prayas/utils";

export default function MobileHomeScreen() {
  const router = useRouter();
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBloodAlerts = async () => {
    const res = await api.get("/blood-requests?limit=5");
    if (res.data?.success) {
      setRecentRequests(res.data.data);
    }
  };

  useEffect(() => {
    fetchBloodAlerts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBloodAlerts();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Prayas Sanstha</Text>
          <Text style={styles.headerSubtitle}>Rapid Humanitarian Response</Text>
        </View>
        <View style={styles.liveTag}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>24/7 ACTIVE</Text>
        </View>
      </View>

      {/* Emergency Banner */}
      <View style={styles.emergencyCard}>
        <Text style={styles.emergencyTag}>🚨 CRITICAL BLOOD DESK</Text>
        <Text style={styles.emergencyTitle}>Instant Donor Broadcast</Text>
        <Text style={styles.emergencyDesc}>
          Need blood urgently? Submit a request to immediately alert registered donors and volunteers.
        </Text>
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => router.push("/(tabs)/blood-donation")}
        >
          <Text style={styles.emergencyButtonText}>Request Emergency Blood →</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action Grid */}
      <Text style={styles.sectionTitle}>Emergency Services</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(tabs)/blood-donation")}
        >
          <Text style={styles.actionIcon}>🩸</Text>
          <Text style={styles.actionTitle}>Blood Bank</Text>
          <Text style={styles.actionSub}>Live Requests & Match</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(tabs)/equipment")}
        >
          <Text style={styles.actionIcon}>🫁</Text>
          <Text style={styles.actionTitle}>Equipment Bank</Text>
          <Text style={styles.actionSub}>Oxygen & ICU Care</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(tabs)/volunteer")}
        >
          <Text style={styles.actionIcon}>🤝</Text>
          <Text style={styles.actionTitle}>Volunteer</Text>
          <Text style={styles.actionSub}>First Responder Unit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Text style={styles.actionIcon}>🔔</Text>
          <Text style={styles.actionTitle}>Push Alerts</Text>
          <Text style={styles.actionSub}>Notification Setup</Text>
        </TouchableOpacity>
      </View>

      {/* Live Recent Requests */}
      <View style={styles.feedHeader}>
        <Text style={styles.sectionTitle}>Live Emergency Alerts</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/blood-donation")}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {recentRequests.length === 0 ? (
        <View style={styles.emptyFeed}>
          <Text style={styles.emptyText}>No emergency requests right now.</Text>
        </View>
      ) : (
        recentRequests.map((req) => {
          const displayGroup = BloodGroupDisplayMap[req.bloodGroup] || req.bloodGroup;
          return (
            <View key={req.id} style={styles.requestCard}>
              <View style={styles.requestLeft}>
                <View style={styles.badgeGroup}>
                  <Text style={styles.badgeGroupText}>{displayGroup}</Text>
                  <Text style={styles.badgeUnitsText}>{req.unitsNeeded} Units</Text>
                </View>
                <View style={styles.reqDetails}>
                  <Text style={styles.reqPatient}>{req.patientName}</Text>
                  <Text style={styles.reqHospital}>
                    {req.hospitalName}, {req.city}
                  </Text>
                  <Text style={styles.reqUrgency}>⚡ {req.urgency} Urgency</Text>
                </View>
              </View>
            </View>
          );
        })
      )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DC2626",
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#DC2626",
  },
  emergencyCard: {
    backgroundColor: "#DC2626",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  emergencyTag: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FEE2E2",
    marginBottom: 4,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  emergencyDesc: {
    fontSize: 12,
    color: "#FCA5A5",
    marginTop: 6,
    lineHeight: 18,
  },
  emergencyButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 14,
    alignSelf: "flex-start",
  },
  emergencyButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#DC2626",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  actionSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewAll: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  requestLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeGroup: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  badgeGroupText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#DC2626",
  },
  badgeUnitsText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#EF4444",
  },
  reqDetails: {
    flex: 1,
  },
  reqPatient: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  reqHospital: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  reqUrgency: {
    fontSize: 10,
    fontWeight: "700",
    color: "#DC2626",
    marginTop: 2,
  },
  emptyFeed: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 12,
    color: "#94A3B8",
  },
});
