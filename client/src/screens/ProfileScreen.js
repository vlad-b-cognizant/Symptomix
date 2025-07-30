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
  Surface,
  IconButton,
  Switch,
  Divider,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme/theme';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    phone: '',
    emergencyContact: '',
    medicalConditions: '',
    allergies: '',
    medications: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
    loadSettings();
  }, []);

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem('userProfile');
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const notificationsEnabled = await AsyncStorage.getItem('notifications');
      const dataSharingEnabled = await AsyncStorage.getItem('dataSharing');
      
      if (notificationsEnabled !== null) {
        setNotifications(JSON.parse(notificationsEnabled));
      }
      if (dataSharingEnabled !== null) {
        setDataSharing(JSON.parse(dataSharingEnabled));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      await AsyncStorage.setItem('userName', profile.name);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
      await AsyncStorage.setItem('dataSharing', JSON.stringify(dataSharing));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleFieldChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    loadProfile(); // Reset to original values
    setIsEditing(false);
  };

  const clearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your assessments and profile data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'userProfile',
                'userName',
                'assessments',
                'recentAssessments'
              ]);
              setProfile({
                name: '',
                email: '',
                age: '',
                gender: '',
                phone: '',
                emergencyContact: '',
                medicalConditions: '',
                allergies: '',
                medications: '',
              });
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          }
        }
      ]
    );
  };

  const exportData = () => {
    Alert.alert(
      'Export Data',
      'In a real application, this would export your health data to a file or send it to your email.',
      [{ text: 'OK' }]
    );
  };

  useEffect(() => {
    saveSettings();
  }, [notifications, dataSharing]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <Surface style={styles.headerSection}>
        <View style={styles.profileHeader}>
          <IconButton
            icon="account-circle"
            size={80}
            iconColor={theme.colors.primary}
            style={styles.avatarIcon}
          />
          <View style={styles.headerContent}>
            <Title style={styles.profileName}>
              {profile.name || 'Your Name'}
            </Title>
            <Text style={styles.profileEmail}>
              {profile.email || 'your.email@example.com'}
            </Text>
            <Button
              mode={isEditing ? 'contained' : 'outlined'}
              onPress={() => setIsEditing(!isEditing)}
              style={styles.editButton}
              compact
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          </View>
        </View>
      </Surface>

      {/* Personal Information */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Personal Information</Title>
        <Card style={styles.infoCard}>
          <Card.Content>
            <TextInput
              label="Full Name"
              value={profile.name}
              onChangeText={(value) => handleFieldChange('name', value)}
              mode="outlined"
              style={styles.input}
              editable={isEditing}
              disabled={!isEditing}
            />
            <TextInput
              label="Email"
              value={profile.email}
              onChangeText={(value) => handleFieldChange('email', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              editable={isEditing}
              disabled={!isEditing}
            />
            <View style={styles.inputRow}>
              <TextInput
                label="Age"
                value={profile.age}
                onChangeText={(value) => handleFieldChange('age', value)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
                editable={isEditing}
                disabled={!isEditing}
              />
              <TextInput
                label="Gender"
                value={profile.gender}
                onChangeText={(value) => handleFieldChange('gender', value)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                editable={isEditing}
                disabled={!isEditing}
              />
            </View>
            <TextInput
              label="Phone Number"
              value={profile.phone}
              onChangeText={(value) => handleFieldChange('phone', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              editable={isEditing}
              disabled={!isEditing}
            />
            <TextInput
              label="Emergency Contact"
              value={profile.emergencyContact}
              onChangeText={(value) => handleFieldChange('emergencyContact', value)}
              mode="outlined"
              style={styles.input}
              placeholder="Name and phone number"
              editable={isEditing}
              disabled={!isEditing}
            />
          </Card.Content>
        </Card>
      </View>

      {/* Medical Information */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Medical Information</Title>
        <Card style={styles.infoCard}>
          <Card.Content>
            <TextInput
              label="Medical Conditions"
              value={profile.medicalConditions}
              onChangeText={(value) => handleFieldChange('medicalConditions', value)}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="List any chronic conditions or medical history"
              editable={isEditing}
              disabled={!isEditing}
            />
            <TextInput
              label="Allergies"
              value={profile.allergies}
              onChangeText={(value) => handleFieldChange('allergies', value)}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={2}
              placeholder="List any known allergies"
              editable={isEditing}
              disabled={!isEditing}
            />
            <TextInput
              label="Current Medications"
              value={profile.medications}
              onChangeText={(value) => handleFieldChange('medications', value)}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="List current medications and supplements"
              editable={isEditing}
              disabled={!isEditing}
            />
          </Card.Content>
        </Card>

        {isEditing && (
          <View style={styles.saveSection}>
            <Button
              mode="contained"
              onPress={saveProfile}
              loading={isSaving}
              style={styles.saveButton}
            >
              Save Changes
            </Button>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        )}
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>App Settings</Title>
        <Card style={styles.settingsCard}>
          <Card.Content>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive reminders and health tips
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Data Sharing</Text>
                <Text style={styles.settingDescription}>
                  Share anonymized data for research
                </Text>
              </View>
              <Switch
                value={dataSharing}
                onValueChange={setDataSharing}
              />
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Data Management</Title>
        <Card style={styles.dataCard}>
          <Card.Content>
            <View style={styles.dataOption}>
              <IconButton
                icon="download"
                size={32}
                iconColor={theme.colors.primary}
              />
              <View style={styles.dataContent}>
                <Text style={styles.dataTitle}>Export Data</Text>
                <Text style={styles.dataDescription}>
                  Download your health assessments and profile data
                </Text>
              </View>
              <Button
                mode="outlined"
                onPress={exportData}
                compact
              >
                Export
              </Button>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.dataOption}>
              <IconButton
                icon="delete"
                size={32}
                iconColor={theme.colors.error}
              />
              <View style={styles.dataContent}>
                <Text style={styles.dataTitle}>Clear All Data</Text>
                <Text style={styles.dataDescription}>
                  Permanently delete all your data
                </Text>
              </View>
              <Button
                mode="outlined"
                onPress={clearData}
                textColor={theme.colors.error}
                compact
              >
                Clear
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* App Information */}
      <View style={styles.section}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>Symptomix</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
              <Text style={styles.appDescription}>
                From Symptoms to Solutions—Instantly
              </Text>
            </View>
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
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatarIcon: {
    backgroundColor: theme.colors.primaryContainer,
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  editButton: {
    alignSelf: 'flex-start',
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
  infoCard: {
    elevation: 2,
    borderRadius: 8,
  },
  input: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  saveSection: {
    marginTop: 16,
    gap: 8,
  },
  saveButton: {
    borderRadius: 8,
  },
  cancelButton: {
    borderRadius: 8,
  },
  settingsCard: {
    elevation: 2,
    borderRadius: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  divider: {
    marginVertical: 12,
  },
  dataCard: {
    elevation: 2,
    borderRadius: 8,
  },
  dataOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dataContent: {
    flex: 1,
    marginLeft: 8,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  dataDescription: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: theme.colors.onSurface,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default ProfileScreen;
