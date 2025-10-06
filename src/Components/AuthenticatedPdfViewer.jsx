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



// import React, { useState, useEffect , useCallback} from 'react';
// import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
// import Pdf from 'react-native-pdf';
// import RNFS from 'react-native-fs';
// import * as Progress from 'react-native-progress';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// // --- This is the reusable component for handling documents ---
// const DocumentMessageHandler = ({ sourceUrl, fileName, authToken }) => {
//   // State to manage the file's status
//   const [fileExists, setFileExists] = useState(false);
//   const [localPdfPath, setLocalPdfPath] = useState('');
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [downloadProgress, setDownloadProgress] = useState(0);

//   // State to control the PDF viewer visibility
//   const [isViewerOpen, setIsViewerOpen] = useState(false);
  
//   const [error, setError] = useState(null);

//   // Memoize the file path calculation to avoid re-running it on every render
//   const getLocalFilePath = useCallback(() => {
//     const name = fileName || sourceUrl.split('/').pop();
//     return `${RNFS.CachesDirectoryPath}/${name}`;
//   }, [sourceUrl, fileName]);

//   useEffect(() => {
//     const filePath = getLocalFilePath();
//     setLocalPdfPath(filePath);

//     // Check if the file already exists when the component mounts
//     const checkIfFileExists = async () => {
//       try {
//         const exists = await RNFS.exists(filePath);
//         setFileExists(exists);
//       } catch (err) {
//         console.error("Error checking file existence:", err);
//       }
//     };
    
//     checkIfFileExists();
//   }, [sourceUrl, fileName, getLocalFilePath]);

//   const handleDownload = async () => {
//     setIsDownloading(true);
//     setDownloadProgress(0);
//     setError(null);

//     try {
//       await RNFS.downloadFile({
//         fromUrl: sourceUrl,
//         toFile: localPdfPath,
//         headers: {
//           // Uncomment and use your auth token if the URL is protected
//           // 'Authorization': `Bearer ${authToken}`,
//         },
//         progress: (res) => {
//           const progress = (res.bytesWritten / res.contentLength);
//           setDownloadProgress(progress);
//         },
//       }).promise;

//       setFileExists(true);
//     } catch (err) {
//       console.error('Download error:', err);
//       setError('Download failed. Please try again.');
//     } finally {
//       setIsDownloading(false);
//     }
//   };
  
//   // --- UI Rendering ---

//   // Renders the full-screen PDF viewer when active
//   if (isViewerOpen) {
//     return (
//       <View style={styles.viewerContainer}>
//         <TouchableOpacity style={styles.closeButton} onPress={() => setIsViewerOpen(false)}>
//            <Icon name="close" size={30} color="#fff" />
//         </TouchableOpacity>
//         <Pdf
//           source={{ uri: `file://${localPdfPath}` }}
//           trustAllCerts={false}
//           style={styles.pdf}
//           onError={(pdfError) => {
//             console.error(pdfError);
//             setError('Could not display the PDF.');
//             setIsViewerOpen(false); // Close viewer on error
//           }}
//         />
//       </View>
//     );
//   }

//   // Renders the preview bubble in the chat
//   return (
//     <View style={styles.previewContainer}>
//       <View style={styles.iconContainer}>
//         <MaterialCommunityIcons name="file-document-outline" size={30} color="#4F5E7B" />
//       </View>
//       <View style={styles.infoContainer}>
//         <Text style={styles.fileName} numberOfLines={1}>{fileName || 'Document'}</Text>
//         {error && <Text style={styles.errorText}>{error}</Text>}
//       </View>
      
//       {/* This block decides to show Download button, progress circle, or View button */}
//       <View style={styles.actionContainer}>
//         {isDownloading ? (
//           <Progress.Circle size={40} progress={downloadProgress} indeterminate={downloadProgress === 0} />
//         ) : fileExists ? (
//           <TouchableOpacity onPress={() => setIsViewerOpen(true)}>
//             <MaterialCommunityIcons name="eye-outline" size={30} color="#075E54" />
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity onPress={handleDownload}>
//             <MaterialCommunityIcons name="download-circle-outline" size={40} color="#075E54" />
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// };

// // --- STYLES ---
// const styles = StyleSheet.create({
//   // Styles for the preview bubble
//   previewContainer: {
//     width: 250,
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     borderRadius: 10,
//     backgroundColor: '#F0F4F8',
//     borderWidth: 1,
//     borderColor: '#E1E8EE',
//   },
//   iconContainer: {
//     padding: 10,
//     borderRadius: 50,
//     backgroundColor: '#fff',
//   },
//   infoContainer: {
//     flex: 1,
//     marginLeft: 10,
//     justifyContent: 'center',
//   },
//   fileName: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#000',
//   },
//   actionContainer: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 10,
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 12,
//   },

//   // Styles for the full-screen PDF viewer
//   viewerContainer: {
//     ...StyleSheet.absoluteFillObject, // This makes it take up the whole screen
//     backgroundColor: 'rgba(0,0,0,0.9)',
//     zIndex: 100,
//   },
//   pdf: {
//     flex: 1,
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 40, // Adjust for status bar
//     right: 20,
//     zIndex: 110, // Ensure it's above the PDF
//     padding: 5,
//   },
// });


