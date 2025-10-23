/**
 * ErrorBoundary Component
 * Catches React errors and prevents app crashes
 * Provides user-friendly error display with recovery options
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console (in production, send to error tracking service)
    console.error('🚨 Error caught by ErrorBoundary:', error);
    console.error('Error Info:', errorInfo);
    
    // Update error count
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // In production, you would send this to an error tracking service like Sentry
    // Example:
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    // Reset error state
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    // For web, reload the page
    if (typeof window !== 'undefined') {
      window.location.reload();
    } else {
      // For mobile, just reset
      this.handleReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = __DEV__;
      
      return (
        <View style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Error Icon */}
            <Text style={styles.emoji}>⚠️</Text>
            
            {/* Error Title */}
            <Text style={styles.title}>Something went wrong</Text>
            
            {/* User-friendly message */}
            <Text style={styles.message}>
              We're sorry, but something unexpected happened. 
              {this.state.errorCount > 2 && ' This error has occurred multiple times.'}
            </Text>

            {/* Error details (only in development) */}
            {isDevelopment && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>Error Details (Development Only):</Text>
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <Text style={styles.errorStack}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={this.handleReset}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={this.handleReload}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Reload App</Text>
              </TouchableOpacity>
            </View>

            {/* Help Text */}
            <Text style={styles.helpText}>
              If this problem persists, please contact support or try reinstalling the app.
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: fonts.sizes.large || 24,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: fonts.sizes.body || 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
    lineHeight: 24,
    maxWidth: 400,
  },
  errorDetails: {
    width: '100%',
    maxWidth: 500,
    marginBottom: 24,
  },
  errorDetailsTitle: {
    fontSize: fonts.sizes.small || 14,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 8,
  },
  errorBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger || '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: colors.danger || '#EF4444',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    color: colors.textLight,
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: colors.surface || '#FFFFFF',
    fontSize: fonts.sizes.body || 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.textLight,
  },
  secondaryButtonText: {
    color: colors.textLight,
    fontSize: fonts.sizes.body || 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: fonts.sizes.small || 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 24,
    opacity: 0.6,
    maxWidth: 400,
  },
});

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;

