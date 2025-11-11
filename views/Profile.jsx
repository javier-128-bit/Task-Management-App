import { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { signOut } from "firebase/auth";
import { auth, db } from "../Firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import * as Notifications from "expo-notifications";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;

    const q = query(collection(db, "Tasks"), where("uid", "==", uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllTasks(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    const requestPermissions = async () => {
      await Notifications.requestPermissionsAsync();
    };
    requestPermissions();
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <ActivityIndicator size="large" color="#7CB9E8" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "white", marginTop: 0 }}
      contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <SafeAreaView style={{ backgroundColor: "white" }}>
        <Text
          style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: "bold",
            marginTop: 10,
            marginBottom: 20,
            color: "black",
          }}
        >
          Tugas 1 Minggu Terakhir
        </Text>
      </SafeAreaView>

      <WeeklyStats allTasks={allTasks} />
      <WeeklyLineChart allTasks={allTasks} />
      <DeadlineNotifier allTasks={allTasks} />

      <TouchableOpacity
        style={{
          backgroundColor: "red",
          padding: 12,
          borderRadius: 10,
          marginTop: 30,
          alignSelf: "center",
          paddingHorizontal: 40,
        }}
        onPress={handleLogout}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const WeeklyStats = memo(({ allTasks }) => {
  const { completedTasks, incompleteTasks } = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const completed = [];
    const incomplete = [];

    allTasks.forEach((task) => {
      const taskDate = toDate(task.date);
      if (!taskDate || taskDate < monday || taskDate > sunday) return;

      const status = (task.status || "").toLowerCase().trim();
      if (status === "selesai") {
        completed.push(task);
      } else {
        incomplete.push(task);
      }
    });

    return { completedTasks: completed, incompleteTasks: incomplete };
  }, [allTasks]);

  const screenWidth = Dimensions.get("window").width;
  const cardWidth = (screenWidth - 35) / 2;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      <StatCard
        title="Tugas Selesai"
        count={completedTasks.length}
        width={cardWidth}
      />
      <StatCard
        title="Belum Selesai"
        count={incompleteTasks.length}
        width={cardWidth}
      />
    </View>
  );
});

const StatCard = memo(({ title, count, width }) => (
  <View
    style={{
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#7CB9E8",
      paddingVertical: 20,
      borderRadius: 10,
      width: width,
      minWidth: 150,
    }}
  >
    <Text
      style={{
        textAlign: "center",
        fontSize: 32,
        fontWeight: "bold",
        color: "white",
      }}
    >
      {count}
    </Text>
    <Text
      style={{
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
        color: "white",
        marginTop: 5,
      }}
    >
      {title}
    </Text>
  </View>
));

const WeeklyLineChart = memo(({ allTasks }) => {
  const chartData = useMemo(() => {
    const today = new Date();
    const startOfDay = (d) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    };

    const endOfDay = (d) => {
      const x = new Date(d);
      x.setHours(23, 59, 59, 999);
      return x;
    };

    const weeks = [-1, 0, 1, 2].map((offset) => {
      const start = new Date(today);
      const dayOfWeek = start.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      start.setDate(start.getDate() + mondayOffset + offset * 7);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      return { start: startOfDay(start), end: endOfDay(end) };
    });

    const labels = ["Minggu Lalu", "Minggu Ini", "Minggu +1", "Minggu +2"];

    const selesaiPerMinggu = weeks.map((week) => {
      return allTasks.filter((task) => {
        const taskDate = toDate(task.date);
        if (!taskDate) return false;

        const status = (task.status || "").toLowerCase().trim();
        return (
          taskDate >= week.start && taskDate <= week.end && status === "selesai"
        );
      }).length;
    });

    return { labels, data: selesaiPerMinggu };
  }, [allTasks]);

  const screenWidth = Dimensions.get("window").width;
  const chartWidth = Math.min(screenWidth - 20, 500);

  return (
    <View style={{ marginTop: 30, alignItems: "center" }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 15,
          textAlign: "center",
          color: "black",
        }}
      >
        Grafik Tugas Selesai per Minggu
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={{
            labels: chartData.labels,
            datasets: [
              { data: chartData.data.length > 0 ? chartData.data : [0] },
            ],
          }}
          width={Math.max(chartWidth, 350)}
          height={220}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(124, 185, 232, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForDots: {
              r: "5",
              strokeWidth: "2",
              stroke: "#7CB9E8",
            },
            propsForBackgroundLines: {
              strokeDasharray: "",
              stroke: "#e3e3e3",
              strokeWidth: 1,
            },
          }}
          bezier
          style={{
            marginVertical: 10,
            borderRadius: 16,
          }}
          fromZero
          yAxisSuffix=""
          yAxisInterval={1}
        />
      </ScrollView>
    </View>
  );
});

const DeadlineNotifier = memo(({ allTasks }) => {
  useEffect(() => {
    const checkDeadlines = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const endToday = new Date();
      endToday.setHours(23, 59, 59, 999);

      const tasksToNotify = allTasks.filter((task) => {
        const taskDate = toDate(task.date);
        if (!taskDate) return false;

        const status = (task.status || "").toLowerCase().trim();
        return (
          taskDate >= today && taskDate <= endToday && status !== "selesai"
        );
      });

      for (const task of tasksToNotify) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "🚨 Deadline Hari Ini",
            body: `${task.tugas || "Tugas"} belum selesai, segera kerjakan!`,
            sound: true,
          },
          trigger: null,
        });
      }
    };

    if (allTasks.length > 0) {
      checkDeadlines();
    }
  }, [allTasks]);

  return null;
});

const toDate = (d) => {
  if (!d) return null;

  if (typeof d === "object" && d.seconds !== undefined) {
    return new Date(d.seconds * 1000);
  }

  if (typeof d === "object" && typeof d.toDate === "function") {
    return d.toDate();
  }

  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export default Profile;
