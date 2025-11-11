import {
  View,
  Text,
  StatusBar,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import Modal from "react-native-modal";
import { useEffect, useState, useMemo, useCallback } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Fontisto from "@expo/vector-icons/Fontisto";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import Feather from "@expo/vector-icons/Feather";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../Firebase";
import Toast from "react-native-toast-message";
import { auth } from "../Firebase";
import { SafeAreaView } from "react-native-safe-area-context";

const HomePage = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("Belum Dikerjakan");
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;

    const q = query(collection(db, "Tasks"), where("uid", "==", uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() });
      });
      setAllTasks(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    const q = query(collection(db, "Category"), where("uid", "==", uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() });
      });
      setCategories(items);
    });

    return () => unsubscribe();
  }, [uid]);

  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      const matchStatus = task.status === selectedStatus;
      const matchCategory =
        selectedCategory === "all" || task.category === selectedCategory;
      return matchStatus && matchCategory;
    });
  }, [allTasks, selectedCategory, selectedStatus]);

  const checker = allTasks.length > 0;

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
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <SafeAreaView style={{ backgroundColor: "white" }}>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
      </SafeAreaView>
      <Type
        category={categories}
        selectedCat={selectedCategory}
        setSelectedCat={setSelectedCategory}
        uid={uid}
      />
      {checker ? (
        <MainAda
          category={categories}
          task={filteredTasks}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          uid={uid}
        />
      ) : (
        <Main category={categories} uid={uid} />
      )}
    </View>
  );
};

