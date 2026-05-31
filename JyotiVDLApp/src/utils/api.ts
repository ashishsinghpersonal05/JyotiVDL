import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// For Android Emulators, localhost is 10.0.2.2
// If running on a physical device, you might need to change this to your computer's local IP (e.g., 192.168.1.10)
const getBaseUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    return `http://${debuggerHost.split(':')[0]}:3000`;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

const API_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchData = async () => {
  try {
    const [
      contactsRes,
      investmentsRes,
      propertiesRes,
      loansRes,
      rdsRes,
      fdsRes,
      mfsRes
    ] = await Promise.all([
      api.get('/api/contacts'),
      api.get('/api/investments'),
      api.get('/api/properties'),
      api.get('/api/loans'),
      api.get('/api/rds'),
      api.get('/api/fds'),
      api.get('/api/mfs')
    ]);

    return {
      contacts: contactsRes.data,
      investments: investmentsRes.data,
      properties: propertiesRes.data,
      loans: loansRes.data,
      recurringDeposits: rdsRes.data,
      fixedDeposits: fdsRes.data,
      mutualFunds: mfsRes.data
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export default api;
