import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, AppState, AppStateStatus, ScrollView, Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

export default function App() {
  const [managerId, setManagerId] = useState('12');
  const [serverUrl, setServerUrl] = useState('http://159.223.105.135:3000');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [pendingCall, setPendingCall] = useState<any>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
      stopAgent();
    };
  }, [pendingCall, serverUrl, managerId]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      if (pendingCall) {
        addLog('Qo\'ng\'iroq tugadi shekilli, fayllarni tekshiramiz...');
        await checkAndUploadRecording();
        setPendingCall(null);
        if (isRunning) {
          startAgent(); // Resume polling
        }
      }
    }
    appState.current = nextAppState;
  };

  const startAgent = () => {
    setIsRunning(true);
    addLog(`Agent ishga tushdi. ID: ${managerId}`);
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/agent/queue?managerId=${managerId}`);
        if (res.data.success && res.data.data) {
          const callData = res.data.data;
          addLog(`Yangi buyruq: ${callData.phone} ga qo'ng'iroq...`);
          executeCall(callData);
        }
      } catch (error: any) {
        // addLog(`Ulanish xatosi: ${error.message}`);
      }
    }, 3000);
  };

  const stopAgent = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    addLog('Agent to\'xtatildi.');
  };

  const executeCall = async (callData: any) => {
    stopAgent(); // Pause polling
    setPendingCall({ ...callData, startTime: new Date() });
    
    try {
      if (Platform.OS === 'android') {
        await IntentLauncher.startActivityAsync('android.intent.action.CALL', {
          data: `tel:${callData.phone}`
        });
        addLog('Raqam terilmoqda...');
      } else {
        addLog("Diqqat! Bu funksiya faqat Android uchun.");
        setPendingCall(null);
        startAgent();
      }
    } catch (e: any) {
      addLog(`Ruxsat xatosi: ${e.message}`);
      setPendingCall(null);
      startAgent();
    }
  };

  const checkAndUploadRecording = async () => {
    if (!pendingCall) return;

    // Simulate looking for the latest file in MIUI call records folder
    // Note: In a real environment with permissions, we would use FileSystem.readDirectoryAsync on SAF URIs
    // Since we don't have SAF configured for this prototype, we'll simulate the upload with a dummy file or try a direct path.
    const miuiPath = 'file:///storage/emulated/0/MIUI/sound_recorder/call_rec/';
    
    addLog(`Papka tekshirilmoqda: call_rec/`);
    
    let latestFileUri = null;
    let fileName = '';
    
    try {
      const dirInfo = await FileSystem.getInfoAsync(miuiPath);
      if (dirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(miuiPath);
        if (files.length > 0) {
          // Sort by name or assuming last is newest
          fileName = files[files.length - 1];
          latestFileUri = miuiPath + fileName;
          addLog(`Fayl topildi: ${fileName}`);
        }
      }
    } catch (e) {
      addLog(`Papka o'qish imkonsiz (Ruxsat kerak)`);
    }

    // Calculate duration
    const durationSecs = Math.floor((new Date().getTime() - pendingCall.startTime.getTime()) / 1000);

    // Upload using FormData
    const formData = new FormData();
    formData.append('managerId', managerId);
    formData.append('phone', pendingCall.phone);
    formData.append('duration', String(durationSecs));
    formData.append('targetId', pendingCall.targetId || '');
    formData.append('targetModel', pendingCall.targetModel || '');
    formData.append('status', durationSecs > 10 ? 'javob_berildi' : 'javobsiz');
    formData.append('date', new Date().toISOString());

    if (latestFileUri) {
      // @ts-ignore
      formData.append('audio', {
        uri: latestFileUri,
        name: fileName,
        type: 'audio/mpeg'
      });
    }

    try {
      addLog(`Serverga yuklanmoqda...`);
      const res = await axios.post(`${serverUrl}/api/agent/upload-log`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        addLog(`Muvaffaqiyatli yuklandi!`);
      } else {
        addLog(`Yuklash xatosi: ${res.data.error}`);
      }
    } catch (e: any) {
      addLog(`Server xatosi: ${e.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CRM Agent</Text>
        <View style={[styles.statusIndicator, { backgroundColor: isRunning ? '#10b981' : '#ef4444' }]} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Manager ID</Text>
        <TextInput 
          style={styles.input} 
          value={managerId} 
          onChangeText={setManagerId}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Server URL</Text>
        <TextInput 
          style={styles.input} 
          value={serverUrl} 
          onChangeText={setServerUrl}
          autoCapitalize="none"
        />

        {isRunning ? (
          <TouchableOpacity style={[styles.button, styles.btnStop]} onPress={stopAgent}>
            <Text style={styles.buttonText}>Agentni To'xtatish</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.btnStart]} onPress={startAgent}>
            <Text style={styles.buttonText}>Agentni Boshlash</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.logTitle}>Loglar</Text>
      <ScrollView style={styles.logContainer}>
        {logs.map((log, i) => (
          <Text key={i} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  statusIndicator: { width: 14, height: 14, borderRadius: 7 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, marginBottom: 20 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 16, color: '#111827' },
  button: { padding: 16, borderRadius: 8, alignItems: 'center' },
  btnStart: { backgroundColor: '#2563eb' },
  btnStop: { backgroundColor: '#ef4444' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  logTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 10 },
  logContainer: { flex: 1, backgroundColor: '#1f2937', borderRadius: 12, padding: 16, marginBottom: 20 },
  logText: { color: '#10b981', fontFamily: 'monospace', fontSize: 11, marginBottom: 4 }
});
