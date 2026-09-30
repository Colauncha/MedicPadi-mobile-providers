import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownOption } from '@/components/ui/DropDown2';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useThemedStyles } from '@/hooks/useThemedStyle';
import {
  apiUpdateProfile,
  apiUploadProfilePicture,
  DoctorsSpecialityResponse,
  fetchDoctorsSpeciality,
} from '@/services/api';
import { useTheme } from '@/theme/ThemeProvider';

const genderOptions: DropdownOption[] = [
  {
    value: 'male',
    label: 'Male',
  },
  {
    value: 'female',
    label: 'Female',
  },
];

export type ConsultantFormValues = {
  firstName: string;
  lastName: string;
  gender: string;
  speciality: string;
  bio: string;
  placeOfWork: string;
  yearsOfService: string;
  awards: string;
  costPerSession: string;
  sessionLength: string;
  licenceNumber: string;
};

type ProfilePayload = Record<string, string | number | undefined>;

type EducationFormValue = {
  institution: string;
  degree: string;
};

const emptyEducation: EducationFormValue = { institution: '', degree: '' };

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function removeUnsetFields(obj: ProfilePayload): ProfilePayload {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );
}

type ConsultantProfileFormProps = {
  /* Called after the profile details are saved successfully. */
  onSaved?: () => void;
  submitLabel?: string;
  /* Reports while the profile or photo is being saved. */
  onBusyChange?: (busy: boolean) => void;
};

/*
 * Consultant profile form: photo, details and education.
 * Used by the Edit Profile screen and the fresh-registration modal.
 */
