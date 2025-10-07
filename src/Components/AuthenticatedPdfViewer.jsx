import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';

// --- This is the reusable component to display protected PDFs ---
const AuthenticatedPdfViewer = ({ sourceUrl }) => {
  const [localPdfPath, setLocalPdfPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sourceUrl) {
      setError('No source URL provided.');
      setLoading(false);
      return;
    }

    const downloadPdf = async () => {
      // Create a unique local file path in the app's cache directory
      const fileName = sourceUrl.split('/').pop();
      const localFile = `${RNFS.CachesDirectoryPath}/${fileName}`;

      try {
        console.log(`Downloading PDF from: ${sourceUrl}`);
        
        const response = await RNFS.downloadFile({
          fromUrl: sourceUrl,
          toFile: localFile,
          // IMPORTANT: Add your authentication headers here!
          // This is what allows your app to access the file.
        //   headers: {
        //     'Authorization': `Bearer ${authToken}`,
        //     // Add any other headers your API requires
        //     // 'X-API-KEY': 'YOUR_API_KEY',
        //   },
        }).promise;

        if (response.statusCode === 200) {
          console.log('PDF downloaded successfully to:', localFile);
          setLocalPdfPath(localFile);
        } else {
          // If the server returns an error (like 401 Unauthorized or 404 Not Found)
          const errorBody = await RNFS.readFile(localFile);
          console.error(`Failed to download PDF. Status: ${response.statusCode}`, errorBody);
          setError(`Failed to load document. Server responded with status ${response.statusCode}.`);
          await RNFS.unlink(localFile).catch(() => {}); // Clean up failed download
        }
      } catch (err) {
        console.error('Error downloading PDF:', err);
        setError('An error occurred while trying to download the document.');
      } finally {
        setLoading(false);
      }
    };

    downloadPdf();
  }, [sourceUrl]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Document...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
      </View>
    );
  }

  if (localPdfPath) {
    return (
      <Pdf
        trustAllCerts={false}
        // The source is now the LOCAL file path
        source={{ uri: `file://${localPdfPath}` }}
        onLoadComplete={(numberOfPages) => {
          console.log(`Number of pages: ${numberOfPages}`);
        }}
        onError={(pdfError) => {
          console.error('Error rendering PDF:', pdfError);
          setError('Could not display the PDF file.');
        }}
        style={styles.pdf}
      />
    );
  }

  return null; // Or some fallback view
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '250', // Adjust height as needed
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default AuthenticatedPdfViewer;