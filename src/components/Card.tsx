import { View, ViewProps } from 'react-native';

export const Card = ({ children, className, ...props }: ViewProps) => {
    return (
        <View className={`bg-surface p-4 rounded-xl shadow-sm border border-gray-100 ${className || ''}`} {...props}>
            {children}
        </View>
    );
};
