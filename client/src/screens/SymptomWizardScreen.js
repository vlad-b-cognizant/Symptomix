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
  TextInput,
  Chip,
  Surface,
  ProgressBar,
  RadioButton,
  Checkbox,
} from 'react-native-paper';
import { symptomsAPI } from '../services/api';
import { theme } from '../theme/theme';

const SYMPTOM_QUESTIONS = [
  {
    id: 'primary_symptoms',
    type: 'multiple_choice',
    question: 'What are your primary symptoms?',
    options: [
      'Fever', 'Headache', 'Cough', 'Sore throat', 'Fatigue',
      'Nausea', 'Vomiting', 'Diarrhea', 'Abdominal pain',
      'Chest pain', 'Shortness of breath', 'Dizziness'
    ],
    required: true,
    multiple: true,
  },
  {
    id: 'duration',
    type: 'single_choice',
    question: 'How long have you been experiencing these symptoms?',
    options: [
      'Less than 24 hours',
      '1-3 days',
      '4-7 days',
      'More than a week',
      'More than a month'
    ],
    required: true,
  },
  {
    id: 'severity',
    type: 'single_choice',
    question: 'How would you rate the severity of your symptoms?',
    options: [
      'Mild - Does not interfere with daily activities',
      'Moderate - Some interference with daily activities',
      'Severe - Significantly impacts daily activities',
      'Very severe - Unable to perform normal activities'
    ],
    required: true,
  },
  {
    id: 'fever_temp',
    type: 'conditional',
    condition: (answers) => answers.primary_symptoms?.includes('Fever'),
    question: 'What is your current temperature?',
    inputType: 'number',
    placeholder: 'Enter temperature in °F',
  },
  {
    id: 'medical_history',
    type: 'multiple_choice',
    question: 'Do you have any of these medical conditions?',
    options: [
      'Diabetes', 'High blood pressure', 'Heart disease',
      'Asthma', 'Allergies', 'Cancer', 'Autoimmune disorder',
      'None of the above'
    ],
    multiple: true,
  },
  {
    id: 'medications',
    type: 'text',
    question: 'Are you currently taking any medications?',
    placeholder: 'List any current medications or supplements',
  },
  {
    id: 'recent_travel',
    type: 'single_choice',
    question: 'Have you traveled recently or been exposed to sick individuals?',
    options: ['Yes', 'No', 'Not sure'],
  },
];

const SymptomWizardScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const currentQuestion = SYMPTOM_QUESTIONS[currentStep];
  const isVisible = !currentQuestion?.condition || currentQuestion.condition(answers);
  const progress = (currentStep + 1) / SYMPTOM_QUESTIONS.length;

  useEffect(() => {
    // Skip conditional questions that don't apply
    if (currentQuestion && !isVisible) {
      handleNext();
    }
  }, [currentStep, answers]);

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    const nextStep = currentStep + 1;
    if (nextStep < SYMPTOM_QUESTIONS.length) {
      setCurrentStep(nextStep);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const symptomsData = {
        answers,
        timestamp: new Date().toISOString(),
        userId: 'user123', // In real app, get from auth
      };

      const result = await symptomsAPI.submitSymptoms(symptomsData);
      
      navigation.navigate('DiagnosticResults', { 
        assessmentData: result,
        userAnswers: answers 
      });
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to process your symptoms. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isAnswered = () => {
    if (!currentQuestion) return false;
    const answer = answers[currentQuestion.id];
    
    if (currentQuestion.required) {
      if (currentQuestion.type === 'multiple_choice' && currentQuestion.multiple) {
        return answer && answer.length > 0;
      }
      return answer !== undefined && answer !== null && answer !== '';
    }
    return true;
  };

  const renderQuestion = () => {
    if (!currentQuestion || !isVisible) return null;

    switch (currentQuestion.type) {
      case 'multiple_choice':
        if (currentQuestion.multiple) {
          return renderMultipleChoice();
        } else {
          return renderSingleChoice();
        }
      case 'text':
        return renderTextInput();
      case 'conditional':
        if (currentQuestion.inputType === 'number') {
          return renderNumberInput();
        }
        return renderTextInput();
      default:
        return null;
    }
  };

  const renderMultipleChoice = () => {
    const selectedAnswers = answers[currentQuestion.id] || [];
    
    return (
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswers.includes(option);
          return (
            <View key={index} style={styles.checkboxOption}>
              <Checkbox
                status={isSelected ? 'checked' : 'unchecked'}
                onPress={() => {
                  const newAnswers = isSelected
                    ? selectedAnswers.filter(item => item !== option)
                    : [...selectedAnswers, option];
                  handleAnswer(currentQuestion.id, newAnswers);
                }}
              />
              <Text style={styles.optionText} onPress={() => {
                const newAnswers = isSelected
                  ? selectedAnswers.filter(item => item !== option)
                  : [...selectedAnswers, option];
                handleAnswer(currentQuestion.id, newAnswers);
              }}>
                {option}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderSingleChoice = () => {
    const selectedAnswer = answers[currentQuestion.id];
    
    return (
      <RadioButton.Group
        onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
        value={selectedAnswer}
      >
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <View key={index} style={styles.radioOption}>
              <RadioButton value={option} />
              <Text style={styles.optionText} onPress={() => handleAnswer(currentQuestion.id, option)}>
                {option}
              </Text>
            </View>
          ))}
        </View>
      </RadioButton.Group>
    );
  };

  const renderTextInput = () => (
    <TextInput
      mode="outlined"
      placeholder={currentQuestion.placeholder}
      value={answers[currentQuestion.id] || ''}
      onChangeText={(text) => handleAnswer(currentQuestion.id, text)}
      style={styles.textInput}
      multiline={currentQuestion.type === 'text'}
      numberOfLines={currentQuestion.type === 'text' ? 3 : 1}
    />
  );

  const renderNumberInput = () => (
    <TextInput
      mode="outlined"
      placeholder={currentQuestion.placeholder}
      value={answers[currentQuestion.id] || ''}
      onChangeText={(text) => handleAnswer(currentQuestion.id, text)}
      style={styles.textInput}
      keyboardType="numeric"
    />
  );

  if (!currentQuestion || !isVisible) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <Surface style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {SYMPTOM_QUESTIONS.length}
        </Text>
        <ProgressBar 
          progress={progress} 
          color={theme.colors.primary}
          style={styles.progressBar}
        />
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.questionCard}>
          <Card.Content>
            <Title style={styles.questionTitle}>
              {currentQuestion.question}
            </Title>
            {currentQuestion.required && (
              <Text style={styles.requiredText}>* Required</Text>
            )}
            <View style={styles.answerContainer}>
              {renderQuestion()}
            </View>
          </Card.Content>
        </Card>

        {/* Selected answers preview for multiple choice */}
        {currentQuestion.type === 'multiple_choice' && 
         currentQuestion.multiple && 
         answers[currentQuestion.id]?.length > 0 && (
          <Card style={styles.selectedCard}>
            <Card.Content>
              <Text style={styles.selectedTitle}>Selected:</Text>
              <View style={styles.chipContainer}>
                {answers[currentQuestion.id].map((answer, index) => (
                  <Chip
                    key={index}
                    style={styles.chip}
                    onClose={() => {
                      const newAnswers = answers[currentQuestion.id].filter(item => item !== answer);
                      handleAnswer(currentQuestion.id, newAnswers);
                    }}
                  >
                    {answer}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <Surface style={styles.navigationContainer}>
        <View style={styles.buttonRow}>
          <Button
            mode="outlined"
            onPress={handlePrevious}
            disabled={currentStep === 0}
            style={[styles.navButton, { opacity: currentStep === 0 ? 0.5 : 1 }]}
          >
            Previous
          </Button>
          
          <Button
            mode="contained"
            onPress={handleNext}
            disabled={!isAnswered()}
            loading={isLoading}
            style={[styles.navButton, styles.nextButton]}
          >
            {currentStep === SYMPTOM_QUESTIONS.length - 1 ? 'Get Results' : 'Next'}
          </Button>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  progressContainer: {
    padding: 16,
    elevation: 2,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    elevation: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    lineHeight: 28,
  },
  requiredText: {
    fontSize: 12,
    color: theme.colors.error,
    marginBottom: 16,
  },
  answerContainer: {
    marginTop: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 22,
  },
  textInput: {
    marginBottom: 16,
  },
  selectedCard: {
    elevation: 2,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  navigationContainer: {
    padding: 16,
    elevation: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    flex: 1,
    borderRadius: 8,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
  },
});

export default SymptomWizardScreen;
