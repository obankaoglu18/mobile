import { TouchableOpacity, Text, TouchableOpacityProps, ViewStyle, StyleSheet } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    style?: ViewStyle;
}

export const Button = ({ title, variant = 'primary', style, ...props }: ButtonProps) => {
    const getButtonStyle = () => {
        const base = {
            paddingHorizontal: 24,
            paddingVertical: 14,
            borderRadius: 24,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            shadowColor: variant === 'primary' ? '#0F766E' : '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: variant === 'primary' ? 0.3 : 0.15,
            shadowRadius: 8,
            elevation: 5,
        };

        if (variant === 'primary') {
            return { ...base, backgroundColor: '#0F766E' };
        } else if (variant === 'secondary') {
            return { ...base, backgroundColor: '#E2E8F0' };
        } else {
            return { ...base, backgroundColor: 'transparent', borderWidth: 2, borderColor: '#0F766E' };
        }
    };

    const getTextStyle = () => {
        if (variant === 'primary') {
            return styles.primaryText;
        } else if (variant === 'secondary') {
            return styles.secondaryText;
        } else {
            return styles.outlineText;
        }
    };

    return (
        <TouchableOpacity
            style={[getButtonStyle(), style]}
            activeOpacity={0.75}
            {...props}
        >
            <Text style={getTextStyle()}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    primaryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryText: {
        color: '#1E293B',
        fontSize: 16,
        fontWeight: '700',
    },
    outlineText: {
        color: '#0F766E',
        fontSize: 16,
        fontWeight: '700',
    },
});
