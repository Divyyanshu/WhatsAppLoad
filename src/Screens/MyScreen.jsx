import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  StatusBar,
  Linking,
  Animated,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import WhatsAppLoaders from '../Components/WhatsAppLoaders';
import Footer from '../Components/Footer';

// Dummy images (Unsplash) - can be replaced with local assets or actual profile/project images
const DUMMY_PROFILE =
  'https://avatars.githubusercontent.com/u/128120812?s=400&u=0042a76e14ff1edcce3940c725b4be35d3525f1b&v=4';
const DUMMY_PROJECT_1 =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop';
const DUMMY_PROJECT_2 =
  'https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=1200&h=800&fit=crop';
const DUMMY_PROJECT_3 =
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&h=800&fit=crop';

// Localized strings (English / Hindi) - Hindi translations are partial; update as needed
const TEXTS = {
  en: {
    name: 'Divyanshu Tailor',
    role: 'React.js & React Native Developer',
    about:
      'Creative and detail-oriented Front End Developer with hands-on experience in building scalable web and mobile applications using React.js and React Native. Proven expertise in delivering responsive UIs, user-centric designs, and seamless user experiences. Committed to writing clean, maintainable code and collaborating effectively within Agile development environments.',
    experienceTitle: 'Professional Experience',
    projectsTitle: 'Projects',
    skillsTitle: 'Skills',
    educationTitle: 'Education',
    certificationsTitle: 'Certifications',
    achievementsTitle: 'Achievements',
    hobbiesTitle: 'Hobbies',
    contactTitle: 'Contact',
    viewProject: 'View Project',
    showCerts: 'Show Certifications',
    hideCerts: 'Hide Certifications',
    loading: 'Loading...',
  },
  hi: {
    name: 'दिव्यांशु टेलर',
    role: 'रिएक्ट.जेएस और रिएक्ट नेटिव डेवलपर',
    about:
      'रचनात्मक और विवरण-उन्मुख फ्रंटएंड डेवलपर, जो रिएक्ट.जेएस और रिएक्ट नेटिव का उपयोग करके स्केलेबल वेब और मोबाइल एप्लिकेशन बनाने में अनुभव रखता है। उत्तरदायी यूआई, उपयोगकर्ता-केंद्रित डिज़ाइन और सहज उपयोगकर्ता अनुभव प्रदान करने में सिद्ध दक्षता। स्वच्छ और बनाए रखने योग्य कोड लिखने तथा एगाइल डेवलपमेंट वातावरण में प्रभावी सहयोग के लिए प्रतिबद्ध।',
    experienceTitle: 'अनुभव',
    projectsTitle: 'परियोजनाएँ',
    skillsTitle: 'कौशल',
    educationTitle: 'शिक्षा',
    certificationsTitle: 'प्रमाण पत्र',
    achievementsTitle: 'उपलब्धियाँ',
    hobbiesTitle: 'शौक',
    contactTitle: 'संपर्क',
    viewProject: 'परियोजना देखें',
    showCerts: 'प्रमाण पत्र देखें',
    hideCerts: 'छुपाएँ',
    loading: 'लोड हो रहा है...',
  },
};

