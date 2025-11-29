// MediFlow OCR Service
// Text extraction from medicine photos
// NOTE: ML Kit doesn't work in Expo Go - using mock data for testing

import * as ImageManipulator from 'expo-image-manipulator';

class OCRService {
    async extractMedicineInfo(imageUri) {
        try {
            const processedImage = await this.preprocessImage(imageUri);
            const extractedText = await this.performOCR(processedImage.uri);
            const medicineInfo = this.parseMedicineText(extractedText);

            return {
                success: true,
                data: medicineInfo,
                rawText: extractedText,
            };
        } catch (error) {
            console.error('OCR Error:', error);
            return {
                success: false,
                error: error.message,
                data: null,
            };
        }
    }

    async preprocessImage(imageUri) {
        try {
            const manipulatedImage = await ImageManipulator.manipulateAsync(
                imageUri,
                [{ resize: { width: 1024 } }],
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
            );
            return manipulatedImage;
        } catch (error) {
            console.error('Image preprocessing error:', error);
            throw error;
        }
    }

    async performOCR(imageUri) {
        // Mock OCR for Expo Go testing
        console.log('Using mock OCR data (ML Kit not available in Expo Go)');
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockTexts = [
            'ASPIRIN\n500mg\nBayer AG\nTablet\nPain Relief',
            'PARACETAMOL\n650mg\nGSK\nTablet\nFever Reducer',
            'IBUPROFEN\n400mg\nPfizer\nTablet\nAnti-inflammatory',
            'AMOXICILLIN\n500mg\nSandoz\nCapsule\nAntibiotic',
        ];

        return mockTexts[Math.floor(Math.random() * mockTexts.length)];
    }

    parseMedicineText(text) {
        const lines = text.split('\n').filter(line => line.trim());
        return {
            verified_name: lines[0] || '',
            strength: this.extractStrength(text),
            manufacturer: this.extractManufacturer(lines),
            form: this.extractForm(text),
            category: this.extractCategory(text),
        };
    }

    extractStrength(text) {
        const match = text.match(/(\d+\.?\d*)\s?(mg|ml|mcg|g|%)/i);
        return match ? match[0] : '';
    }

    extractManufacturer(lines) {
        const manufacturers = ['Bayer', 'Pfizer', 'GSK', 'Novartis', 'Sanofi', 'Merck', 'Johnson', 'AstraZeneca', 'Roche', 'Sandoz'];
        for (const line of lines) {
            for (const manufacturer of manufacturers) {
                if (line.toLowerCase().includes(manufacturer.toLowerCase())) {
                    return manufacturer;
                }
            }
        }
        return '';
    }

    extractForm(text) {
        const forms = ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler'];
        const lowerText = text.toLowerCase();
        for (const form of forms) {
            if (lowerText.includes(form)) {
                return form.charAt(0).toUpperCase() + form.slice(1);
            }
        }
        return 'Tablet';
    }

    extractCategory(text) {
        const categories = {
            'pain': 'Pain Relief',
            'fever': 'Fever Reducer',
            'antibiotic': 'Antibiotic',
            'anti-inflammatory': 'Anti-inflammatory',
            'vitamin': 'Vitamin/Supplement',
            'allergy': 'Allergy',
        };
        const lowerText = text.toLowerCase();
        for (const [keyword, category] of Object.entries(categories)) {
            if (lowerText.includes(keyword)) {
                return category;
            }
        }
        return '';
    }
}

export default new OCRService();
