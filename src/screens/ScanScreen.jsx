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

import { Camera, Zap, ZapOff, Type, X, Image as ImageIcon } from 'lucide-react-native';

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
                    <Camera size={80} color={COLORS.white} style={{ marginBottom: 24 }} />
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

            console.log('📋 OCR Extracted Data:', medicineData);

            if (medicineData.verified_name) {
                const apiResult = await apiService.searchMedicine(medicineData.verified_name);

                console.log('🔍 OpenFDA API Result:', apiResult);

                if (apiResult.success && apiResult.medicines && apiResult.medicines.length > 0) {
                    // Get first medicine from results
                    const fdaData = apiResult.medicines[0];

                    // Merge OCR data with API data (OCR takes priority for what it found)
                    medicineData = {
                        verified_name: medicineData.verified_name || fdaData.brandName,
                        brand_name: medicineData.brand_name || fdaData.brandName,
                        generic_name: medicineData.generic_name || fdaData.genericName,
                        manufacturer: medicineData.manufacturer || fdaData.manufacturer,
                        strength: medicineData.strength,
                        form: medicineData.form,
                        category: medicineData.category || fdaData.purpose,
                        api_source: 'openfda',
                    };
                }
            }

            console.log('✅ Final Medicine Data:', medicineData);

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
                            Scan Medicine Box
                        </Text>
                        <Text style={styles.subInstructionText}>
                            Align the medicine name within the frame
                        </Text>
                    </View>

                    {/* Scanning Frame */}
                    <View style={styles.scanFrame}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />

                        {/* Animated Scan Line (Visual only for now) */}
                        <View style={styles.scanLine} />
                    </View>

                    <View style={styles.bottomOverlay}>
                        {/* Controls */}
                        <View style={styles.controls}>
                            {/* Flash Toggle */}
                            <TouchableOpacity
                                style={styles.controlButton}
                                onPress={() => setFlash(!flash)}
                            >
                                {flash ? (
                                    <ZapOff size={28} color={COLORS.white} />
                                ) : (
                                    <Zap size={28} color={COLORS.white} />
                                )}
                                <Text style={styles.controlText}>Flash</Text>
                            </TouchableOpacity>

                            {/* Capture Button */}
                            <TouchableOpacity
                                style={styles.captureButton}
                                onPress={handleCapture}
                                disabled={capturing}
                            >
                                <View style={styles.captureOuterRing}>
                                    <View style={styles.captureInner} />
                                </View>
                            </TouchableOpacity>

                            {/* Manual Entry */}
                            <TouchableOpacity
                                style={styles.controlButton}
                                onPress={() => navigation.navigate('AddMedicine')}
                            >
                                <Type size={28} color={COLORS.white} />
                                <Text style={styles.controlText}>Manual</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
    subInstructionText: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.fontSize.small,
        textAlign: 'center',
        opacity: 0.8,
        marginTop: 8,
    },
    scanFrame: {
        width: 280,
        height: 280,
        alignSelf: 'center',
        position: 'relative',
        justifyContent: 'center',
    },
    scanLine: {
        width: '100%',
        height: 2,
        backgroundColor: COLORS.primary,
        opacity: 0.6,
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: COLORS.primary,
        borderWidth: 4,
        borderRadius: 4,
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
        justifyContent: 'flex-end',
        paddingBottom: 40,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 32,
        width: '100%',
    },
    controlButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
    },
    controlText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 8,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'transparent',
        borderWidth: 4,
        borderColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureOuterRing: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
    },
});

export default ScanScreen;
