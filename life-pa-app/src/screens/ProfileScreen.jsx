import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { getCurrentUser } from '../services/auth';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';
import CardContainer from '../components/CardContainer';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export default function ProfileScreen({ navigation }) {
  const user = getCurrentUser();

  return (
    <Layout style={styles.layout}>
      <AppHeader 
        title="Profile" 
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <CardContainer elevated style={styles.card}>
          <Text style={styles.cardTitle}>User Profile</Text>
          
          <View style={styles.profileSection}>
            <Text style={styles.label}>Display Name</Text>
            <Text style={styles.value}>{user?.displayName || 'Not set'}</Text>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.label}>Email Address</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.label}>Account Status</Text>
            <Text style={[styles.value, styles.verified]}>✓ Verified</Text>
          </View>
        </CardContainer>

        <CardContainer style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.description}>
            This is your profile page. Profile editing features will be added in a future update.
          </Text>
        </CardContainer>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  layout: {
    padding: 0,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: fonts.sizes.title,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  profileSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  label: {
    fontSize: fonts.sizes.small,
    fontWeight: '600',
    color: colors.text,
    opacity: 0.6,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: fonts.sizes.body,
    color: colors.text,
    fontWeight: '500',
  },
  verified: {
    color: colors.success,
  },
  description: {
    fontSize: fonts.sizes.body,
    color: colors.text,
    opacity: 0.7,
    lineHeight: 22,
  },
});

