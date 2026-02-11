import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Share } from 'react-native';

export default function LobbyScreen({ navigation }) {
  const [code, setCode] = useState('');
  const [createdCode, setCreatedCode] = useState(null);

  const handleCreate = () => {
    const newCode = Math.random().toString(36).substring(7).toUpperCase();
    setCreatedCode(newCode); // Pehle code generate hoga
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `Join my Squad on SQUAD RUN! Code: ${createdCode}`,
      });
    } catch (error) { alert(error.message); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SQUAD RUN</Text>
      
      {!createdCode ? (
        <View style={styles.card}>
          <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
            <Text style={styles.btnText}>CREATE NEW SQUAD</Text>
          </TouchableOpacity>
          <View style={styles.divider}><View style={styles.line}/><Text style={{color:'#444'}}> OR </Text><View style={styles.line}/></View>
          <TextInput 
            style={styles.input} 
            placeholder="ENTER SQUAD CODE" 
            placeholderTextColor="#444" 
            onChangeText={setCode} 
          />
          <TouchableOpacity 
            style={[styles.createBtn, {backgroundColor: '#7000FF'}]} 
            onPress={() => code && navigation.navigate('Map', { squadId: code })}
          >
            <Text style={styles.btnText}>JOIN SQUAD</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.codeTitle}>SQUAD READY!</Text>
          <Text style={styles.bigCode}>{createdCode}</Text>
          
          <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
            <Text style={styles.btnText}>📤 SHARE WITH FRIENDS</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.startBtn} 
            onPress={() => navigation.navigate('Map', { squadId: createdCode })}
          >
            <Text style={styles.btnText}>🚀 START MISSION</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setCreatedCode(null)}>
            <Text style={{color: '#666', textAlign: 'center', marginTop: 15}}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B', justifyContent: 'center', padding: 20 },
  title: { fontSize: 42, fontWeight: '900', color: '#00F5FF', textAlign: 'center', marginBottom: 40 },
  card: { backgroundColor: '#121214', padding: 25, borderRadius: 25, borderWidth: 1, borderColor: '#1A1A1C' },
  codeTitle: { color: '#fff', textAlign: 'center', fontSize: 14, opacity: 0.6 },
  bigCode: { color: '#00F5FF', fontSize: 48, fontWeight: '900', textAlign: 'center', marginVertical: 20, letterSpacing: 5 },
  createBtn: { backgroundColor: '#00F5FF', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  shareBtn: { backgroundColor: '#333', height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  startBtn: { backgroundColor: '#7000FF', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  input: { height: 60, backgroundColor: '#000', borderRadius: 15, color: '#00F5FF', textAlign: 'center', fontSize: 20, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#222' }
});