const Type = ({ category, selectedCat, setSelectedCat, uid }) => {
  const [tcategory, setTCategory] = useState(false);
  const screenWidth = Dimensions.get("window").width;

  const toggleCat = useCallback(
    (categoryName) => {
      setSelectedCat(categoryName);
    },
    [setSelectedCat]
  );

  const addCategory = useCallback(
    async (Ocate) => {
      if (!uid || !Ocate.trim()) return;

      await addDoc(collection(db, "Category"), {
        category: Ocate,
        uid: uid,
        createdAt: new Date(),
      });

      setTCategory(false);
    },
    [uid]
  );

  const ToggleCategoryState = useCallback(() => {
    setTCategory((prev) => !prev);
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 5,
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: "center",
        marginTop: 0,
        backgroundColor: "#F5F5F5",
      }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View
          style={{
            gap: 10,
            padding: 5,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {selectedCat === "all" ? (
            <View
              style={{
                backgroundColor: "#7CB9E8",
                paddingHorizontal: Math.min(screenWidth * 0.03, 10),
                paddingVertical: 6,
                borderRadius: 25,
              }}
            >
              <Text
                style={{
                  fontSize: Math.min(screenWidth * 0.04, 16),
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                All
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={{
                borderWidth: 1,
                paddingHorizontal: Math.min(screenWidth * 0.03, 10),
                paddingVertical: 6,
                borderRadius: 25,
              }}
              onPress={() => toggleCat("all")}
            >
              <Text
                style={{
                  fontSize: Math.min(screenWidth * 0.04, 16),
                  fontWeight: "bold",
                  color: "black",
                }}
              >
                All
              </Text>
            </TouchableOpacity>
          )}

          {category.map((item) =>
            selectedCat === item.category ? (
              <View
                key={item.id}
                style={{
                  backgroundColor: "#7CB9E8",
                  paddingHorizontal: Math.min(screenWidth * 0.03, 10),
                  paddingVertical: 6,
                  borderRadius: 25,
                }}
              >
                <Text
                  style={{
                    fontSize: Math.min(screenWidth * 0.04, 16),
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  {item.category}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                key={item.id}
                style={{
                  borderWidth: 1,
                  borderColor: "gray",
                  paddingHorizontal: Math.min(screenWidth * 0.03, 10),
                  paddingVertical: 6,
                  borderRadius: 25,
                }}
                onPress={() => toggleCat(item.category)}
              >
                <Text
                  style={{
                    fontSize: Math.min(screenWidth * 0.04, 16),
                    fontWeight: "bold",
                    color: "black",
                  }}
                >
                  {item.category}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </ScrollView>

      <TouchableOpacity onPress={ToggleCategoryState}>
        <Entypo name="circle-with-plus" size={40} color="#7CB9E8" />
      </TouchableOpacity>
      {tcategory && (
        <ToggleCategory
          tcategory={tcategory}
          ToggleCat={ToggleCategoryState}
          addCategory={addCategory}
        />
      )}
    </View>
  );
};

const Main = ({ category, uid }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [tugas, setTugas] = useState("");
  const [selectedCat, setSelectedCat] = useState(null);
  const [cat, setCat] = useState("");
  const screenWidth = Dimensions.get("window").width;

  const onChange = useCallback((event, selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, []);

  const showDatepicker = useCallback(() => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: onChange,
      mode: "date",
      is24Hour: true,
    });
  }, [date, onChange]);

  const toggleModal = useCallback(() => {
    setModalVisible((prev) => !prev);
  }, []);

  const toggleKategori = useCallback(async (id) => {
    const docRef = doc(db, "Category", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setSelectedCat((prev) => (prev === id ? null : id));
      setCat((prev) =>
        prev === docSnap.data().category ? "" : docSnap.data().category
      );
    } else {
      Toast.show({
        type: "error",
        text1: "Gagal",
        text2: "Tidak Ada Data",
        visibilityTime: 2000,
      });
    }
  }, []);

  const addTask = useCallback(
    async (tugas, cat, date) => {
      if (!tugas.trim() || !cat) {
        Toast.show({
          type: "error",
          text1: "Gagal",
          text2: "Pilih Kategori dan Isi Tugas Dulu",
          visibilityTime: 2000,
        });
        return;
      }

      await addDoc(collection(db, "Tasks"), {
        tugas: tugas,
        category: cat,
        date: date,
        status: "Belum Dikerjakan",
        uid: uid,
      });

      setTugas("");
      setCat("");
      setSelectedCat(null);
      setDate(new Date());
      toggleModal();
    },
    [uid, toggleModal]
  );

  const imageSize = Math.min(screenWidth * 0.5, 200);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
      }}
    >
      <Image
        source={{
          uri: "https://cdn-icons-png.flaticon.com/512/2387/2387635.png",
        }}
        style={{ width: imageSize, height: imageSize }}
      />

      <Text
        style={{
          fontSize: Math.min(screenWidth * 0.05, 20),
          fontWeight: "bold",
          marginTop: 15,
          marginBottom: 10,
          textAlign: "center",
          color: "black",
        }}
      >
        Belum Ada Tugas
      </Text>
      <TouchableOpacity onPress={toggleModal}>
        <Entypo name="circle-with-plus" size={50} color="#7CB9E8" />
      </TouchableOpacity>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            minHeight: 200,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 15,
              textAlign: "center",
              color: "black",
            }}
          >
            Tambah Tugas
          </Text>
          <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
            <TextInput
              placeholder="Masukkan Tugas"
              placeholderTextColor="#999"
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 10,
                padding: 8,
                marginBottom: 15,
                flex: 1,
                color: "black",
              }}
              value={tugas}
              onChangeText={setTugas}
            />
            <TouchableOpacity onPress={() => addTask(tugas, cat, date)}>
              <Ionicons
                name="send"
                size={24}
                color="#7CB9E8"
                style={{ marginTop: -15 }}
              />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              fontWeight: "bold",
              marginBottom: 10,
              paddingLeft: 5,
              color: "black",
            }}
          >
            Pilih Kategori
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                paddingLeft: 5,
                marginBottom: 10,
              }}
            >
              {category.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={
                    selectedCat === item.id
                      ? {
                          padding: 8,
                          borderRadius: 5,
                          backgroundColor: "#7CB9E8",
                        }
                      : {
                          borderWidth: 1,
                          padding: 8,
                          borderRadius: 5,
                          borderColor: "gray",
                        }
                  }
                  onPress={() => toggleKategori(item.id)}
                >
                  <Text
                    style={{
                      color: selectedCat === item.id ? "white" : "black",
                      fontWeight: "600",
                    }}
                  >
                    {item.category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Text
            style={{
              fontWeight: "bold",
              marginBottom: 10,
              paddingLeft: 5,
              marginTop: 10,
              color: "black",
            }}
          >
            Deadline
          </Text>
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              gap: 10,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 10,
              padding: 8,
              marginBottom: 15,
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: "gray" }}>{date.toLocaleDateString()}</Text>
            <TouchableOpacity onPress={showDatepicker}>
              <Fontisto name="date" size={24} color="#7CB9E8" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const ToggleCategory = ({ tcategory, ToggleCat, addCategory }) => {
  const [Ocate, setOcate] = useState("");

  const handleAdd = useCallback(async () => {
    if (Ocate.trim()) {
      await addCategory(Ocate);
      setOcate("");
    }
  }, [Ocate, addCategory]);

  return (
    <Modal
      isVisible={tcategory}
      onBackdropPress={ToggleCat}
      style={{ justifyContent: "flex-end", margin: 0 }}
    >
      <View
        style={{
          backgroundColor: "white",
          padding: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          minHeight: 200,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 15,
            textAlign: "center",
            color: "black",
          }}
        >
          Tambah Kategori
        </Text>
        <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
          <TextInput
            placeholder="Masukkan Kategori"
            placeholderTextColor="#999"
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 10,
              padding: 10,
              marginBottom: 15,
              flex: 1,
              color: "black",
            }}
            value={Ocate}
            onChangeText={setOcate}
          />
          <TouchableOpacity onPress={handleAdd}>
            <Ionicons
              name="send"
              size={24}
              color="#7CB9E8"
              style={{ marginTop: -15 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const MainAda = ({
  category,
  task,
  selectedStatus,
  setSelectedStatus,
  uid,
}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [tugas, setTugas] = useState("");
  const [cat, setCat] = useState("");
  const [selectedCat, setSelectedCat] = useState(null);
  const screenWidth = Dimensions.get("window").width;

  const statusMap = {
    0: "Belum Dikerjakan",
    1: "Progress",
    2: "Selesai",
  };

  const statusIndex = Object.values(statusMap).indexOf(selectedStatus);

  const onChange = useCallback((event, selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, []);

  const showDatepicker = useCallback(() => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: onChange,
      mode: "date",
      is24Hour: true,
      themeVariant: "light",
    });
  }, [date, onChange]);

  const toggleModal = useCallback(() => {
    setModalVisible((prev) => !prev);
  }, []);

  const toggleKategori = useCallback(async (id) => {
    const docRef = doc(db, "Category", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setSelectedCat((prev) => (prev === id ? null : id));
      setCat((prev) =>
        prev === docSnap.data().category ? "" : docSnap.data().category
      );
    } else {
      Toast.show({
        type: "error",
        text1: "Gagal",
        text2: "Tidak Ada Data",
        visibilityTime: 2000,
      });
    }
  }, []);

  const addTask = useCallback(
    async (tugas, cat, date) => {
      if (!tugas.trim() || !cat) {
        Toast.show({
          type: "error",
          text1: "Gagal",
          text2: "Pilih Kategori dan Isi Tugas Dulu",
          visibilityTime: 2000,
        });
        return;
      }

      await addDoc(collection(db, "Tasks"), {
        tugas: tugas,
        category: cat,
        date: date,
        status: "Belum Dikerjakan",
        uid: uid,
      });

      setTugas("");
      setCat("");
      setSelectedCat(null);
      setDate(new Date());
      toggleModal();
    },
    [uid, toggleModal]
  );

  const buttonFontSize = Math.min(screenWidth * 0.035, 14);

  return (
    <View style={{ paddingHorizontal: 20, paddingVertical: 10, flex: 1 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          marginBottom: 10,
          color: "black",
        }}
      >
        Tugas
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 5,
          paddingHorizontal: 10,
          backgroundColor: "#F5F5F5",
          elevation: 1,
          borderRadius: 20,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((index) => {
          const status = statusMap[index];
          const isSelected = statusIndex === index;
          return isSelected ? (
            <View
              key={index}
              style={{
                backgroundColor: "#7CB9E8",
                borderRadius: 20,
                paddingHorizontal: Math.min(screenWidth * 0.04, 15),
                paddingVertical: 5,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: buttonFontSize,
                  fontWeight: "bold",
                }}
                numberOfLines={1}
              >
                {status}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedStatus(status)}
              style={{ paddingHorizontal: 5 }}
            >
              <Text
                style={{
                  color: "black",
                  fontSize: buttonFontSize,
                  fontWeight: "bold",
                }}
                numberOfLines={1}
              >
                {status}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Page task={task} />
      <TouchableOpacity
        onPress={toggleModal}
        style={{
          position: "absolute",
          right: 20,
          bottom: 20,
        }}
      >
        <Entypo name="circle-with-plus" size={40} color="#7CB9E8" />
      </TouchableOpacity>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            minHeight: 200,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 15,
              textAlign: "center",
              color: "black",
            }}
          >
            Tambah Tugas
          </Text>
          <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
            <TextInput
              placeholder="Masukkan Tugas"
              placeholderTextColor="#999"
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 10,
                padding: 8,
                marginBottom: 15,
                flex: 1,
                color: "black",
              }}
              value={tugas}
              onChangeText={setTugas}
            />
            <TouchableOpacity onPress={() => addTask(tugas, cat, date)}>
              <Ionicons
                name="send"
                size={24}
                color="#7CB9E8"
                style={{ marginTop: -15 }}
              />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              fontWeight: "bold",
              marginBottom: 10,
              paddingLeft: 5,
              color: "black",
            }}
          >
            Pilih Kategori
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                paddingLeft: 5,
                marginBottom: 10,
              }}
            >
              {category.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={
                    selectedCat === item.id
                      ? {
                          padding: 8,
                          borderRadius: 5,
                          backgroundColor: "#7CB9E8",
                        }
                      : {
                          borderWidth: 1,
                          padding: 8,
                          borderRadius: 5,
                          borderColor: "gray",
                        }
                  }
                  onPress={() => toggleKategori(item.id)}
                >
                  <Text
                    style={{
                      color: selectedCat === item.id ? "white" : "black",
                      fontWeight: "600",
                    }}
                  >
                    {item.category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Text
            style={{
              fontWeight: "bold",
              marginBottom: 10,
              paddingLeft: 5,
              marginTop: 10,
              color: "black",
            }}
          >
            Deadline
          </Text>
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              gap: 10,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 10,
              padding: 8,
              marginBottom: 15,
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: "gray" }}>{date.toLocaleDateString()}</Text>
            <TouchableOpacity onPress={showDatepicker}>
              <Fontisto name="date" size={24} color="#7CB9E8" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const Page = ({ task }) => {
  const screenWidth = Dimensions.get("window").width;
  const maxTextWidth = screenWidth - 180;

  const sortedTasks = useMemo(() => {
    return [...task].sort((a, b) => {
      const dateA = new Date(a.date?.seconds ? a.date.seconds * 1000 : 0);
      const dateB = new Date(b.date?.seconds ? b.date.seconds * 1000 : 0);
      return dateA - dateB;
    });
  }, [task]);

  const renderItem = useCallback(
    ({ item }) => (
      <View
        style={{
          padding: 8,
          backgroundColor: "#F5F5F5",
          marginTop: 20,
          marginHorizontal: 10,
          borderRadius: 10,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            maxWidth: maxTextWidth,
            color: "black",
          }}
          numberOfLines={2}
        >
          {item.tugas}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <View style={{ paddingVertical: 5, flex: 1 }}>
            <View
              style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
            >
              <Feather name="folder" size={20} color="black" />
              <Text
                numberOfLines={1}
                style={{ maxWidth: maxTextWidth, color: "#999999" }}
              >
                {item.category}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                gap: 5,
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Entypo name="back-in-time" size={20} color="black" />
              <Text
                numberOfLines={1}
                style={{ maxWidth: maxTextWidth, color: "#999999" }}
              >
                {item.date?.seconds
                  ? new Date(item.date.seconds * 1000).toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )
                  : "Tidak ada deadline"}
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor:
                item.status === "Belum Dikerjakan"
                  ? "red"
                  : item.status === "Progress"
                  ? "#ddbd04ff"
                  : "green",
              borderRadius: 10,
              padding: 7,
              minWidth: 80,
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontWeight: "bold", color: "white", fontSize: 11 }}
              numberOfLines={1}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    ),
    [maxTextWidth]
  );

  return (
    <FlatList
      data={sortedTasks}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
};

export default HomePage;
