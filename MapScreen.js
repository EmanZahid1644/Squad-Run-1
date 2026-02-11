import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Animated, Easing, Dimensions, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen({ route }) {
  const { squadId } = route.params || { squadId: "SQUAD_X" };
  const [location, setLocation] = useState(null);
  const [decryption, setDecryption] = useState(0);
  const [missionStatus, setMissionStatus] = useState("EN ROUTE");
  const [showSquad, setShowSquad] = useState(false);
  const [distance, setDistance] = useState(null);
  
  // Chat States
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: '1', user: 'Ali', msg: 'I am near the terminal!', time: '2m ago' },
    { id: '2', user: 'Zain', msg: 'Hold position, I am coming.', time: '1m ago' },
    { id: '3', user: 'Sana', msg: 'Signal is 100% here! 🔥', time: 'Just now' },
  ]);

  const spinValue = useRef(new Animated.Value(0)).current;
  const targetLocation = { latitude: 31.5204, longitude: 74.3587 };

  useEffect(() => {
    Animated.loop(Animated.timing(spinValue, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })).start();
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      Location.watchPositionAsync({ accuracy: Location.Accuracy.High, distanceInterval: 1 }, (newLoc) => {
        setLocation(newLoc.coords);
        const dist = Math.sqrt(Math.pow(newLoc.coords.latitude - targetLocation.latitude, 2) + Math.pow(newLoc.coords.longitude - targetLocation.longitude, 2));
        setDistance((dist * 111139).toFixed(0));
        if (dist < 0.002) { 
          setMissionStatus("DECRYPTING...");
          setDecryption(prev => Math.min(100, prev + 2));
        } else { setMissionStatus("EN ROUTE"); }
      });
    })();
  }, []);

  const sendMessage = () => {
    if (inputText.trim().length > 0) {
      const newMessage = {
        id: Math.random().toString(),
        user: 'Me',
        msg: inputText,
        time: 'Just now'
      };
      setChatMessages([newMessage, ...chatMessages]);
      setInputText('');
    }
  };

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      {/* MAP & OBJECTIVE HEADER (Keep existing UI) */}
      <View style={styles.goalHeader}>
        <Text style={styles.goalLabel}>CURRENT OBJECTIVE</Text>
        <Text style={styles.goalText}>EXTRACT DATA FROM TERMINAL 01</Text>
        <Text style={styles.distanceText}>{distance ? `${distance}m AWAY` : "CALCULATING..."}</Text>
      </View>

      <MapView style={styles.map} initialRegion={{ ...targetLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }}>
        <Circle center={targetLocation} radius={250} fillColor="rgba(0, 245, 255, 0.1)" strokeColor="#00F5FF" />
        <Marker coordinate={targetLocation} title="OBJECTIVE" />
        {location && <Marker coordinate={location} title="YOU" pinColor="#7000FF" />}
      </MapView>

      {/* SQUAD & CHAT MODAL */}
      <Modal visible={showSquad} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
          <View style={styles.squadOverlay}>
            <View style={styles.squadSheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.squadTitle}>SQUAD INTEL</Text>
              
              <ScrollView style={{maxHeight: 400}}>
                <View style={styles.section}>
                   <Text style={styles.sectionLabel}>SQUAD CHAT (LIVE)</Text>
                   {chatMessages.map(m => (
                     <View key={m.id} style={[styles.chatBubble, m.user === 'Me' && styles.myBubble]}>
                        <Text style={[styles.chatUser, m.user === 'Me' && {color: '#00F5FF'}]}>{m.user}: <Text style={styles.chatMsg}>{m.msg}</Text></Text>
                     </View>
                   ))}
                </View>
              </ScrollView>

              {/* REAL INPUT FIELD */}
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.textInput}
                  placeholder="Type encrypted message..."
                  placeholderTextColor="#444"
                  value={inputText}
                  onChangeText={setInputText}
                />
                <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                  <Text style={styles.sendBtnText}>SEND</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={{marginTop: 15}} onPress={() => setShowSquad(false)}>
                <Text style={{color: '#666', textAlign: 'center'}}>Return to Tactical Map</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* HUD & BUTTONS (Keep existing UI) */}
      <View style={styles.missionControl}>
        <View style={styles.liveHeader}><View style={styles.redDot} /><Text style={styles.liveText}>SQUAD FEED - {missionStatus}</Text></View>
        <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${decryption}%` }]} /></View>
        <Text style={styles.statValue}>ENCRYPTION: {decryption}%</Text>
      </View>

      <View style={styles.radarFrame}><Animated.View style={[styles.radarSweep, { transform: [{ rotate: spin }] }]} /></View>
      <TouchableOpacity style={styles.openSquadBtn} onPress={() => setShowSquad(true)}>
        <Text style={styles.openSquadText}>SQUAD (3)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sosBtn} onPress={() => alert("SOS Alert Sent!")}><Text style={styles.btnText}>SOS</Text></TouchableOpacity>

      {decryption === 100 && (
        <View style={styles.victoryScreen}>
          <Text style={styles.victoryText}>MISSION SUCCESS 🎉</Text>
          <TouchableOpacity style={styles.claimBtn} onPress={() => alert("Success!")}><Text style={styles.claimBtnText}>FINISH</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  map: { width: '100%', height: '100%' },
  goalHeader: { position: 'absolute', top: 40, width: '90%', alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.85)', padding: 15, borderRadius: 10, zIndex: 10, borderWidth: 1, borderColor: '#00F5FF' },
  goalLabel: { color: '#00F5FF', fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  goalText: { color: '#fff', fontSize: 13, fontWeight: '900', textAlign: 'center', marginTop: 5 },
  distanceText: { color: '#FFD700', fontSize: 12, textAlign: 'center', fontWeight: 'bold' },
  missionControl: { position: 'absolute', top: 150, left: 20, right: 20, backgroundColor: 'rgba(0,10,20,0.85)', padding: 15, borderRadius: 5 },
  liveHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  redDot: { width: 8, height: 8, backgroundColor: 'red', borderRadius: 4, marginRight: 8 },
  liveText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  statValue: { color: '#00F5FF', fontSize: 12, fontWeight: 'bold', marginTop: 5, textAlign: 'right' },
  progressBarBg: { height: 4, backgroundColor: '#111' },
  progressBarFill: { height: '100%', backgroundColor: '#00F5FF' },
  radarFrame: { position: 'absolute', bottom: 30, left: 20, width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(0,245,255,0.05)', borderWidth: 1, borderColor: '#00F5FF', overflow: 'hidden' },
  radarSweep: { width: 70, height: 35, backgroundColor: 'rgba(0,245,255,0.2)', borderTopWidth: 1, borderTopColor: '#00F5FF' },
  openSquadBtn: { position: 'absolute', bottom: 35, left: 100, backgroundColor: '#000', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#00F5FF' },
  openSquadText: { color: '#00F5FF', fontWeight: 'bold', fontSize: 12 },
  sosBtn: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#FF0055', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  squadOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  squadSheet: { backgroundColor: '#050505', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, borderTopWidth: 2, borderTopColor: '#00F5FF' },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#333', alignSelf: 'center', borderRadius: 2, marginBottom: 20 },
  squadTitle: { color: '#00F5FF', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 10 },
  sectionLabel: { color: '#444', fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
  chatBubble: { backgroundColor: '#111', padding: 10, borderRadius: 10, marginBottom: 5, borderLeftWidth: 3, borderLeftColor: '#7000FF' },
  myBubble: { borderLeftColor: '#00F5FF', backgroundColor: '#1a1a1a' },
  chatUser: { color: '#7000FF', fontWeight: 'bold', fontSize: 11 },
  chatMsg: { color: '#eee', fontWeight: 'normal' },
  
  // New Input Styles
  inputWrapper: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  textInput: { flex: 1, backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#333', fontSize: 14 },
  sendBtn: { marginLeft: 10, backgroundColor: '#00F5FF', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  sendBtnText: { color: '#000', fontWeight: 'bold', fontSize: 12 },

  victoryScreen: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.98)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  victoryText: { color: '#00F5FF', fontSize: 32, fontWeight: '900' },
  claimBtn: { marginTop: 40, backgroundColor: '#00F5FF', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
  claimBtnText: { color: '#000', fontWeight: 'bold' }
});