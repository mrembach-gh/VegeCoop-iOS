import { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';
import { parseCommand } from '../utils/commandParser';

export default function CommandInput({ onCommand, lastResponse, counts, kitty }) {
    const [inputValue, setInputValue] = useState('');
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const safeCounts = counts || { vegetable: 0, fruit: 0, other: 0 };
    const onCommandRef = useRef(onCommand);
    const isListeningRef = useRef(false);
    const transcriptRef = useRef('');

    useEffect(() => { onCommandRef.current = onCommand; }, [onCommand]);

    const speak = (text) => {
        if (!text) return;
        Speech.stop();
        Speech.speak(text, { language: 'en-AU', rate: 0.95 });
    };

    // Voice recognition — just accumulate transcript, don't process yet
    useEffect(() => {
        Voice.onSpeechResults = (e) => {
            const transcript = e.value?.[0];
            if (transcript) transcriptRef.current = transcript;
        };

        Voice.onSpeechError = (e) => {
            console.warn('Voice error:', e.error);
        };

        return () => { Voice.destroy().then(Voice.removeAllListeners); };
    }, []);

    const toggleListening = async () => {
        try {
            if (isListeningRef.current) {
                // Turn OFF — stop and process whatever was heard
                isListeningRef.current = false;
                setIsListening(false);
                await Voice.stop();

                const transcript = transcriptRef.current;
                transcriptRef.current = '';
                if (transcript) {
                    const result = parseCommand(transcript);
                    const responseText = await onCommandRef.current(result, transcript);
                    if (responseText) speak(responseText);
                }
            } else {
                // Turn ON — start listening
                transcriptRef.current = '';
                isListeningRef.current = true;
                setIsListening(true);
                Speech.stop();
                await Voice.start('en-AU');
            }
        } catch (e) {
            console.error('Voice toggle error:', e);
            Alert.alert('Voice Error', 'Could not start voice recognition. Check microphone permissions.');
            isListeningRef.current = false;
            setIsListening(false);
        }
    };

    const handleSubmit = async () => {
        if (!inputValue.trim()) return;
        const result = parseCommand(inputValue);
        setInputValue('');
        setIsInputVisible(false);
        const responseText = await onCommand(result, inputValue);
        if (responseText) speak(responseText);
    };

    const handleQuickCommand = async (type) => {
        const result = { type };
        const responseText = await onCommand(result, type.toLowerCase());
        if (responseText) speak(responseText);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            {!isInputVisible ? (
                <View style={styles.footer}>

                    {/* Start / Close buttons */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.startButton]}
                            onPress={() => handleQuickCommand('START')}
                        >
                            <Text style={styles.actionButtonText}>▶ Start Shop</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.closeButton]}
                            onPress={() => handleQuickCommand('CLOSE')}
                        >
                            <Text style={styles.actionButtonText}>✕ Close Shop</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Stats + mic + add */}
                    <View style={styles.fabRow}>
                        <View style={styles.statsBar}>
                            <Text style={styles.stat}>🍎 {safeCounts.fruit || 0}</Text>
                            <Text style={styles.stat}>🥦 {safeCounts.vegetable || 0}</Text>
                            <Text style={styles.stat}>📦 {safeCounts.other || 0}</Text>
                            <View style={styles.divider} />
                            <Text style={styles.kitty}>${Math.round(kitty)}</Text>
                        </View>

                        <View style={styles.rightButtons}>
                            <TouchableOpacity
                                style={[styles.micButton, isListening && styles.micListening]}
                                onPress={toggleListening}
                            >
                                <Text style={styles.micIcon}>{isListening ? '🔴' : '🎤'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setIsInputVisible(true)}
                            >
                                <Text style={styles.addButtonText}>+ ADD</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            ) : (
                <View style={styles.inputPanel}>
                    <View style={styles.inputHeader}>
                        <Text style={styles.inputTitle}>Enter command</Text>
                        <TouchableOpacity onPress={() => setIsInputVisible(false)}>
                            <Text style={styles.closeX}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.input}
                        value={inputValue}
                        onChangeText={setInputValue}
                        placeholder="e.g.  a carrots v 8"
                        placeholderTextColor="#555"
                        autoFocus
                        autoCapitalize="none"
                        returnKeyType="send"
                        onSubmitEditing={handleSubmit}
                    />

                    <View style={styles.inputFooter}>
                        <Text style={styles.lastResponse} numberOfLines={1}>{lastResponse}</Text>
                        <TouchableOpacity style={styles.sendButton} onPress={handleSubmit}>
                            <Text style={styles.sendText}>Send ➤</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    footer: {
        gap: 10,
        paddingHorizontal: 16,
        paddingBottom: 36,
        paddingTop: 10,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startButton: {
        backgroundColor: '#2E7D32',
    },
    closeButton: {
        backgroundColor: '#B71C1C',
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
    fabRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    stat: { color: '#fff', fontSize: 13, fontWeight: '600' },
    divider: { width: 1, height: 14, backgroundColor: '#444' },
    kitty: { color: '#4CAF50', fontWeight: '700', fontSize: 14 },
    rightButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    micButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f44336',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#f44336',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    micListening: {
        backgroundColor: '#4CAF50',
        shadowColor: '#4CAF50',
    },
    micIcon: { fontSize: 20 },
    addButton: {
        backgroundColor: '#2196F3',
        borderRadius: 28,
        paddingHorizontal: 22,
        paddingVertical: 12,
        shadowColor: '#2196F3',
        shadowOpacity: 0.4,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    addButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    inputPanel: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderColor: '#333',
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: -4 },
    },
    inputHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputTitle: { color: '#fff', fontWeight: '600', fontSize: 15 },
    closeX: { color: '#888', fontSize: 18 },
    input: {
        backgroundColor: '#121212',
        color: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    inputFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastResponse: { color: '#888', fontSize: 13, flex: 1, marginRight: 12 },
    sendButton: {
        backgroundColor: '#2196F3',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    sendText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