export function ConsultantProfileForm({
  onSaved,
  submitLabel = 'Save Changes',
  onBusyChange,
}: ConsultantProfileFormProps) {
  const { profile, token, refreshProfile } = useAuth();
  const { theme: appTheme } = useTheme();

  const [doctorsSpeciality, setDoctorsSpeciality] =
    useState<DoctorsSpecialityResponse | null>(null);

  const [formValues, setFormValues] = useState<ConsultantFormValues>({
    firstName: '',
    lastName: '',
    gender: '',
    speciality: '',
    bio: '',
    placeOfWork: '',
    yearsOfService: '',
    awards: '',
    costPerSession: '',
    sessionLength: '',
    licenceNumber: '',
  });

  const [openDropdown, setOpenDropdown] = useState<
    keyof Pick<ConsultantFormValues, 'gender' | 'speciality'> | null
  >(null);

  const [education, setEducation] = useState<EducationFormValue[]>([]);
  const [isSavingEducation, setIsSavingEducation] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);

  const consultantProfile = profile?.profile;
  const [prevConsultantId, setPrevConsultantId] = useState('');

  if (consultantProfile?.id !== prevConsultantId) {
    setPrevConsultantId(consultantProfile?.id || '');
    setFormValues({
      firstName: consultantProfile?.firstName ?? '',
      lastName: consultantProfile?.lastName ?? '',
      gender: consultantProfile?.gender?.toLowerCase() ?? '',
      speciality: consultantProfile?.speciality ?? '',
      bio: consultantProfile?.bio ?? '',
      placeOfWork: consultantProfile?.placeOfWork ?? '',
      yearsOfService:
        consultantProfile?.yearsOfService != null
          ? String(consultantProfile?.yearsOfService)
          : '',
      awards:
        consultantProfile?.awards != null
          ? String(consultantProfile?.awards)
          : '',
      costPerSession:
        consultantProfile?.costPerSession != null
          ? String(consultantProfile?.costPerSession)
          : '',
      sessionLength:
        consultantProfile?.sessionLength != null
          ? String(consultantProfile?.sessionLength)
          : '',
      licenceNumber: consultantProfile?.licenceNumber ?? '',
    });
    setEducation(
      (consultantProfile?.education ?? []).map((item) => ({
        institution: item.institution ?? '',
        degree: item.degree ?? '',
      }))
    );
  }

  /*
   * Fetch consultant specialities.
   */
  useEffect(() => {
    if (!token) {
      return;
    }

    let mounted = true;

    const loadSpecialities = async () => {
      try {
        const response = await fetchDoctorsSpeciality(token);

        if (mounted) {
          setDoctorsSpeciality(response);
        }
      } catch (error) {
        console.error('Failed to fetch doctor specialities:', error);

        if (mounted) {
          setDoctorsSpeciality(null);
        }
      }
    };

    loadSpecialities();

    return () => {
      mounted = false;
    };
  }, [token]);

  /*
   * Convert the API speciality response into Dropdown options.
   *
   * The backend returns something like:
   *
   * {
   *   general: "General Consultant",
   *   oncology: "Oncology",
   *   ...
   * }
   */
  const specialityOptions = useMemo<DropdownOption[]>(() => {
    if (!doctorsSpeciality) {
      return [];
    }

    return Object.entries(doctorsSpeciality).map(([value, label]) => ({
      value,
      label,
    }));
  }, [doctorsSpeciality]);

  const updateValue = <K extends keyof ConsultantFormValues>(
    fieldName: K,
    value: ConsultantFormValues[K]
  ) => {
    setFormValues((previous) => ({
      ...previous,
      [fieldName]: value,
    }));
  };

  useEffect(() => {
    onBusyChange?.(isSubmitting);
  }, [isSubmitting, onBusyChange]);

  /*
   * Convert form values into the API payload.
   */
  const formatFields = (values: ConsultantFormValues): ProfilePayload => ({
    firstName: values.firstName.trim() || undefined,

    lastName: values.lastName.trim() || undefined,

    gender: values.gender || undefined,

    speciality:
      values.speciality === 'general'
        ? 'general consultant'
        : values.speciality || undefined,

    bio: values.bio.trim() || undefined,

    placeOfWork: values.placeOfWork.trim() || undefined,

    yearsOfService: parseOptionalNumber(values.yearsOfService),

    awards: parseOptionalNumber(values.awards),

    costPerSession: parseOptionalNumber(values.costPerSession),

    sessionLength: parseOptionalNumber(values.sessionLength),

    licenceNumber: values.licenceNumber.trim() || undefined,
  });

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!token) {
      Alert.alert(
        'Authentication error',
        'Your session has expired. Please log in again.'
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = removeUnsetFields(formatFields(formValues));

      /*
       * Update profile information first.
       */
      await apiUpdateProfile(payload, token);

      /*
       * Upload the new image only when the user selected one.
       */
      if (pickedImageUri) {
        await apiUploadProfilePicture(pickedImageUri, token);
      }

      await refreshProfile();

      Alert.alert(
        'Profile updated',
        'Your profile has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: onSaved,
          },
        ]
      );
    } catch (error) {
      console.error('Failed to update consultant profile:', error);

      Alert.alert(
        'Unable to update profile',
        'Something went wrong while saving your profile. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateEducation = (
    index: number,
    fieldName: keyof EducationFormValue,
    value: string
  ) => {
    setEducation((previous) =>
      previous.map((item, i) =>
        i === index ? { ...item, [fieldName]: value } : item
      )
    );
  };

  const handleAddEducation = () => {
    setEducation((previous) => [...previous, { ...emptyEducation }]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation((previous) => previous.filter((_, i) => i !== index));
  };

  const handleSaveEducation = async () => {
    if (isSavingEducation) {
      return;
    }

    if (!token) {
      Alert.alert(
        'Authentication error',
        'Your session has expired. Please log in again.'
      );
      return;
    }

    const trimmed = education
      .map((item) => ({
        institution: item.institution.trim(),
        degree: item.degree.trim(),
      }))
      .filter((item) => item.institution || item.degree);

    if (trimmed.some((item) => !item.institution || !item.degree)) {
      Alert.alert(
        'Incomplete entry',
        'Each education entry needs both an institution and a degree.'
      );
      return;
    }

    try {
      setIsSavingEducation(true);

      await apiUpdateProfile({ education: trimmed }, token);
      setEducation(trimmed);
      await refreshProfile();

      Alert.alert(
        'Education updated',
        'Your education and qualifications have been saved.'
      );
    } catch (error) {
      console.error('Failed to update education:', error);

      Alert.alert(
        'Unable to update education',
        'Something went wrong while saving your education. Please try again.'
      );
    } finally {
      setIsSavingEducation(false);
    }
  };

  const handleUploadPic = async () => {
    if (isSubmitting) {
      return;
    }

    if (!token) {
      Alert.alert(
        'Authentication error',
        'Your session has expired. Please log in again.'
      );
      return;
    }

    if (!pickedImageUri) return;

    try {
      setIsSubmitting(true);
      const resp = await apiUploadProfilePicture(pickedImageUri, token);
      if (resp) {
        Alert.alert('Profile photo uploaded successfully');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Unable to update profile', `${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePickImage = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Allow access to your photo library to change your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setPickedImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Failed to select profile picture:', error);

      Alert.alert(
        'Unable to select image',
        'There was a problem selecting the image. Please try again.'
      );
    }
  };

  const avatarUri =
    pickedImageUri ?? profile?.profile?.profilePicture?.url ?? null;

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      card: {
        // backgroundColor: theme.colors.surfaceCard,
        borderRadius: theme.radius.xl,
        borderColor: theme.colors.border,
        borderWidth: 0,
        // padding: theme.spacing.lg,
        width: '100%',
        maxWidth: 500,
      },

      avatarSection: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
      },

      avatarContainer: {
        position: 'relative',
        marginBottom: theme.spacing.sm,
      },

      avatar: {
        width: 120,
        height: 120,
        borderRadius: theme.radius.full,
        borderWidth: 3,
        borderColor: theme.colors.border,
      },

      avatarPlaceholder: {
        backgroundColor: theme.colors.textSecondary,
      },

      cameraOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary.extraDeep,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.border,
      },

      changePhotoText: {
        fontFamily: theme.typography.fonts?.sans,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
      },

      fieldContainer: {
        marginBottom: theme.spacing.base,
      },

      label: {
        fontFamily: theme.typography.fonts?.sans,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
      },

      input: {
        width: '100%',
        minHeight: 48,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        paddingHorizontal: theme.spacing.md,
        fontFamily: theme.typography.fonts?.sans,
        fontSize: theme.typography.sizes.md,
      },

      textArea: {
        minHeight: 110,
        paddingTop: theme.spacing.md,
        textAlignVertical: 'top',
      },

      btn: {
        width: '100%',
        marginTop: theme.spacing.base,
      },

      sectionTitle: {
        fontFamily: theme.typography.fonts?.rounded,
        color: theme.colors.text,
        marginBottom: theme.spacing.base,
      },

      educationItem: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.base,
      },

      educationItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
      },

      educationItemTitle: {
        fontFamily: theme.typography.fonts?.sans,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
      },

      emptyEducationText: {
        fontFamily: theme.typography.fonts?.sans,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.base,
      },
    })
  );

  return (
    <>
      <ThemedView style={styles.card}>
        {/* Profile photo */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickImage}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]} />
            )}

            <View style={styles.cameraOverlay}>
              <IconSymbol
                name="camera"
                size={16}
                color={appTheme.colors.mono.light}
              />
            </View>
          </TouchableOpacity>

          {pickedImageUri ? (
            <Button
              label="Save"
              onPress={handleUploadPic}
              style={{ height: 30 }}
              loading={isSubmitting}
            />
          ) : (
            <ThemedText style={styles.changePhotoText}>
              Tap to change photo
            </ThemedText>
          )}
        </View>

        {/* First name */}
        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>First Name</ThemedText>

          <TextInput
            value={formValues.firstName}
            placeholder="First Name"
            placeholderTextColor={appTheme.colors.textMuted}
            keyboardType="default"
            autoCapitalize="words"
            editable={!isSubmitting}
            style={styles.input}
            onFocus={() => setOpenDropdown(null)}
            onChangeText={(text) => updateValue('firstName', text)}
          />
        </View>

        {/* Last name */}
        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>Last Name</ThemedText>

          <TextInput
            value={formValues.lastName}
            placeholder="Last Name"
            placeholderTextColor={appTheme.colors.textMuted}
            keyboardType="default"
            autoCapitalize="words"
            editable={!isSubmitting}
            style={styles.input}
            onFocus={() => setOpenDropdown(null)}
            onChangeText={(text) => updateValue('lastName', text)}
          />
        </View>

        {/* Gender */}
        <View style={styles.fieldContainer}>
          <Dropdown
            label="Gender"
            value={formValues.gender}
            placeholder="Select gender"
            options={genderOptions}
            isOpen={openDropdown === 'gender'}
            onOpenChange={(open) => setOpenDropdown(open ? 'gender' : null)}
            onChange={(value) => {
              updateValue('gender', value);
              setOpenDropdown(null);
            }}
          />
        </View>

        {/* Speciality */}
        <View style={styles.fieldContainer}>
          <Dropdown
            label="Speciality"
            value={
              formValues.speciality === 'general consultant'
                ? 'general'
                : formValues.speciality
            }
            placeholder="Select speciality"
            options={specialityOptions}
            isOpen={openDropdown === 'speciality'}
            onOpenChange={(open) =>
              setOpenDropdown(open ? 'speciality' : null)
            }
            onChange={(value) => {
              updateValue('speciality', value);
              setOpenDropdown(null);
            }}
          />
        </View>

        {/* Bio */}
        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>Bio</ThemedText>

          <TextInput
            value={formValues.bio}
            placeholder="About you"
            placeholderTextColor={appTheme.colors.textMuted}
            keyboardType="default"
            multiline
            numberOfLines={5}
            editable={!isSubmitting}
            style={[styles.input, styles.textArea]}
            onFocus={() => setOpenDropdown(null)}
            onChangeText={(text) => updateValue('bio', text)}
          />
        </View>

        {/* Place of work */}
        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>Place of Work</ThemedText>

          <TextInput
            value={formValues.placeOfWork}
            placeholder="Company name"
            placeholderTextColor={appTheme.colors.textMuted}
            keyboardType="default"
            autoCapitalize="words"
            editable={!isSubmitting}
            style={styles.input}
            onFocus={() => setOpenDropdown(null)}
            onChangeText={(text) => updateValue('placeOfWork', text)}
          />
        </View>

        {/* Years of service */}
        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>Years of Service</ThemedText>

          <TextInput
            value={formValues.yearsOfService}
            placeholder="Experience in Years"
            placeholderTextColor={appTheme.colors.textMuted}
            keyboardType="numeric"
            editable={!isSubmitting}
            style={styles.input}
            onFocus={() => setOpenDropdown(null)}
            onChangeText={(text) => updateValue('yearsOfService', text)}
          />
        </View>

        {/* Awards */}
        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>Awards</ThemedText>

          <TextInput
            value={formValues.awards}
            placeholder="Amount of awards"
            placeholderTextColor={appTheme.colors.textMuted}
            keyboardType="numeric"
            editable={!isSubmitting}
            style={styles.input}
            onFocus={() => setOpenDropdown(null)}
            onChangeText={(text) => updateValue('awards', text)}
          />
        </View>

        {/* Cost per session */}
        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>Cost Per Session (₦)</ThemedText>

          <TextInput
            value={formValues.costPerSession}
            placeholder="Cost per session"
            placeholderTextColor={appTheme.colors.textMuted}
            keyboardType="numeric"
            editable={!isSubmitting}
            style={styles.input}
            onFocus={() => setOpenDropdown(null)}
            onChangeText={(text) => updateValue('costPerSession', text)}
          />
        </View>

        {/* Session length */}
        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>
            Session Length (minutes)
          </ThemedText>

          <TextInput
            value={formValues.sessionLength}
            placeholder="Length per session (minutes)"
            placeholderTextColor={appTheme.colors.textMuted}
            keyboardType="numeric"
            editable={!isSubmitting}
            style={styles.input}
            onFocus={() => setOpenDropdown(null)}
            onChangeText={(text) => updateValue('sessionLength', text)}
          />
        </View>

        {/* Licence number */}
        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>Licence Number</ThemedText>

          <TextInput
            value={formValues.licenceNumber}
            placeholder="Licence number"
            placeholderTextColor={appTheme.colors.textMuted}
            keyboardType="default"
            editable={!isSubmitting}
            style={styles.input}
            onFocus={() => setOpenDropdown(null)}
            onChangeText={(text) => updateValue('licenceNumber', text)}
          />
        </View>

        {/* Submit */}
        <Button
          label={submitLabel}
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.btn}
        />
      </ThemedView>

      {/* Education and qualification section*/}
      <ThemedView style={[styles.card, { marginTop: 20 }]}>
        <ThemedText style={styles.sectionTitle}>
          Education and Qualification
        </ThemedText>

        {education.length === 0 && (
          <ThemedText style={styles.emptyEducationText}>
            No education or qualifications added yet.
          </ThemedText>
        )}

        {education.map((item, index) => (
          <View key={index} style={styles.educationItem}>
            <View style={styles.educationItemHeader}>
              <ThemedText style={styles.educationItemTitle}>
                Qualification {index + 1}
              </ThemedText>

              <Pressable
                onPress={() => handleRemoveEducation(index)}
                disabled={isSavingEducation}
                accessibilityRole="button"
                accessibilityLabel={`Remove qualification ${index + 1}`}
                hitSlop={8}
              >
                <IconSymbol
                  name="trash.fill"
                  size={18}
                  color={appTheme.colors.danger}
                />
              </Pressable>
            </View>

            <View style={styles.fieldContainer}>
              <ThemedText style={styles.label}>Institution</ThemedText>

              <TextInput
                value={item.institution}
                placeholder="e.g. University of Lagos"
                placeholderTextColor={appTheme.colors.textMuted}
                autoCapitalize="words"
                editable={!isSavingEducation}
                style={styles.input}
                onFocus={() => setOpenDropdown(null)}
                onChangeText={(text) =>
                  updateEducation(index, 'institution', text)
                }
              />
            </View>

            <View>
              <ThemedText style={styles.label}>Degree</ThemedText>

              <TextInput
                value={item.degree}
                placeholder="e.g. MBBS"
                placeholderTextColor={appTheme.colors.textMuted}
                autoCapitalize="words"
                editable={!isSavingEducation}
                style={styles.input}
                onFocus={() => setOpenDropdown(null)}
                onChangeText={(text) =>
                  updateEducation(index, 'degree', text)
                }
              />
            </View>
          </View>
        ))}

        <Button
          label="Add Qualification"
          variant="outline"
          onPress={handleAddEducation}
          disabled={isSavingEducation}
          style={styles.btn}
        />

        <Button
          label="Save Education"
          onPress={handleSaveEducation}
          loading={isSavingEducation}
          style={styles.btn}
        />
      </ThemedView>
    </>
  );
}
