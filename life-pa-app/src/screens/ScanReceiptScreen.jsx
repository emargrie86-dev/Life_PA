import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  Alert,
  Platform,
  Image 
} from 'react-native';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';
import ButtonPrimary from '../components/ButtonPrimary';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export default function ScanReceiptScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Request camera permissions
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    // This is a placeholder for actual camera permission logic
    // In a real app, you would use expo-camera or react-native-camera
    if (Platform.OS === 'web') {
      Alert.alert(
        'Camera Not Available',
        'Camera scanning is not available on web. Please use the mobile app.'
      );
      setHasPermission(false);
    } else {
      // Simulate permission granted for now
      setHasPermission(true);
    }
  };

  const handleTakePhoto = () => {
    // This is a placeholder for actual camera capture
    Alert.alert(
      'Camera Feature',
      'Camera integration requires expo-camera package. This will capture receipt images for OCR processing.',
      [{ text: 'OK' }]
    );
    
    // Simulate photo capture
    setCapturedImage('placeholder');
  };

  const handleSelectFromGallery = () => {
    Alert.alert(
      'Gallery Feature',
      'Gallery selection requires expo-image-picker package. Users can select existing receipt photos.',
      [{ text: 'OK' }]
    );
  };

  const handleProcessReceipt = async () => {
    if (!capturedImage) {
      Alert.alert('No Image', 'Please capture or select a receipt image first.');
      return;
    }

    setIsProcessing(true);

    // Simulate OCR processing
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        'Receipt Processed',
        'OCR extraction complete! Receipt details have been saved.',
        [
          {
            text: 'View Details',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 2000);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  if (hasPermission === null) {
    return (
      <Layout>
        <AppHeader title="Scan Receipt" onBackPress={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <Text style={styles.message}>Requesting camera permission...</Text>
        </View>
      </Layout>
    );
  }

  if (hasPermission === false) {
    return (
      <Layout>
        <AppHeader title="Scan Receipt" onBackPress={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <Text style={styles.warningIcon}>📸</Text>
          <Text style={styles.warningTitle}>Camera Access Required</Text>
          <Text style={styles.warningMessage}>
            Please enable camera permissions in your device settings to scan receipts.
          </Text>
          <ButtonPrimary
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={styles.button}
          />
        </View>
      </Layout>
    );
  }

  return (
    <Layout style={styles.layout}>
      <AppHeader title="Scan Receipt" onBackPress={() => navigation.goBack()} />
      
      <View style={styles.content}>
        {!capturedImage ? (
          <>
            {/* Camera Preview Area */}
            <View style={styles.cameraPreview}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
                
                <Text style={styles.scanInstruction}>
                  Position receipt within frame
                </Text>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>📋 Tips for best results:</Text>
              <Text style={styles.instructionItem}>• Ensure good lighting</Text>
              <Text style={styles.instructionItem}>• Place receipt on flat surface</Text>
              <Text style={styles.instructionItem}>• Capture entire receipt</Text>
              <Text style={styles.instructionItem}>• Avoid shadows and glare</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={handleSelectFromGallery}
              >
                <Text style={styles.galleryIcon}>🖼️</Text>
                <Text style={styles.galleryText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleTakePhoto}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>

              <View style={styles.placeholder} />
            </View>
          </>
        ) : (
          <>
            {/* Image Preview */}
            <View style={styles.imagePreviewContainer}>
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderIcon}>🧾</Text>
                <Text style={styles.imagePlaceholderText}>Receipt Image Preview</Text>
                <Text style={styles.imagePlaceholderSubtext}>
                  OCR will extract: Merchant, Date, Amount, Items
                </Text>
              </View>
            </View>

            {/* Preview Actions */}
            <View style={styles.previewActions}>
              <ButtonPrimary
                title="Retake"
                onPress={handleRetake}
                variant="outline"
                style={styles.previewButton}
              />
              <ButtonPrimary
                title="Process Receipt"
                onPress={handleProcessReceipt}
                loading={isProcessing}
                style={styles.previewButton}
              />
            </View>

            {/* Processing Info */}
            {isProcessing && (
              <View style={styles.processingInfo}>
                <Text style={styles.processingText}>
                  🔍 Analyzing receipt...
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  layout: {
    padding: 0,
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    fontSize: fonts.sizes.body,
    color: colors.textLight,
    textAlign: 'center',
  },
  warningIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: fonts.sizes.title,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 12,
    textAlign: 'center',
  },
  warningMessage: {
    fontSize: fonts.sizes.body,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  button: {
    minWidth: 200,
  },
  cameraPreview: {
    flex: 1,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: '80%',
    aspectRatio: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.accent,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanInstruction: {
    fontSize: fonts.sizes.body,
    color: colors.accent,
    fontWeight: '600',
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: colors.surface,
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  instructionItem: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    marginBottom: 4,
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  galleryButton: {
    alignItems: 'center',
  },
  galleryIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  galleryText: {
    fontSize: fonts.sizes.small,
    color: colors.textLight,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primary,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
  },
  placeholder: {
    width: 48,
  },
  imagePreviewContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  imagePlaceholderIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  imagePlaceholderText: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  imagePlaceholderSubtext: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.6,
    textAlign: 'center',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  previewButton: {
    flex: 1,
  },
  processingInfo: {
    padding: 16,
    alignItems: 'center',
  },
  processingText: {
    fontSize: fonts.sizes.body,
    color: colors.textLight,
    fontWeight: '500',
  },
});

