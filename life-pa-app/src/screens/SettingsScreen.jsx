import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';
import CardContainer from '../components/CardContainer';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export default function SettingsScreen({ navigation }) {
  const settingsSections = [
    {
      title: 'Account',
      items: [
        { label: 'Email & Password', icon: '🔐' },
        { label: 'Privacy', icon: '🔒' },
        { label: 'Security', icon: '🛡️' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Notifications', icon: '🔔' },
        { label: 'Appearance', icon: '🎨' },
        { label: 'Language', icon: '🌐' },
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', icon: '❓' },
        { label: 'Contact Us', icon: '📧' },
        { label: 'About', icon: 'ℹ️' },
      ]
    }
  ];

  const handleSettingPress = (label) => {
    console.log(`Setting pressed: ${label}`);
    // Settings functionality will be implemented in future updates
  };

  return (
    <Layout style={styles.layout}>
      <AppHeader 
        title="Settings" 
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <CardContainer elevated style={styles.card}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex < section.items.length - 1 && styles.settingItemBorder
                  ]}
                  onPress={() => handleSettingPress(item.label)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <Text style={styles.icon}>{item.icon}</Text>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              ))}
            </CardContainer>
          </View>
        ))}

        <CardContainer style={styles.infoCard}>
          <Text style={styles.infoText}>
            Settings features are coming soon. Check back for updates!
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
  sectionTitle: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
    opacity: 0.6,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    marginBottom: 8,
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 22,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: fonts.sizes.body,
    color: colors.text,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 24,
    color: colors.text,
    opacity: 0.3,
    fontWeight: '300',
  },
  infoCard: {
    marginTop: 8,
    marginBottom: 24,
  },
  infoText: {
    fontSize: fonts.sizes.body,
    color: colors.text,
    opacity: 0.7,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

