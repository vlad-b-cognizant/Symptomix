import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Surface,
  Text,
  IconButton,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [recentAssessments, setRecentAssessments] = useState([]);

  useEffect(() => {
    loadUserData();
    loadRecentAssessments();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) {
        setUserName(name);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadRecentAssessments = async () => {
    try {
      const assessments = await AsyncStorage.getItem('recentAssessments');
      if (assessments) {
        setRecentAssessments(JSON.parse(assessments).slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading recent assessments:', error);
    }
  };

  const handleStartAssessment = () => {
    navigation.navigate('SymptomWizard');
  };

  const handleViewHistory = () => {
    navigation.navigate('History');
  };

  const handleViewProfile = () => {
    navigation.navigate('Profile');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <Surface style={styles.headerSection}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Title style={styles.welcomeTitle}>
              {userName ? `Welcome back, ${userName}!` : 'Welcome to Symptomix'}
            </Title>
            <Paragraph style={styles.tagline}>
              From Symptoms to Solutions—Instantly
            </Paragraph>
          </View>
          <IconButton
            icon="account-circle"
            size={40}
            iconColor={theme.colors.primary}
            onPress={handleViewProfile}
          />
        </View>
      </Surface>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Card style={styles.primaryCard}>
          <Card.Content style={styles.primaryCardContent}>
            <View style={styles.cardIcon}>
              <IconButton
                icon="medical-bag"
                size={48}
                iconColor={theme.colors.primary}
                style={styles.iconButton}
              />
            </View>
            <Title style={styles.primaryCardTitle}>Start New Assessment</Title>
            <Paragraph style={styles.primaryCardDescription}>
              Tell us about your symptoms and get instant diagnostic suggestions
            </Paragraph>
            <Button
              mode="contained"
              onPress={handleStartAssessment}
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}
            >
              Begin Assessment
            </Button>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <IconButton
                icon="chart-line"
                size={32}
                iconColor={theme.colors.secondary}
              />
              <Text style={styles.statNumber}>
                {recentAssessments.length}
              </Text>
              <Text style={styles.statLabel}>Recent Assessments</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <IconButton
                icon="clock-outline"
                size={32}
                iconColor={theme.colors.success}
              />
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Available</Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Recent Assessments */}
      {recentAssessments.length > 0 && (
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Recent Assessments</Title>
          {recentAssessments.map((assessment, index) => (
            <Card key={index} style={styles.historyCard}>
              <Card.Content>
                <View style={styles.historyItem}>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyDate}>
                      {new Date(assessment.date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.historySymptoms}>
                      {assessment.symptoms?.slice(0, 2).join(', ')}
                      {assessment.symptoms?.length > 2 && '...'}
                    </Text>
                  </View>
                  <IconButton
                    icon="chevron-right"
                    size={24}
                    iconColor={theme.colors.primary}
                  />
                </View>
              </Card.Content>
            </Card>
          ))}
          <Button
            mode="outlined"
            onPress={handleViewHistory}
            style={styles.viewAllButton}
          >
            View All History
          </Button>
        </View>
      )}

      {/* Information Cards */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Health Tips</Title>
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <IconButton
                icon="lightbulb-outline"
                size={32}
                iconColor={theme.colors.warning}
              />
              <Title style={styles.infoTitle}>Stay Hydrated</Title>
            </View>
            <Paragraph style={styles.infoText}>
              Drinking adequate water helps maintain bodily functions and can alleviate many common symptoms.
            </Paragraph>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerSection: {
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  primaryCard: {
    elevation: 4,
    borderRadius: 12,
  },
  primaryCardContent: {
    alignItems: 'center',
    padding: 24,
  },
  cardIcon: {
    marginBottom: 16,
  },
  iconButton: {
    backgroundColor: theme.colors.primaryContainer,
  },
  primaryCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: theme.colors.text,
  },
  primaryCardDescription: {
    textAlign: 'center',
    marginBottom: 20,
    color: theme.colors.onSurface,
    lineHeight: 22,
  },
  primaryButton: {
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 8,
    elevation: 2,
    borderRadius: 8,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  historyCard: {
    marginBottom: 8,
    elevation: 1,
    borderRadius: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyContent: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  historySymptoms: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  viewAllButton: {
    marginTop: 12,
    borderColor: theme.colors.primary,
  },
  infoCard: {
    elevation: 2,
    borderRadius: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 8,
  },
  infoText: {
    color: theme.colors.onSurface,
    lineHeight: 20,
  },
});

export default HomeScreen;
