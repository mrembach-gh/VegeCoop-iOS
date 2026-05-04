import { useState } from 'react';
import {
    View, Text, TouchableOpacity, Modal, ScrollView,
    StyleSheet, Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const COMMANDS = [
    { cmd: 'start  /  s', desc: 'Begin a new shopping session' },
    { cmd: 'add [item] [v/f/o] [price]', desc: 'Add item — e.g.  a carrots v 8' },
    { cmd: 'delete [item]  /  d [item]', desc: 'Remove an item from the list' },
    { cmd: 'total  /  t', desc: 'Read out counts and kitty balance' },
    { cmd: 'close  /  c', desc: 'Close session and share the list' },
];

export default function StatusDisplay({ people = [], selectedPersonId, onPersonChange }) {
    const [showHelp, setShowHelp] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    const dateStr = new Date().toLocaleDateString('en-AU', {
        weekday: 'short', day: 'numeric', month: 'short',
    });

    const selectedPerson = people.find(p => p.PersonID === selectedPersonId);

    return (
        <>
            <View style={styles.header}>
                {/* Brand */}
                <View style={styles.brand}>
                    <Text style={styles.brandIcon}>🌿</Text>
                    <Text style={styles.brandName}>Vege Coop</Text>
                </View>

                {/* Right actions */}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.personPill} onPress={() => setShowPicker(true)}>
                        <Text style={styles.personText}>
                            {selectedPerson ? selectedPerson.PersonName : 'Shopper'} ▾
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.helpBtn} onPress={() => setShowHelp(true)}>
                        <Text style={styles.helpText}>?</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.dateBar}>{dateStr}</Text>

            {/* Person picker modal */}
            <Modal visible={showPicker} transparent animationType="slide">
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerSheet}>
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>Select Shopper</Text>
                            <TouchableOpacity onPress={() => setShowPicker(false)}>
                                <Text style={styles.pickerDone}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <Picker
                            selectedValue={selectedPersonId}
                            onValueChange={(val) => { onPersonChange(val); }}
                            style={styles.picker}
                            itemStyle={styles.pickerItem}
                        >
                            {people.map(p => (
                                <Picker.Item key={p.PersonID} label={p.PersonName} value={p.PersonID} />
                            ))}
                        </Picker>
                    </View>
                </View>
            </Modal>

            {/* Help modal */}
            <Modal visible={showHelp} transparent animationType="slide">
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowHelp(false)}>
                    <View style={styles.helpSheet}>
                        <View style={styles.helpHeader}>
                            <Text style={styles.helpTitle}>How to use Vege Coop</Text>
                            <TouchableOpacity onPress={() => setShowHelp(false)}>
                                <Text style={styles.closeBtn}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.helpSubtitle}>Tap ADD to type a command.</Text>

                        <ScrollView style={styles.commandList}>
                            {COMMANDS.map(({ cmd, desc }) => (
                                <View key={cmd} style={styles.commandRow}>
                                    <Text style={styles.commandCode}>{cmd}</Text>
                                    <Text style={styles.commandDesc}>{desc}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.tips}>
                            <Text style={styles.tip}>Kitty starts at $320 · Parking $2 · Trolley $5 added automatically</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 56 : 16,
        paddingBottom: 8,
        backgroundColor: '#121212',
    },
    brand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    brandIcon: { fontSize: 22 },
    brandName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    personPill: {
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#333',
    },
    personText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
    },
    helpBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#1E1E1E',
        borderWidth: 1,
        borderColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    helpText: {
        color: '#aaa',
        fontSize: 13,
        fontWeight: '700',
    },
    dateBar: {
        textAlign: 'center',
        color: '#666',
        fontSize: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    // Picker
    pickerOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    pickerSheet: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 34,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    pickerTitle: { color: '#fff', fontWeight: '600', fontSize: 16 },
    pickerDone: { color: '#4CAF50', fontWeight: '600', fontSize: 16 },
    picker: { color: '#fff' },
    pickerItem: { color: '#fff', backgroundColor: '#1E1E1E' },
    // Help
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    helpSheet: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    helpHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    helpTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
    closeBtn: { color: '#888', fontSize: 18 },
    helpSubtitle: { color: '#888', fontSize: 13, marginBottom: 16 },
    commandList: { gap: 8 },
    commandRow: {
        backgroundColor: '#121212',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    commandCode: { color: '#4CAF50', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', fontSize: 13, fontWeight: '600' },
    commandDesc: { color: '#aaa', fontSize: 12, marginTop: 2 },
    tips: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#333', paddingTop: 12 },
    tip: { color: '#666', fontSize: 12, textAlign: 'center' },
});
