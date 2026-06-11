import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const typeIcon = (type) => {
    if (type === 'vegetable') return '🥦';
    if (type === 'fruit') return '🍎';
    return '📦';
};

export default function ShoppingList({ items, onDelete }) {
    const confirmDelete = (item) => {
        Alert.alert(
            'Remove item?',
            `${item.name} — $${item.cost.toFixed(2)}`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.name) },
            ]
        );
    };

    if (items.length === 0) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyText}>No items yet — say "start" to begin</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.row} onPress={() => confirmDelete(item)} activeOpacity={0.6}>
                    <View style={styles.deleteCircle} />
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.right}>
                        <Text style={styles.icon}>{typeIcon(item.type)}</Text>
                        <Text style={styles.cost}>${item.cost.toFixed(2)}</Text>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        paddingBottom: 120,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    deleteCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#4CAF50',
        marginRight: 14,
    },
    name: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
        textTransform: 'capitalize',
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    icon: {
        fontSize: 18,
    },
    cost: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
        minWidth: 50,
        textAlign: 'right',
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        color: '#666',
        fontSize: 15,
        textAlign: 'center',
    },
});
