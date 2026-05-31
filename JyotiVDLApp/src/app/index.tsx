import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, SafeAreaView, StatusBar, Image } from 'react-native';
import { Wallet, TrendingUp, Users, CreditCard, ShieldAlert, PiggyBank } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import KPICard from '../components/KPICard';
import MainCard from '../components/MainCard';
import Colors from '../constants/Colors';
import { fetchData } from '../utils/api';

export default function DashboardScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const resData = await fetchData();
      setData(resData);
    } catch (err) {
      console.error(err);
      setError('Failed to load data from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculations
  const calculateTotal = (arr: any[], type: 'give' | 'receive' | 'balance' = 'balance') => {
    if (!arr || !Array.isArray(arr)) return 0;
    return arr.reduce((sum, item) => sum + (Number(item[type] || item.currentValue || item.totalInvested || item.totalDeposited) || 0), 0);
  };

  // Customers (Lent)
  const customersTotal = calculateTotal(data?.contacts, 'balance');
  
  // Investments
  const investmentsTotal = calculateTotal(data?.investments, 'currentValue');
  const mfTotal = calculateTotal(data?.mutualFunds, 'totalInvested');
  const rdTotal = calculateTotal(data?.recurringDeposits, 'totalDeposited');
  const fdTotal = calculateTotal(data?.fixedDeposits, 'totalDeposited');
  const totalInvestments = investmentsTotal + mfTotal + rdTotal + fdTotal;

  // Loans (Liabilities)
  const loansTotal = calculateTotal(data?.loans, 'balance');

  // Properties
  const propertiesTotal = calculateTotal(data?.properties, 'currentValue');

  // Net Worth calculations
  const netWorthExclProp = (customersTotal + totalInvestments) - loansTotal;
  const netWorthInclProp = netWorthExclProp + propertiesTotal;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#0f172a', '#1e1b4b', '#0f172a']} // Deep slate to dark indigo back to slate
      style={styles.safeArea}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View>
              <Text style={styles.greetingText}>Good Morning,</Text>
              <Text style={styles.headerTitle}>Jyoti VDL</Text>
            </View>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>JV</Text>
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <ShieldAlert color={Colors.danger} size={20} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Main Featured Card */}
          <MainCard
            label="Total Net Worth"
            amount={formatCurrency(netWorthInclProp)}
            icon={<Wallet color="#ffffff" size={24} />}
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Portfolio Overview</Text>
          </View>

          {/* 2-Column Grid */}
          <View style={styles.grid}>
            <KPICard
              label="Liquid Net Worth"
              amount={formatCurrency(netWorthExclProp)}
              icon={<Wallet size={20} />}
              accentColor={Colors.info}
            />
            
            <KPICard
              label="Total Investments"
              amount={formatCurrency(totalInvestments)}
              icon={<TrendingUp size={20} />}
              accentColor={Colors.success}
            />

            <KPICard
              label="Customers Due"
              amount={formatCurrency(customersTotal)}
              icon={<Users size={20} />}
              accentColor={Colors.warning}
            />

            <KPICard
              label="Loans Owed"
              amount={formatCurrency(loansTotal)}
              icon={<CreditCard size={20} />}
              accentColor={Colors.danger}
            />
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greetingText: {
    fontSize: 15,
    color: '#94a3b8',
    marginBottom: 4,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#a5b4fc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#fca5a5',
    marginLeft: 10,
    fontWeight: '500',
  },
});
