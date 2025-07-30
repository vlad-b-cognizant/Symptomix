import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Text,
  IconButton,
  Searchbar,
  FAB,
  Surface,
  Chip,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme/theme';

const HistoryScreen = ({ navigation }) => {
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAssessments();
  }, []);

  useEffect(() => {
    filterAssessments();
  }, [assessments, searchQuery]);

  const loadAssessments = async () => {
    try {
      const stored = await AsyncStorage.getItem('assessments');
      if (stored) {
        const parsedAssessments = JSON.parse(stored);
        setAssessments(parsedAssessments);
      }
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssessments();
    setRefreshing(false);
  };

  const filterAssessments = () => {
    if (!searchQuery.trim()) {
      setFilteredAssessments(assessments);
      return;
    }

    const filtered = assessments.filter(assessment => {
      const searchLower = searchQuery.toLowerCase();
      const symptoms = assessment.symptoms?.join(' ').toLowerCase() || '';
      const diagnosis = assessment.diagnosis?.toLowerCase() || '';
      const date = new Date(assessment.date).toLocaleDateString().toLowerCase();
      
      return symptoms.includes(searchLower) || 
             diagnosis.includes(searchLower) || 
             date.includes(searchLower);
    });
    
    setFilteredAssessments(filtered);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleAssessmentPress = (assessment) => {
    navigation.navigate('DiagnosticResults', {
      assessmentData: assessment,
      userAnswers: { primary_symptoms: assessment.symptoms }
    });
  };

  const handleNewAssessment = () => {
    navigation.navigate('SymptomWizard');
  };

  const renderAssessmentCard = (assessment, index) => (
    <Card 
      key={assessment.id || index} 
      style={styles.assessmentCard}
      onPress={() => handleAssessmentPress(assessment)}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.dateSection}>
            <Text style={styles.dateText}>
              {formatDate(assessment.date)}
            </Text>
            <Text style={styles.timeText}>
              {new Date(assessment.date).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
          
          {assessment.urgency && (
            <Chip
              style={[styles.urgencyChip, { 
                backgroundColor: getUrgencyColor(assessment.urgency) + '20' 
              }]}
              textStyle={{ 
                color: getUrgencyColor(assessment.urgency),
                fontSize: 12,
                fontWeight: '600'
              }}
            >
              {assessment.urgency.toUpperCase()}
            </Chip>
          )}
        </View>

        <View style={styles.diagnosisSection}>
          <Text style={styles.diagnosisText}>
            {assessment.diagnosis || 'General Assessment'}
          </Text>
          {assessment.confidence && (
            <Text style={styles.confidenceText}>
              {Math.round(assessment.confidence * 100)}% confidence
            </Text>
          )}
        </View>

        {assessment.symptoms && assessment.symptoms.length > 0 && (
          <View style={styles.symptomsSection}>
            <Text style={styles.symptomsLabel}>Symptoms:</Text>
            <View style={styles.symptomsContainer}>
              {assessment.symptoms.slice(0, 3).map((symptom, i) => (
                <Chip key={i} style={styles.symptomChip} compact>
                  {symptom}
                </Chip>
              ))}
              {assessment.symptoms.length > 3 && (
                <Text style={styles.moreSymptoms}>
                  +{assessment.symptoms.length - 3} more
                </Text>
              )}
            </View>
          </View>
        )}
      </Card.Content>
      
      <View style={styles.cardFooter}>
        <IconButton
          icon="chevron-right"
          size={24}
          iconColor={theme.colors.primary}
        />
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconButton
        icon="clipboard-text-outline"
        size={64}
        iconColor={theme.colors.onSurface}
        style={styles.emptyIcon}
      />
      <Title style={styles.emptyTitle}>No Assessments Yet</Title>
      <Paragraph style={styles.emptyText}>
        Start your first symptom assessment to see your health history here.
      </Paragraph>
    </View>
  );

  const renderStats = () => {
    if (assessments.length === 0) return null;

    const totalAssessments = assessments.length;
    const recentAssessments = assessments.filter(a => {
      const date = new Date(a.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date > weekAgo;
    }).length;

    return (
      <Surface style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalAssessments}</Text>
          <Text style={styles.statLabel}>Total Assessments</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{recentAssessments}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Surface style={styles.searchContainer}>
        <Searchbar
          placeholder="Search by symptoms, diagnosis, or date"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </Surface>

      {/* Stats */}
      {renderStats()}

      {/* Assessment List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your history...</Text>
          </View>
        ) : filteredAssessments.length === 0 ? (
          searchQuery ? (
            <View style={styles.emptyContainer}>
              <IconButton
                icon="magnify"
                size={48}
                iconColor={theme.colors.onSurface}
              />
              <Title style={styles.emptyTitle}>No Results Found</Title>
              <Paragraph style={styles.emptyText}>
                Try adjusting your search terms or browse all assessments.
              </Paragraph>
            </View>
          ) : (
            renderEmptyState()
          )
        ) : (
          <View style={styles.assessmentsList}>
            {searchQuery && (
              <Text style={styles.resultsText}>
                {filteredAssessments.length} result{filteredAssessments.length !== 1 ? 's' : ''} found
              </Text>
            )}
            {filteredAssessments.map((assessment, index) => 
              renderAssessmentCard(assessment, index)
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleNewAssessment}
        label="New Assessment"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    padding: 16,
    elevation: 2,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: theme.colors.surface,
  },
  searchInput: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.outline,
  },
  scrollView: {
    flex: 1,
  },
  assessmentsList: {
    padding: 16,
  },
  resultsText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: 16,
    textAlign: 'center',
  },
  assessmentCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateSection: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.onSurface,
    marginTop: 2,
  },
  urgencyChip: {
    height: 28,
  },
  diagnosisSection: {
    marginBottom: 12,
  },
  diagnosisText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  symptomsSection: {
    marginBottom: 8,
  },
  symptomsLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: 8,
    fontWeight: '500',
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  symptomChip: {
    height: 28,
    marginBottom: 4,
  },
  moreSymptoms: {
    fontSize: 12,
    color: theme.colors.onSurface,
    fontStyle: 'italic',
    marginLeft: 8,
  },
  cardFooter: {
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.onSurface,
    lineHeight: 22,
    maxWidth: 280,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});

export default HistoryScreen;
