/**
 * CameraView Component
 * Handles camera functionality for capturing images
 * Only available on mobile platforms (not web)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import PropTypes from 'prop-types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

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

function CameraView({ 
  cameraType, 
  onCameraReady,
  onCapture, 
  onClose,
  onFlipCamera 
}) {
  // Fallback for web or missing camera
  if (!Camera || Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Camera not available</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕ Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={cameraType}
        ref={onCameraReady}
      >
        <View style={styles.cameraOverlay}>
          {/* Close Button */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          {/* Camera Frame Guide */}
          <View style={styles.frameGuide}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            {/* Flip Camera Button */}
            <TouchableOpacity style={styles.flipButton} onPress={onFlipCamera}>
              <Text style={styles.flipButtonText}>🔄</Text>
            </TouchableOpacity>

            {/* Capture Button */}
            <TouchableOpacity style={styles.captureButton} onPress={onCapture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            {/* Spacer for alignment */}
            <View style={styles.flipButton} />
          </View>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: fonts.sizes.h3,
    marginBottom: 20,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  topControls: {
    padding: 20,
    alignItems: 'flex-end',
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: fonts.sizes.body,
    fontWeight: '600',
  },
  frameGuide: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
    bottom: '35%',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.primary,
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
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  flipButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    fontSize: 24,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#fff',
  },
});

CameraView.propTypes = {
  cameraType: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]).isRequired,
  onCameraReady: PropTypes.func.isRequired,
  onCapture: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onFlipCamera: PropTypes.func.isRequired,
};

export default React.memo(CameraView);

