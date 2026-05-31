import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MainCardProps {
  label: string;
  amount: string;
  icon: React.ReactNode;
}

const MainCard: React.FC<MainCardProps> = ({ label, amount, icon }) => {
  return (
    <LinearGradient
      colors={['#4f46e5', '#3b82f6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>{icon}</View>
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.amount}>{amount}</Text>
      </View>
      
      {/* Decorative Circles */}
      <View style={[styles.decor, styles.decor1]} />
      <View style={[styles.decor, styles.decor2]} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    padding: 28,
    zIndex: 2,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: 8,
    borderRadius: 12,
    marginRight: 10,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  amount: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  decor: {
    position: 'absolute',
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  decor1: {
    width: 200,
    height: 200,
    top: -80,
    right: -50,
  },
  decor2: {
    width: 150,
    height: 150,
    bottom: -60,
    left: -40,
  },
});

export default MainCard;
