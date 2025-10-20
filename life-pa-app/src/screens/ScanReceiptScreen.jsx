import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  ActivityIndicator 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';
import ButtonPrimary from '../components/ButtonPrimary';
import Toast from '../components/Toast';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { extractTextFromImage } from '../services/ocrService';
import { parseReceiptText } from '../utils/textParsing';
import { parseReceiptWithAI, isAIParsingAvailable } from '../services/aiReceiptParser';
import { createReceipt, uploadReceiptImage } from '../services/receiptService';
import { auth } from '../services/firebase';

// Conditionally import Camera only on native platforms
let Camera, CameraType;
if (Platform.OS !== 'web') {
  try {
    const cameraModule = require('expo-camera');
    Camera = cameraModule.Camera;
    CameraType = cameraModule.CameraType;
  } catch (error) {
    console.warn('expo-camera not available:', error);
  }
}

export default function ScanReceiptScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(CameraType?.back || 'back');
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedFileType, setCapturedFileType] = useState(null); // Track file type
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'web') {
      // On web, camera is not available but gallery/document upload works
      setHasPermission('web'); // Special value to indicate web mode
      return;
    }

    try {
      if (!Camera) {
        console.warn('Camera module not available');
        setHasPermission(false);
        return;
      }

      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      setHasPermission(
        cameraStatus.status === 'granted' && galleryStatus.status === 'granted'
      );
    } catch (error) {
      console.error('Permission request failed:', error);
      setHasPermission(false);
    }
  };

  const handleTakePhoto = async () => {
    setShowCamera(true);
  };

  const capturePhoto = async () => {
    if (!cameraRef) return;

    try {
      const photo = await cameraRef.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      
      setCapturedImage(photo.uri);
      setCapturedFileType('image');
      setShowCamera(false);
    } catch (error) {
      console.error('Failed to capture photo:', error);
      showToast('Failed to capture photo. Please try again.', 'error');
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      console.log('Opening image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      console.log('Image picker result:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Image selected:', result.assets[0].uri);
        setCapturedImage(result.assets[0].uri);
        setCapturedFileType('image');
        showToast('Image loaded successfully', 'success');
      } else {
        console.log('Image selection canceled or no assets');
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
      showToast('Failed to select image from gallery: ' + error.message, 'error');
    }
  };

  const handleUploadDocument = async () => {
    try {
      console.log('Opening document picker...');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', JSON.stringify(result, null, 2));

      // Handle different result formats (expo-document-picker API changes)
      if (result.canceled || result.type === 'cancel') {
        console.log('Document selection canceled');
        return;
      }

      // Handle both old and new API formats
      let document;
      if (result.assets && result.assets.length > 0) {
        document = result.assets[0];
      } else if (result.uri) {
        // Old API format
        document = result;
      } else {
        console.error('No document in result:', result);
        showToast('No document selected.', 'error');
        return;
      }

      console.log('Document selected:', {
        uri: document.uri,
        name: document.name,
        mimeType: document.mimeType,
        size: document.size
      });

      // Determine file type
      const mimeType = document.mimeType || document.type || '';
      const fileName = document.name || '';
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      
      // Check if it's an image
      const isImage = mimeType.startsWith('image/') || 
                     ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(fileExtension);
      
      const isPDF = mimeType === 'application/pdf' || fileExtension === 'pdf';

      console.log('File type detection:', { isImage, isPDF, mimeType, fileExtension });
      
      if (isImage) {
        // Image file - process directly
        console.log('Processing as image');
        setCapturedImage(document.uri);
        setCapturedFileType('image');
        showToast('Image loaded successfully', 'success');
      } else if (isPDF) {
        // PDF file
        console.log('Processing as PDF');
        if (Platform.OS === 'web') {
          // On web, just confirm and proceed
          const confirmed = window.confirm(
            'PDF documents are supported, but OCR accuracy may vary. For best results, use image files. Continue?'
          );
          if (confirmed) {
            setCapturedImage(document.uri);
            setCapturedFileType('pdf');
            showToast('PDF loaded - OCR may have limited accuracy', 'info');
          }
        } else {
          Alert.alert(
            'PDF Document Selected',
            'PDF documents are supported, but OCR accuracy may vary. For best results, use image files or take a photo.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Continue', 
                onPress: () => {
                  setCapturedImage(document.uri);
                  setCapturedFileType('pdf');
                  showToast('PDF loaded', 'success');
                }
              },
            ]
          );
        }
      } else {
        console.warn('Unsupported file type:', mimeType, fileExtension);
        showToast('Unsupported file type. Please select an image or PDF.', 'error');
      }
    } catch (error) {
      console.error('Failed to pick document:', error);
      showToast('Failed to select document: ' + error.message, 'error');
    }
  };

  const handleProcessReceipt = async () => {
    if (!capturedImage) {
      if (Platform.OS === 'web') {
        window.alert('No Image - Please capture or select a receipt image first.');
      } else {
        Alert.alert('No Image', 'Please capture or select a receipt image first.');
      }
      return;
    }

    setIsProcessing(true);
    console.log('=== STARTING RECEIPT PROCESSING ===');
    console.log('Image URI:', capturedImage);
    console.log('File type:', capturedFileType);

    try {
      let extractedText = '';
      
      // Try OCR extraction
      try {
        showToast('Extracting text from image...', 'info');
        console.log('Attempting OCR extraction...');
        extractedText = await extractTextFromImage(capturedImage);
        console.log('OCR successful, extracted text length:', extractedText?.length);
      } catch (ocrError) {
        console.error('OCR failed:', ocrError);
        
        // Ask user if they want to continue without OCR
        const continueWithoutOCR = Platform.OS === 'web'
          ? window.confirm('OCR extraction failed. Would you like to save the document without text extraction? You can manually enter details.')
          : await new Promise((resolve) => {
              Alert.alert(
                'OCR Failed',
                'Text extraction failed. Would you like to save the document without text extraction? You can manually enter details.',
                [
                  { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
                  { text: 'Continue', onPress: () => resolve(true) }
                ]
              );
            });
        
        if (!continueWithoutOCR) {
          setIsProcessing(false);
          return;
        }
        
        extractedText = 'OCR extraction failed - manual entry required';
      }

      // Parse receipt data with AI (if available) or basic parsing
      showToast('Parsing receipt data...', 'info');
      console.log('Parsing receipt text...');
      
      let parsedData;
      const aiAvailable = await isAIParsingAvailable();
      
      if (aiAvailable && extractedText && extractedText.trim().length > 50) {
        console.log('Using AI-powered parsing...');
        showToast('Using AI to extract receipt details...', 'info');
        try {
          parsedData = await parseReceiptWithAI(extractedText);
          console.log('AI parsed data:', parsedData);
          showToast('AI extraction complete!', 'success');
        } catch (aiError) {
          console.error('AI parsing failed, using basic parsing:', aiError);
          showToast('Using basic parsing...', 'info');
          parsedData = parseReceiptText(extractedText);
        }
      } else {
        console.log('Using basic text parsing...');
        parsedData = parseReceiptText(extractedText || 'No text extracted');
        console.log('Parsed data:', parsedData);
      }

      // Navigate to preview screen for review and save
      setIsProcessing(false);
      showToast('Ready to save!', 'success');

      // Navigate to receipt preview screen
      setTimeout(() => {
        navigation.navigate('ReceiptPreview', {
          imageUri: capturedImage,
          parsedData,
          extractedText: extractedText || '',
        });
      }, 500);

    } catch (error) {
      console.error('=== RECEIPT PROCESSING ERROR ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setIsProcessing(false);
      
      const errorMessage = error.message || 'Failed to process document. Please try again with a clearer image.';
      
      if (Platform.OS === 'web') {
        window.alert('Processing Failed: ' + errorMessage);
      } else {
        Alert.alert(
          'Processing Failed',
          errorMessage,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedFileType(null);
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  if (hasPermission === null) {
    return (
      <Layout>
        <AppHeader title="Upload Document" onBackPress={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.message}>Loading...</Text>
        </View>
      </Layout>
    );
  }

  if (hasPermission === false) {
    return (
      <Layout>
        <AppHeader title="Upload Document" onBackPress={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <Text style={styles.warningIcon}>📸</Text>
          <Text style={styles.warningTitle}>Camera Access Required</Text>
          <Text style={styles.warningMessage}>
            Please enable camera permissions in your device settings to upload documents.
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

  // Show camera view (only on native platforms)
  if (showCamera && Platform.OS !== 'web' && Camera) {
    return (
      <Layout style={styles.layout}>
        <AppHeader 
          title="Take Photo" 
          onBackPress={() => setShowCamera(false)} 
        />
        <Camera
          style={styles.camera}
          type={cameraType}
          ref={setCameraRef}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              <Text style={styles.scanInstruction}>
                Position document within frame
              </Text>
            </View>
          </View>

          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={capturePhoto}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </Camera>
      </Layout>
    );
  }

  return (
    <Layout style={styles.layout}>
      <AppHeader title="Scan Receipt" onBackPress={() => navigation.goBack()} />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      <View style={styles.content}>
        {!capturedImage ? (
          <>
            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>📋 Tips for best results:</Text>
              {Platform.OS !== 'web' ? (
                <>
                  <Text style={styles.instructionItem}>• Ensure good lighting</Text>
                  <Text style={styles.instructionItem}>• Place receipt on flat surface</Text>
                  <Text style={styles.instructionItem}>• Capture entire receipt</Text>
                  <Text style={styles.instructionItem}>• Avoid shadows and glare</Text>
                  <Text style={styles.instructionItem}>• Or upload image/PDF documents</Text>
                </>
              ) : (
                <>
                  <Text style={styles.instructionItem}>• Use clear, high-quality images</Text>
                  <Text style={styles.instructionItem}>• Select from gallery or upload documents</Text>
                  <Text style={styles.instructionItem}>• Supports JPEG, PNG, PDF formats</Text>
                  <Text style={styles.instructionItem}>• Camera available on mobile app</Text>
                </>
              )}
            </View>

            {/* Preview Area */}
            <View style={styles.previewPlaceholder}>
              <Text style={styles.previewIcon}>📤</Text>
              <Text style={styles.previewText}>Ready to upload</Text>
              <Text style={styles.previewSubtext}>
                {Platform.OS !== 'web' 
                  ? 'Capture, select from gallery, or upload a document'
                  : 'Select from gallery or upload a document'}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSelectFromGallery}
              >
                <Text style={styles.secondaryIcon}>🖼️</Text>
                <Text style={styles.secondaryText}>Gallery</Text>
              </TouchableOpacity>

              {Platform.OS !== 'web' && Camera && (
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={handleTakePhoto}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleUploadDocument}
              >
                <Text style={styles.secondaryIcon}>📄</Text>
                <Text style={styles.secondaryText}>Document</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Image/PDF Preview */}
            <View style={styles.imagePreviewContainer}>
              {capturedFileType === 'pdf' ? (
                // PDF Placeholder
                <View style={styles.pdfPlaceholder}>
                  <Text style={styles.pdfIcon}>📄</Text>
                  <Text style={styles.pdfTitle}>PDF Document Loaded</Text>
                  <Text style={styles.pdfSubtext}>
                    PDF preview not available in browser
                  </Text>
                  <Text style={styles.pdfSubtext}>
                    Click "Process Document" to extract text
                  </Text>
                  <Text style={styles.pdfWarning}>
                    ⚠️ OCR accuracy may vary with PDF files
                  </Text>
                </View>
              ) : (
                // Image Preview
                <Image 
                  source={{ uri: capturedImage }} 
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              )}
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
                title={isProcessing ? "Processing..." : "Process Document"}
                onPress={handleProcessReceipt}
                disabled={isProcessing}
                style={styles.previewButton}
              />
            </View>

            {/* Processing Info */}
            {isProcessing && (
              <View style={styles.processingInfo}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.processingText}>
                  🔍 Extracting text and analyzing receipt...
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
    marginTop: 16,
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
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
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
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
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
  previewPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    margin: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  previewIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  previewText: {
    fontSize: fonts.sizes.title,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  previewSubtext: {
    fontSize: fonts.sizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  secondaryButton: {
    alignItems: 'center',
    minWidth: 70,
  },
  secondaryIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  secondaryText: {
    fontSize: fonts.sizes.small,
    color: colors.textLight,
    fontWeight: '500',
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
  imagePreviewContainer: {
    flex: 1,
    backgroundColor: '#000',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  pdfPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 32,
  },
  pdfIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  pdfTitle: {
    fontSize: fonts.sizes.title,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  pdfSubtext: {
    fontSize: fonts.sizes.body,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  pdfWarning: {
    fontSize: fonts.sizes.small,
    color: colors.error || '#F44336',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
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
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  processingText: {
    fontSize: fonts.sizes.body,
    color: colors.textLight,
    fontWeight: '500',
  },
});

