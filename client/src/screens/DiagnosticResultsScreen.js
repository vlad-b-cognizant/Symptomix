import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Surface,
  IconButton,
  Chip,
  Divider,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme/theme';

const DiagnosticResultsScreen = ({ navigation, route }) => {
  const { assessmentData, userAnswers } = route.params || {};
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (assessmentData) {
      saveAssessment();
    }
  }, [assessmentData]);

  const saveAssessment = async () => {
    setIsSaving(true);
    try {
      const assessment = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        symptoms: userAnswers?.primary_symptoms || [],
        diagnosis: assessmentData?.primaryDiagnosis,
        confidence: assessmentData?.confidence,
        urgency: assessmentData?.urgency,
        ...assessmentData,
      };

      // Save to local storage
      const existingAssessments = await AsyncStorage.getItem('assessments');
      const assessments = existingAssessments ? JSON.parse(existingAssessments) : [];
      assessments.unshift(assessment);
      
      // Keep only last 20 assessments
      const trimmedAssessments = assessments.slice(0, 20);
      await AsyncStorage.setItem('assessments', JSON.stringify(trimmedAssessments));
      
      // Update recent assessments
      await AsyncStorage.setItem('recentAssessments', JSON.stringify(trimmedAssessments.slice(0, 5)));
    } catch (error) {
      console.error('Error saving assessment:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return theme.colors.error;
      case 'medium':
      case 'moderate':
        return theme.colors.warning;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.primary;
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'alert-circle';
      case 'medium':
      case 'moderate':
        return 'alert';
      case 'low':
        return 'check-circle';
      default:
        return 'information';
    }
  };

  const handleNewAssessment = () => {
    navigation.navigate('SymptomWizard');
  };

  const handleViewHistory = () => {
    navigation.navigate('History');
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleCallEmergency = () => {
    Alert.alert(
      'Emergency Services',
      'This would dial emergency services in a real application.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call 911', style: 'destructive' }
      ]
    );
  };

  if (!assessmentData) {
    return (
      <View style={styles.container}>
        <Card style={styles.errorCard}>
          <Card.Content style={styles.centerContent}>
            <IconButton
              icon="alert-circle"
              size={48}
              iconColor={theme.colors.error}
            />
            <Title style={styles.errorTitle}>No Results Available</Title>
            <Paragraph style={styles.errorText}>
              Unable to load assessment results. Please try again.
            </Paragraph>
            <Button
              mode="contained"
              onPress={handleNewAssessment}
              style={styles.retryButton}
            >
              Start New Assessment
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Urgency Alert */}
      {assessmentData.urgency && (
        <Surface style={[styles.urgencyBanner, { backgroundColor: getUrgencyColor(assessmentData.urgency) + '20' }]}>
          <View style={styles.urgencyContent}>
            <IconButton
              icon={getUrgencyIcon(assessmentData.urgency)}
              size={32}
              iconColor={getUrgencyColor(assessmentData.urgency)}
            />
            <View style={styles.urgencyText}>
              <Text style={[styles.urgencyTitle, { color: getUrgencyColor(assessmentData.urgency) }]}>
                {assessmentData.urgency.toUpperCase()} PRIORITY
              </Text>
              <Text style={styles.urgencyDescription}>
                {assessmentData.urgencyMessage || 'Please follow the recommendations below.'}
              </Text>
            </View>
          </View>
        </Surface>
      )}

      {/* Primary Diagnosis */}
      <View style={styles.section}>
        <Card style={styles.diagnosisCard}>
          <Card.Content>
            <View style={styles.diagnosisHeader}>
              <IconButton
                icon="medical-bag"
                size={40}
                iconColor={theme.colors.primary}
                style={styles.diagnosisIcon}
              />
              <View style={styles.diagnosisContent}>
                <Text style={styles.diagnosisLabel}>Primary Assessment</Text>
                <Title style={styles.diagnosisTitle}>
                  {assessmentData.primaryDiagnosis || 'General Symptoms'}
                </Title>
                {assessmentData.confidence && (
                  <Text style={styles.confidenceText}>
                    Confidence: {Math.round(assessmentData.confidence * 100)}%
                  </Text>
                )}
              </View>
            </View>
            
            {assessmentData.description && (
              <Paragraph style={styles.diagnosisDescription}>
                {assessmentData.description}
              </Paragraph>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* Additional Possible Conditions */}
      {assessmentData.alternativeDiagnoses && assessmentData.alternativeDiagnoses.length > 0 && (
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Other Possible Conditions</Title>
          {assessmentData.alternativeDiagnoses.map((diagnosis, index) => (
            <Card key={index} style={styles.alternativeCard}>
              <Card.Content>
                <View style={styles.alternativeHeader}>
                  <Text style={styles.alternativeTitle}>{diagnosis.condition}</Text>
                  <Text style={styles.alternativeConfidence}>
                    {Math.round(diagnosis.confidence * 100)}%
                  </Text>
                </View>
                {diagnosis.description && (
                  <Paragraph style={styles.alternativeDescription}>
                    {diagnosis.description}
                  </Paragraph>
                )}
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      {/* Treatment Recommendations */}
      {assessmentData.recommendations && (
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Recommended Actions</Title>
          <Card style={styles.recommendationsCard}>
            <Card.Content>
              {assessmentData.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <IconButton
                    icon={recommendation.type === 'urgent' ? 'alert-circle' : 
                          recommendation.type === 'medical' ? 'hospital-box' : 
                          'check-circle'}
                    size={24}
                    iconColor={recommendation.type === 'urgent' ? theme.colors.error :
                              recommendation.type === 'medical' ? theme.colors.warning :
                              theme.colors.success}
                  />
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationTitle}>
                      {recommendation.title}
                    </Text>
                    <Text style={styles.recommendationDescription}>
                      {recommendation.description}
                    </Text>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Symptoms Summary */}
      {userAnswers?.primary_symptoms && (
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Your Reported Symptoms</Title>
          <Card style={styles.symptomsCard}>
            <Card.Content>
              <View style={styles.symptomsContainer}>
                {userAnswers.primary_symptoms.map((symptom, index) => (
                  <Chip key={index} style={styles.symptomChip}>
                    {symptom}
                  </Chip>
                ))}
              </View>
              {userAnswers.duration && (
                <View style={styles.additionalInfo}>
                  <Text style={styles.infoLabel}>Duration:</Text>
                  <Text style={styles.infoValue}>{userAnswers.duration}</Text>
                </View>
              )}
              {userAnswers.severity && (
                <View style={styles.additionalInfo}>
                  <Text style={styles.infoLabel}>Severity:</Text>
                  <Text style={styles.infoValue}>{userAnswers.severity}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Emergency Actions */}
      {assessmentData.urgency === 'high' && (
        <View style={styles.section}>
          <Card style={styles.emergencyCard}>
            <Card.Content>
              <View style={styles.emergencyHeader}>
                <IconButton
                  icon="phone"
                  size={32}
                  iconColor={theme.colors.error}
                />
                <Text style={styles.emergencyTitle}>Need Immediate Help?</Text>
              </View>
              <Button
                mode="contained"
                onPress={handleCallEmergency}
                style={styles.emergencyButton}
                buttonColor={theme.colors.error}
              >
                Call Emergency Services
              </Button>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Disclaimer */}
      <View style={styles.section}>
        <Card style={styles.disclaimerCard}>
          <Card.Content>
            <Text style={styles.disclaimerTitle}>Medical Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              This assessment is for informational purposes only and should not replace professional medical advice. 
              Please consult with a healthcare provider for proper diagnosis and treatment.
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <Button
          mode="contained"
          onPress={handleNewAssessment}
          style={styles.actionButton}
        >
          New Assessment
        </Button>
        <Button
          mode="outlined"
          onPress={handleViewHistory}
          style={styles.actionButton}
        >
          View History
        </Button>
        <Button
          mode="text"
          onPress={handleGoHome}
          style={styles.actionButton}
        >
          Back to Home
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  urgencyBanner: {
    padding: 16,
    marginBottom: 8,
  },
  urgencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgencyText: {
    flex: 1,
    marginLeft: 8,
  },
  urgencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  urgencyDescription: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  diagnosisCard: {
    elevation: 4,
    borderRadius: 12,
  },
  diagnosisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  diagnosisIcon: {
    backgroundColor: theme.colors.primaryContainer,
  },
  diagnosisContent: {
    flex: 1,
    marginLeft: 12,
  },
  diagnosisLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  diagnosisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  diagnosisDescription: {
    fontSize: 15,
    color: theme.colors.onSurface,
    lineHeight: 22,
  },
  alternativeCard: {
    elevation: 2,
    borderRadius: 8,
    marginBottom: 8,
  },
  alternativeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alternativeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  alternativeConfidence: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  alternativeDescription: {
    fontSize: 14,
    color: theme.colors.onSurface,
    lineHeight: 20,
  },
  recommendationsCard: {
    elevation: 2,
    borderRadius: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  recommendationContent: {
    flex: 1,
    marginLeft: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: theme.colors.onSurface,
    lineHeight: 20,
  },
  symptomsCard: {
    elevation: 2,
    borderRadius: 8,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  symptomChip: {
    marginBottom: 4,
  },
  additionalInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  emergencyCard: {
    elevation: 3,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginLeft: 8,
  },
  emergencyButton: {
    borderRadius: 8,
  },
  disclaimerCard: {
    elevation: 1,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: theme.colors.onSurface,
    lineHeight: 18,
  },
  actionsSection: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    borderRadius: 8,
  },
  errorCard: {
    elevation: 4,
    borderRadius: 12,
    margin: 16,
  },
  centerContent: {
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: theme.colors.onSurface,
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    borderRadius: 8,
  },
});

export default DiagnosticResultsScreen;