export default function App() {
  // Theme state: 'light' or 'dark'
  const [isDark, setIsDark] = useState(false);
  // Language state: 'en' or 'hi'
  const [lang, setLang] = useState('en');
  // Font size: 'small' | 'medium' | 'large'
  const [fontSize, setFontSize] = useState('medium');
  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Certification section animated values
  const certAnim = useRef(new Animated.Value(0)).current; // 0: collapsed, 1: expanded
  const [certOpen, setCertOpen] = useState(false);

  // Animate on toggle
  const toggleCerts = () => {
    const toValue = certOpen ? 0 : 1;
    setCertOpen(!certOpen);
    Animated.timing(certAnim, {
      toValue,
      duration: 450,
      useNativeDriver: true,
    }).start();
  };

  // Derived theme styles
  const theme = isDark ? themes.dark : themes.light;
  const t = TEXTS[lang];

  // font size mapping
  const fontScale =
    fontSize === 'small' ? 0.9 : fontSize === 'large' ? 1.15 : 1.0;

  // interpolate for certification container
  const certTranslate = certAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  const certOpacity = certAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // project press handler - update links to actual project repos if available
  const openLink = async url => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else alert('Cannot open link');
    } catch (e) {
      alert('Error opening link');
    }
  };

  // Social links
  const socialLinks = {
    github: 'https://github.com/divyanshutailor',
    linkedin: 'https://www.linkedin.com/in/divyanshutailor',
    email: 'mailto:divyanshutailor@gmail.com',
  };

  // Loader timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.safe,
          {
            backgroundColor: theme.bg,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <WhatsAppLoaders type="dots" color={theme.primary} size={80} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderColor: theme.divider }]}>
          <Image source={{ uri: DUMMY_PROFILE }} style={styles.avatar} />
          <View style={styles.headerText}>
            <Text
              style={[
                styles.name,
                { color: theme.text, fontSize: 22 * fontScale },
              ]}
            >
              {t.name}
            </Text>
            <Text
              style={[
                styles.role,
                { color: theme.muted, fontSize: 14 * fontScale },
              ]}
            >
              {t.role}
            </Text>
            <Text
              style={[
                styles.about,
                { color: theme.text, fontSize: 13 * fontScale, marginTop: 8 },
              ]}
            >
              {t.about}
            </Text>
          </View>
          {/* Controls */}
        </View>

        {/* Controls Row: Theme, Language, FontSize */}
        <View style={styles.controlsRow}>
          <View style={styles.controlBlock}>
            <Text style={[styles.controlLabel, { color: theme.muted }]}>
              Dark Mode
            </Text>
            <Switch value={isDark} onValueChange={setIsDark} />
          </View>

          <View style={styles.controlBlock}>
            <Text style={[styles.controlLabel, { color: theme.muted }]}>
              Language
            </Text>
            <View style={styles.langRow}>
              <TouchableOpacity
                onPress={() => setLang('en')}
                style={[
                  styles.langBtn,
                  lang === 'en' && {
                    borderColor: theme.primary,
                    backgroundColor: theme.badgeBg,
                  },
                ]}
              >
                <Text style={[styles.langText, { color: theme.text }]}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLang('hi')}
                style={[
                  styles.langBtn,
                  lang === 'hi' && {
                    borderColor: theme.primary,
                    backgroundColor: theme.badgeBg,
                  },
                ]}
              >
                <Text style={[styles.langText, { color: theme.text }]}>HI</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.controlBlock}>
            <Text style={[styles.controlLabel, { color: theme.muted }]}>
              Font
            </Text>
            <View style={styles.langRow}>
              <TouchableOpacity
                onPress={() => setFontSize('small')}
                style={[
                  styles.fontBtn,
                  fontSize === 'small' && {
                    borderColor: theme.primary,
                    backgroundColor: theme.badgeBg,
                  },
                ]}
              >
                <Text style={[styles.langText, { color: theme.text }]}>A-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFontSize('medium')}
                style={[
                  styles.fontBtn,
                  fontSize === 'medium' && {
                    borderColor: theme.primary,
                    backgroundColor: theme.badgeBg,
                  },
                ]}
              >
                <Text style={[styles.langText, { color: theme.text }]}>A</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFontSize('large')}
                style={[
                  styles.fontBtn,
                  fontSize === 'large' && {
                    borderColor: theme.primary,
                    backgroundColor: theme.badgeBg,
                  },
                ]}
              >
                <Text style={[styles.langText, { color: theme.text }]}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Experience Section - Updated with detailed experiences */}
        <Section title={t.experienceTitle} theme={theme}>
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: theme.text,
                fontSize: 15 * fontScale,
                fontWeight: '600',
              }}
            >
              React Native Developer, Load-Infotech
            </Text>
            <Text style={{ color: theme.muted, fontSize: 13 * fontScale }}>
              01/2025 - Present, Jaipur, India
            </Text>
            <Text
              style={{
                color: theme.text,
                fontSize: 14 * fontScale,
                marginTop: 8,
              }}
            >
              • Projects: JYB Connect (ABRSM Pan-India Public Application)\n •
              Built a Pan-India teacher attendance and verification app with QR
              code generation & scanning, dynamic ID card creation, user
              verification workflows, and automated PDF/Excel report
              generation.\n • JYB Connect: Developed a premium two-wheeler
              dealership management app with multi-step workflows (Dealer, KPI,
              Manpower, Workshop) and offline-first architecture using SQLite &
              AsyncStorage with REST API integration for real-time sync.\n •
              Designed dynamic dashboards with conditional rendering and user
              role-based views.\n • Collaborated with backend teams to ensure
              smooth API integration, while taking ownership of core
              functionalities—from screen design and logic to testing and
              performance optimization.
            </Text>
          </View>
          <View>
            <Text
              style={{
                color: theme.text,
                fontSize: 15 * fontScale,
                fontWeight: '600',
              }}
            >
              MERN Stack Intern, Global IT Providers
            </Text>
            <Text style={{ color: theme.muted, fontSize: 13 * fontScale }}>
              07/2024 - Present, Jaipur, India
            </Text>
            <Text
              style={{
                color: theme.text,
                fontSize: 14 * fontScale,
                marginTop: 8,
              }}
            >
              • Developed and deployed a Job Portal Application using React.js,
              Express.js, MongoDB, and Node.js.\n • Implemented tracking
              features for job posting, user authentication, and application
              tracking.\n • Optimized database queries for improved performance
              and data consistency.\n • Collaborated with senior developers to
              complete tasks and resolve bugs.\n • Tested and debugged APIs and
              front-end features to ensure a seamless user experience.
            </Text>
          </View>
        </Section>

        {/* Projects Section - Updated with actual projects */}
        <Section title={t.projectsTitle} theme={theme}>
          <View style={styles.projectsRow}>
            <ProjectCard
              image={DUMMY_PROJECT_1}
              title={'ABRMS (Akhil Bhartiya Rashriya Shaikshik Mahasangh)'}
              desc={
                'Designed and developed custom UI for Login/Sign-up with OTP and integrated QR code generation & scanning with dynamic ID card creation. Implemented PDF/Excel report generation using dynamic data and conditions. Built user verification workflows for teacher attendance and validation. Testing, iOS deployment via Xcode.'
              }
              onPress={() => openLink('https://github.com/divyanshutailor')} // Link to GitHub as placeholder
              theme={theme}
              fontScale={fontScale}
              btnText={t.viewProject}
            />
            <ProjectCard
              image={DUMMY_PROJECT_2}
              title={'JYB Connect - Two Wheeler Dealership Management App'}
              desc={
                'Built using React Native CLI with multi-step forms (Dealer, Table, KPI, Manpower, Workshop). Used AsyncStorage and SQLite to manage form data locally before synchronization. Implemented conditional UI rendering and user-friendly validations with integrated REST API for real-time data sync.'
              }
              onPress={() => openLink('https://github.com/divyanshutailor')} // Link to GitHub as placeholder
              theme={theme}
              fontScale={fontScale}
              btnText={t.viewProject}
            />
          </View>

          <ProjectCard
            image={DUMMY_PROJECT_3}
            title={'Movie Flex'}
            desc={
              'Built a React.js-based web application for searching and fetching movie details using the OMDB API. Integrated debouncing in search functionality with the Lodash library to optimize performance. Designed a responsive UI to display movie information dynamically.'
            }
            onPress={() => openLink('https://github.com/divyanshutailor')} // Link to GitHub as placeholder
            theme={theme}
            fontScale={fontScale}
            btnText={t.viewProject}
            fullWidth
          />
        </Section>

        {/* Skills Section - Updated with actual skills */}
        <Section title={t.skillsTitle} theme={theme}>
          <View style={styles.skillWrap}>
            {[
              'JavaScript',
              'TypeScript',
              'React.js',
              'React Native (CLI)',
              'Expo',
              'SQLite',
              'AsyncStorage',
              'MongoDB',
              'RESTful APIs',
              'Android Studio',
              'Postman',
              'Git & GitHub',
              'Firebase',
              'HTML',
              'CSS3',
              'Tailwind CSS',
              'MUI',
              'StyleSheet css',
              'React Native Paper',
              'Native Packages',
              'API Integration (REST / CURL)',
              'Version Control',
              'Mobile Device & Web Responsive Design',
              'State Management (UseContext, API, Redux)',
            ].map(s => (
              <View
                key={s}
                style={[styles.skillChip, { backgroundColor: theme.badgeBg }]}
              >
                <Text style={{ color: theme.text, fontSize: 13 * fontScale }}>
                  {s}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Education - Updated */}
        <Section title={t.educationTitle} theme={theme}>
          <Text style={{ color: theme.text, fontSize: 14 * fontScale }}>
            Bachelor of Technology, Information Technology — M.L.V. Textile &
            Engineering College (2021 - 2024, Bhilwara, India)
          </Text>
        </Section>

        {/* Certifications - Kept as example since not in resume; can remove if not needed */}
        <Section title={t.certificationsTitle} theme={theme}>
          <View style={{ marginBottom: 8 }}>
            <Pressable
              onPress={toggleCerts}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <View
                style={[styles.advancedBtn, { backgroundColor: theme.btnBg }]}
              >
                <Text
                  style={[styles.advancedBtnText, { color: theme.btnText }]}
                >
                  {certOpen ? t.hideCerts : t.showCerts}
                </Text>
              </View>
            </Pressable>
          </View>

          <Animated.View
            style={{
              transform: [{ translateY: certTranslate }],
              opacity: certOpacity,
            }}
            pointerEvents={certOpen ? 'auto' : 'none'}
          >
            {/* Example certification cards - Add actual if available */}
            <View style={[styles.certCard, { backgroundColor: theme.cardBg }]}>
              <Text style={{ color: theme.text, fontSize: 15 * fontScale }}>
                React Native Professional — Certificate
              </Text>
              <Text
                style={{
                  color: theme.muted,
                  marginTop: 6,
                  fontSize: 13 * fontScale,
                }}
              >
                Issued: Jan 2024 — ID: RN-12345
              </Text>
            </View>

            <View style={[styles.certCard, { backgroundColor: theme.cardBg }]}>
              <Text style={{ color: theme.text, fontSize: 15 * fontScale }}>
                Advanced JavaScript — Certificate
              </Text>
              <Text
                style={{
                  color: theme.muted,
                  marginTop: 6,
                  fontSize: 13 * fontScale,
                }}
              >
                Issued: Aug 2023 — ID: JS-67890
              </Text>
            </View>
          </Animated.View>
        </Section>

        {/* Achievements - Extracted from experience */}
        <Section title={t.achievementsTitle} theme={theme}>
          <View style={{ paddingVertical: 6 }}>
            <Text style={{ color: theme.text, fontSize: 14 * fontScale }}>
              • Built a Pan-India teacher attendance and verification app with
              advanced features like QR scanning and dynamic reports.
            </Text>
            <Text
              style={{
                color: theme.text,
                fontSize: 14 * fontScale,
                marginTop: 6,
              }}
            >
              • Developed offline-first architecture for dealership management
              app, reducing sync issues.
            </Text>
            <Text
              style={{
                color: theme.text,
                fontSize: 14 * fontScale,
                marginTop: 6,
              }}
            >
              • Optimized database queries in Job Portal app for better
              performance.
            </Text>
          </View>
        </Section>

        {/* Hobbies - Not in resume; using placeholders */}
        <Section title={t.hobbiesTitle} theme={theme}>
          <View style={styles.hobbyRow}>
            <Text style={{ color: theme.text, fontSize: 14 * fontScale }}>
              🎸 Music
            </Text>
            <Text style={{ color: theme.text, fontSize: 14 * fontScale }}>
              🎮 Gaming
            </Text>
            <Text style={{ color: theme.text, fontSize: 14 * fontScale }}>
              📚 Reading
            </Text>
          </View>
        </Section>

        {/* Contact / Footer - Updated links */}
        <Section title={t.contactTitle} theme={theme}>
          <View style={styles.contactRow}>
            <TouchableOpacity
              onPress={() => openLink(socialLinks.github)}
              style={[styles.socialBtn, { borderColor: theme.divider }]}
            >
              <Text style={{ color: theme.text }}>GitHub</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openLink(socialLinks.linkedin)}
              style={[styles.socialBtn, { borderColor: theme.divider }]}
            >
              <Text style={{ color: theme.text }}>LinkedIn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openLink(socialLinks.email)}
              style={[styles.socialBtn, { borderColor: theme.divider }]}
            >
              <Text style={{ color: theme.text }}>Email</Text>
            </TouchableOpacity>
          </View>
        </Section>

        <View style={{ height: 30 }} />
      </ScrollView>
      <Footer companyName="DR-Tailor's" />
    </SafeAreaView>
  );
}

