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

// Theme
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Constants
import TYPOGRAPHY from '../constants/typography';

const ScanScreen = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [flash, setFlash] = useState(false);
    const [capturing, setCapturing] = useState(false);

    const cameraRef = useRef(null);
    const { colors } = useTheme();
    const { t } = useLanguage();

    if (!permission) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.loadingText, { color: colors.textWhite }]}>{t('scan.loading')}</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={colors.gradientPrimary}
                    style={styles.permissionContainer}
                >

                    <Camera size={80} color="#FFFFFF" style={{ marginBottom: 24 }} />
                    <Text style={styles.permissionTitle}>{t('scan.permissionTitle')}</Text>
                    <Text style={styles.permissionText}>
                        {t('scan.permissionText')}
                    </Text>
                    <Button
                        title={t('scan.grant')}
                        onPress={requestPermission}
                        variant="gradient"
                        gradientColors={['#FFFFFF', colors.lightGray]}
                        textStyle={{ color: colors.primary }}
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
                    t('scan.scanFailed'),
                    t('scan.scanFailedMsg'),
                    [
                        { text: t('common.tryAgain'), onPress: () => setCapturing(false) },
                        { text: t('scan.addManually'), onPress: () => navigation.navigate('AddMedicine') },
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
                    const fdaData = apiResult.medicines[0];

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

            navigation.navigate('AddMedicine', {
                scannedData: medicineData,
                photoUri: photo.uri,
            });

        } catch (error) {
            console.error('Error capturing photo:', error);
            Alert.alert(t('common.error'), t('scan.processFailed'));
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
                            {t('scan.instruction')}
                        </Text>
                        <Text style={styles.subInstructionText}>
                            {t('scan.subInstruction')}
                        </Text>
                    </View>

                    {/* Scanning Frame */}
                    <View style={styles.scanFrame}>
                        <View style={[styles.corner, styles.topLeft, { borderColor: colors.primary }]} />
                        <View style={[styles.corner, styles.topRight, { borderColor: colors.primary }]} />
                        <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.primary }]} />
                        <View style={[styles.corner, styles.bottomRight, { borderColor: colors.primary }]} />

                        <View style={[styles.scanLine, { backgroundColor: colors.primary }]} />
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
                                    <ZapOff size={28} color="#FFFFFF" />
                                ) : (
                                    <Zap size={28} color="#FFFFFF" />
                                )}
                                <Text style={styles.controlText}>{t('scan.flash')}</Text>
                            </TouchableOpacity>

                            {/* Capture Button */}
                            <TouchableOpacity
                                style={styles.captureButton}
                                onPress={handleCapture}
                                disabled={capturing}
                            >
                                <View style={styles.captureOuterRing}>
                                    <View style={[styles.captureInner, { backgroundColor: colors.primary }]} />
                                </View>
                            </TouchableOpacity>

                            {/* Manual Entry */}
                            <TouchableOpacity
                                style={styles.controlButton}
                                onPress={() => navigation.navigate('AddMedicine')}
                            >
                                <Type size={28} color="#FFFFFF" />
                                <Text style={styles.controlText}>{t('addMedicine.manual')}</Text>
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
        backgroundColor: '#0F1629',
    },
    loadingText: {
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
    permissionTitle: {
        fontSize: TYPOGRAPHY.fontSize.h1,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: '#FFFFFF',
        marginBottom: 16,
        textAlign: 'center',
    },
    permissionText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: '#FFFFFF',
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
        color: '#FFFFFF',
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subInstructionText: {
        color: '#FFFFFF',
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
        opacity: 0.6,
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
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
        color: '#FFFFFF',
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
        borderColor: '#FFFFFF',
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
    },
});

export default ScanScreen;
