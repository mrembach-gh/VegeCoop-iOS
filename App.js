import 'react-native-url-polyfill/auto';
import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

import { useShoppingSession } from './hooks/useShoppingSession';
import StatusDisplay from './components/StatusDisplay';
import ShoppingList from './components/ShoppingList';
import CommandInput from './components/CommandInput';

export default function App() {
    const {
        items, kitty, counts,
        startSession, addItem, deleteItem, closeSession,
        people, personId, setPersonId,
    } = useShoppingSession();

    const [lastResponse, setLastResponse] = useState('Welcome to Vege Coop');

    const formatDate = () => new Date().toLocaleDateString('en-AU', {
        day: 'numeric', month: 'long', year: 'numeric',
    });

    const handleCommand = async (result) => {
        setLastResponse('Processing...');
        let response = '';
        try {

        if (result.type === 'START') {
            const id = await startSession();
            response = id ? `Shop for ${formatDate()} started. Kitty is $313` : 'Error starting shop';

        } else if (result.type === 'ADD') {
            const { name, type, cost } = result.payload;
            const newKitty = Math.round(kitty - cost);
            const addResult = await addItem(name, type, cost);
            if (addResult?.error) {
                response = addResult.error;
            } else {
                response = `Adding ${addResult?.resolvedName || name}, kitty is $${newKitty}`;
            }

        } else if (result.type === 'DELETE') {
            const itemToDelete = items.find(i => i.name.toLowerCase() === result.payload.name.toLowerCase());
            const newKitty = itemToDelete ? Math.round(kitty + itemToDelete.cost) : Math.round(kitty);
            const success = await deleteItem(result.payload.name);
            response = success ? `Removed ${result.payload.name}, kitty is $${newKitty}` : 'Item not found';

        } else if (result.type === 'TOTAL') {
            const { vegetable = 0, fruit = 0, other = 0 } = counts;
            response = `${vegetable} vegetables, ${fruit} fruit, ${other} other. Kitty remaining $${Math.round(kitty)}`;

        } else if (result.type === 'CLOSE') {
            const title = `Vege Coop ${formatDate()}`;
            const textList = items.map(i => `${i.name}, ${i.type}, $${i.cost}`).join('\n');
            const summary = `\nTotal Items: ${items.length}\nKitty Remaining: $${kitty.toFixed(2)}`;
            const fullText = `${title}\n\n${textList}${summary}`;

            try { await closeSession(personId); } catch (e) {
                response = 'Error closing shop';
                setLastResponse(response);
                return response;
            }

            await Clipboard.setStringAsync(fullText);
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                const fileUri = FileSystem.cacheDirectory + 'vege-coop.txt';
                await FileSystem.writeAsStringAsync(fileUri, fullText);
                await Sharing.shareAsync(fileUri, { mimeType: 'text/plain', dialogTitle: title }).catch(() => {});
            }
            response = 'Shop closed.';

        } else if (result.type === 'ERROR') {
            response = result.message;
        }

        } catch (err) {
            console.error('Command error:', err);
            response = 'Something went wrong. Please try again.';
            Alert.alert('Error', err.message || 'Unknown error');
        }

        setLastResponse(response);
        return response;
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safe}>
                <StatusBar style="light" />
                <View style={styles.container}>
                    <StatusDisplay
                        people={people}
                        selectedPersonId={personId}
                        onPersonChange={setPersonId}
                    />
                    <ShoppingList items={items} onDelete={deleteItem} />
                    <CommandInput
                        onCommand={handleCommand}
                        lastResponse={lastResponse}
                        counts={counts}
                        kitty={kitty}
                    />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#121212',
    },
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
});