// --- Components ---
function Section({ title, children, theme }) {
  return (
    <View
      style={[
        styles.section,
        { backgroundColor: 'transparent', borderColor: theme.divider },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: theme.primary }]}>
        {title}
      </Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function ProjectCard({
  image,
  title,
  desc,
  onPress,
  theme,
  fontScale = 1,
  fullWidth = false,
  btnText,
}) {
  return (
    <View style={[styles.projectCard, fullWidth && { width: '100%' }]}>
      <Image source={{ uri: image }} style={styles.projectImage} />
      <View style={styles.projectInfo}>
        <Text
          style={{
            fontWeight: '600',
            fontSize: 15 * fontScale,
            color: theme.text,
          }}
        >
          {title}
        </Text>
        <Text
          style={{ color: theme.muted, marginTop: 6, fontSize: 13 * fontScale }}
        >
          {desc}
        </Text>
        <TouchableOpacity
          onPress={onPress}
          style={[styles.projectBtn, { backgroundColor: theme.btnBg }]}
        >
          <Text style={{ color: theme.btnText }}>{btnText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- Themes ---
const themes = {
  light: {
    bg: '#F7F9FC',
    cardBg: '#FFFFFF',
    text: '#0f1724',
    muted: '#6b7280',
    divider: '#E6EEF6',
    primary: '#0ea5a4',
    badgeBg: '#eef9f9',
    btnBg: '#0ea5a4',
    btnText: '#ffffff',
  },
  dark: {
    bg: '#0b1220',
    cardBg: '#071122',
    text: '#E6EEF6',
    muted: '#94a3b8',
    divider: '#13212b',
    primary: '#7dd3fc',
    badgeBg: '#07202a',
    btnBg: '#7dd3fc',
    btnText: '#042027',
  },
};

// --- Styles ---
const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    padding: 16,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 14,
    marginRight: 12,
  },
  headerText: { flex: 1 },
  name: { fontWeight: '700' },
  role: { marginTop: 2 },
  about: { lineHeight: 18 },

  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },
  controlBlock: { alignItems: 'flex-start' },
  controlLabel: { fontSize: 12, marginBottom: 6 },
  langRow: { flexDirection: 'row', gap: 6 },
  langBtn: {
    borderWidth: 1,
    borderColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  fontBtn: {
    borderWidth: 1,
    borderColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  langText: { fontWeight: '600' },

  section: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  sectionBody: {},

  projectsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  projectCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 2 },
    }),
  },
  projectImage: { width: '100%', height: 110 },
  projectInfo: { padding: 10 },
  projectBtn: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },

  skillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },

  certCard: { padding: 12, borderRadius: 10, marginBottom: 10 },

  advancedBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  advancedBtnText: { fontWeight: '700' },

  hobbyRow: { flexDirection: 'row', justifyContent: 'space-between' },

  contactRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  socialBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
