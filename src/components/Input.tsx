import { TextInput, TextInputProps, View, Text, StyleSheet } from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input = ({ label, error, ...props }: InputProps) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholderTextColor="#94a3b8"
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155', // Slate-700
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    input: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E2E8F0', // Slate-200
        borderRadius: 14,
        fontSize: 16,
        color: '#0F172A', // Slate-900
        shadowColor: '#0F766E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    inputError: {
        borderColor: '#EF4444', // Red-500
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        marginTop: 6,
        marginLeft: 4,
    },
});
