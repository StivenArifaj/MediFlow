// MediFlow Scan Screen
// Camera interface for scanning medicine boxes

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';

// Components
import Button from '../components/common/Button';

// Constants
import COLORS from '../constants/colors';
import TYPOGRAPHY from '../constants/typography';

const ScanScreen = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [flash, setFlash] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const cameraRef = useRef(null);

    if (!permission) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading camera...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={COLORS.gradientPrimary}
                    style={styles.permissionContainer}
                >
                    <Text style={styles.permissionIcon}>📸</Text>
                    <Text style={styles.permissionTitle}>Camera Access Required</Text>
                    <Text style={styles.permissionText}>
                        MediFlow needs camera access to scan your medicine boxes
                    </Text>
                    <Button
                        title="Grant Permission"
                        onPress={requestPermission}
                        variant="gradient"
                        gradientColors={[COLORS.white, COLORS.lightGray]}
                        textStyle={{ color: COLORS.primary }}
                        style={styles.permissionButton}
                    />
                </LinearGradient>
            </View>
        );
    }

    const handleCapture = async () => {
        if (!cameraRef.current || capturing) return;

        try {
            setCapturing(true);

            // Capture photo
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: false,
            });

            // Show processing alert
            Alert.alert('Processing...', 'Extracting medicine information from photo');

            // Import OCR service
            const ocrService = require('../services/ocrService').default;
            const apiService = require('../services/apiService').default;

            // Extract text from photo
            const ocrResult = await ocrService.extractMedicineInfo(photo.uri);

            if (!ocrResult.success) {
                Alert.alert(
                    'Scan Failed',
                    'Could not extract medicine information. Would you like to add manually?',
                    [
                        { text: 'Try Again', onPress: () => setCapturing(false) },
                        { text: 'Add Manually', onPress: () => navigation.navigate('AddMedicine') },
                    ]
                );
                return;
            }

            // Search OpenFDA for medicine details
            let medicineData = ocrResult.data;

            if (medicineData.verified_name) {
                const apiResult = await apiService.searchMedicine(medicineData.verified_name);

                if (apiResult.success && apiResult.data) {
                    // Merge OCR data with API data
                    medicineData = {
                        ...medicineData,
                        ...apiResult.data,
                        api_source: 'openfda',
                    };
                }
            }

            // Navigate to AddMedicine with pre-filled data
            navigation.navigate('AddMedicine', {
                scannedData: medicineData,
                photoUri: photo.uri,
            });

        } catch (error) {
            console.error('Error capturing photo:', error);
            Alert.alert('Error', 'Failed to process photo. Please try again.');
        } finally {
            setCapturing(false);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
                enableTorch={flash}
            >
                {/* Guide Overlay */}
                <View style={styles.overlay}>
                    <View style={styles.topOverlay}>
                        <Text style={styles.instructionText}>
                            Position medicine box in frame
                        </Text>
                    </View>

                    {/* Scanning Frame */}
                    <View style={styles.scanFrame}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>

                    <View style={styles.bottomOverlay}>
                        <Text style={styles.tipText}>
                            💡 Tip: Ensure good lighting and focus on the medicine name
                        </Text>
                    </View>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    {/* Flash Toggle */}
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => setFlash(!flash)}
                    >
                        <Text style={styles.controlIcon}>{flash ? '⚡' : '🔦'}</Text>
                        <Text style={styles.controlText}>Flash</Text>
                    </TouchableOpacity>

                    {/* Capture Button */}
                    <TouchableOpacity
                        style={styles.captureButton}
                        onPress={handleCapture}
                        disabled={capturing}
                    >
                        <LinearGradient
                            colors={COLORS.gradientPrimary}
                            style={styles.captureGradient}
                        >
                            <View style={styles.captureInner} />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Manual Entry */}
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => navigation.navigate('AddMedicine')}
                    >
                        <Text style={styles.controlIcon}>✏️</Text>
                        <Text style={styles.controlText}>Manual</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.textPrimary,
    },
    loadingText: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.fontSize.body,
        textAlign: 'center',
        marginTop: 100,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    permissionIcon: {
        fontSize: 80,
        marginBottom: 24,
    },
    permissionTitle: {
        fontSize: TYPOGRAPHY.fontSize.h1,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.white,
        marginBottom: 16,
        textAlign: 'center',
    },
    permissionText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.white,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    permissionButton: {
        minWidth: 200,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    topOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    instructionText: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    scanFrame: {
        width: 300,
        height: 200,
        alignSelf: 'center',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: COLORS.primary,
        borderWidth: 4,
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
    bottomOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    tipText: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.fontSize.small,
        textAlign: 'center',
        lineHeight: 20,
    },
    controls: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    controlButton: {
        alignItems: 'center',
    },
    controlIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    controlText: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        padding: 4,
    },
    captureGradient: {
        flex: 1,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.white,
    },
});

export default ScanScreen;
