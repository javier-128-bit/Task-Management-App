import { useEffect, useState, useMemo, useCallback, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from "react-native";
import { Calendar } from "react-native-calendars";
import moment from "moment";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  collection,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../Firebase";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";

const Tasks = () => {
  const today = moment().format("YYYY-MM-DD");
  const [selectedDate, setSelectedDate] = useState(today);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;

    const q = query(collection(db, "Tasks"), where("uid", "==", uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            ...data,
            date: data.date?.seconds
              ? moment(data.date.toDate()).format("YYYY-MM-DD")
              : data.date,
          });
        });
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

  const filteredTasks = useMemo(() => {
    return allTasks
      .filter((task) => task.date === selectedDate)
      .sort((a, b) => {
        const statusOrder = {
          "Belum Dikerjakan": 0,
          Progress: 1,
          Selesai: 2,
        };
        return statusOrder[a.status] - statusOrder[b.status];
      });
  }, [allTasks, selectedDate]);

  const markedDates = useMemo(() => {
    const marked = allTasks.reduce((acc, task) => {
      if (task.date) {
        acc[task.date] = { marked: true, dotColor: "#7CB9E8" };
      }
      return acc;
    }, {});

    marked[selectedDate] = {
      ...(marked[selectedDate] || {}),
      selected: true,
      selectedColor: "#7CB9E8",
    };

    return marked;
  }, [allTasks, selectedDate]);

  const handleDayPress = useCallback((day) => {
    setSelectedDate(day.dateString);
  }, []);

  const deleteTask = useCallback(async (id) => {
    try {
      const ref = doc(db, "Tasks", id);
      await deleteDoc(ref);

      Toast.show({
        type: "success",
        text1: "Sukses",
        text2: "Tugas berhasil dihapus",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Error deleting:", error);
      Toast.show({
        type: "error",
        text1: "Gagal",
        text2: "Tugas tidak berhasil dihapus",
        visibilityTime: 2000,
      });
    }
  }, []);

  const updateTask = useCallback(async (id, status) => {
    try {
      const ref = doc(db, "Tasks", id);
      await updateDoc(ref, { status });

      Toast.show({
        type: "info",
        text1: status,
        text2: "Status berhasil diperbarui",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Error updating:", error);
      Toast.show({
        type: "error",
        text1: "Gagal",
        text2: "Status tidak berhasil diperbarui",
        visibilityTime: 2000,
      });
    }
  }, []);

  if (!uid) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Silakan login terlebih dahulu</Text>
      </View>
    );
  }

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
    <View style={{ flex: 1, backgroundColor: "white", marginTop: 0 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SafeAreaView style={{ backgroundColor: "white" }}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: "#7CB9E8",
              todayTextColor: "#7CB9E8",
              dotColor: "#7CB9E8",
              arrowColor: "#7CB9E8",
            }}
          />
        </SafeAreaView>

        <View style={{ paddingHorizontal: 15, marginTop: 10 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 10,
              color: "black",
            }}
          >
            Tugas untuk {moment(selectedDate).format("DD MMMM YYYY")}
          </Text>
        </View>

        {filteredTasks.length === 0 ? (
          <EmptyState />
        ) : (
          <TaskList
            tasks={filteredTasks}
            deleteTask={deleteTask}
            updateTask={updateTask}
          />
        )}
      </ScrollView>
      <Toast />
    </View>
  );
};

const EmptyState = memo(() => (
  <View
    style={{
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
    }}
  >
    <AntDesign name="inbox" size={60} color="#ccc" />
    <Text
      style={{
        fontSize: 16,
        color: "#999",
        marginTop: 15,
        textAlign: "center",
      }}
    >
      Tidak ada tugas untuk tanggal ini
    </Text>
  </View>
));

const TaskList = memo(({ tasks, deleteTask, updateTask }) => {
  const renderItem = useCallback(
    ({ item }) => {
      if (item.status === "Belum Dikerjakan") {
        return (
          <TaskPending
            task={item}
            deleteTask={deleteTask}
            updateTask={updateTask}
          />
        );
      } else if (item.status === "Progress") {
        return <TaskInProgress task={item} updateTask={updateTask} />;
      } else if (item.status === "Selesai") {
        return <TaskCompleted task={item} />;
      }
      return null;
    },
    [deleteTask, updateTask]
  );

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
});

const TaskPending = memo(({ task, deleteTask, updateTask }) => {
  const screenWidth = Dimensions.get("window").width;
  const maxTextWidth = screenWidth - 140;

  return (
    <View style={{ paddingHorizontal: 15, paddingVertical: 8 }}>
      <View
        style={{
          padding: 15,
          backgroundColor: "#F5F5F5",
          elevation: 3,
          borderRadius: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "flex-start",
              flex: 1,
            }}
          >
            <AntDesign
              name="profile"
              size={28}
              color="black"
              style={{ marginTop: 2 }}
            />
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "bold",
                  maxWidth: maxTextWidth,
                  color: "black",
                }}
                numberOfLines={2}
              >
                {task.tugas}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#666",
                  maxWidth: maxTextWidth,
                  marginTop: 2,
                  color: "black",
                }}
                numberOfLines={1}
              >
                {task.category}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => deleteTask(task.id)}
            style={{ padding: 5 }}
          >
            <FontAwesome name="times" size={24} color="red" />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            marginTop: 15,
            flexWrap: "wrap",
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "green",
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderRadius: 5,
              minWidth: 100,
              alignItems: "center",
            }}
            onPress={() => updateTask(task.id, "Selesai")}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 13 }}>
              Selesai
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "#ddbd04ff",
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderRadius: 5,
              minWidth: 100,
              alignItems: "center",
            }}
            onPress={() => updateTask(task.id, "Progress")}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 13 }}>
              Progress
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const TaskCompleted = memo(({ task }) => {
  const screenWidth = Dimensions.get("window").width;
  const maxTextWidth = screenWidth - 200;

  return (
    <View style={{ paddingHorizontal: 15, paddingVertical: 8 }}>
      <View
        style={{
          padding: 15,
          backgroundColor: "green",
          elevation: 3,
          borderRadius: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
              flex: 1,
            }}
          >
            <AntDesign name="profile" size={28} color="white" />
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "bold",
                  color: "white",
                  maxWidth: maxTextWidth,
                }}
                numberOfLines={2}
              >
                {task.tugas}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "white",
                  maxWidth: maxTextWidth,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {task.category}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Selesai
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const TaskInProgress = memo(({ task, updateTask }) => {
  const screenWidth = Dimensions.get("window").width;
  const maxTextWidth = screenWidth - 200;
  const buttonWidth = Math.min(screenWidth - 100, 200);

  return (
    <View style={{ paddingHorizontal: 15, paddingVertical: 8 }}>
      <View
        style={{
          padding: 15,
          backgroundColor: "#ddbd04ff",
          elevation: 3,
          borderRadius: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
              flex: 1,
            }}
          >
            <AntDesign name="profile" size={28} color="white" />
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "bold",
                  color: "white",
                  maxWidth: maxTextWidth,
                }}
                numberOfLines={2}
              >
                {task.tugas}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "white",
                  maxWidth: maxTextWidth,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {task.category}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Progress
            </Text>
          </View>
        </View>
        <View
          style={{
            alignItems: "center",
            marginTop: 15,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "green",
              paddingVertical: 10,
              paddingHorizontal: 30,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              width: buttonWidth,
            }}
            onPress={() => updateTask(task.id, "Selesai")}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
              Tandai Selesai
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default Tasks;
