import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface KPICardProps {
  label: string;
  amount: string;
  icon: React.ReactNode;
  accentColor: string;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 40 - 16) / 2; // 20 padding on each side (40), 16 gap, divided by 2

const KPICard: React.FC<KPICardProps> = ({ label, amount, icon, accentColor }) => {
  return (
    <View style={styles.cardContainer}>
      <BlurView intensity={20} tint="light" style={styles.blurContainer}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: `${accentColor}20` }]}>
            {React.cloneElement(icon as React.ReactElement, { color: accentColor })}
          </View>
          <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit>{amount}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
        <View style={[styles.bottomAccent, { backgroundColor: accentColor }]} />
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  blurContainer: {
    padding: 16,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  amount: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  label: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.8,
  }
});

export default KPICard;
