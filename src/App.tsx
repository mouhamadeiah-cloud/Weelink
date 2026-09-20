import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { TranslucentCloud } from './components/TranslucentCloud';
import { CloudButton } from './components/CloudButton';
import { RegisterPage } from './components/RegisterPage';
import { WorkshopPage } from './components/WorkshopPage';
import { AppPage, UserRegistrationData } from './types';
import { TextEditProvider } from './context/TextEditContext';
import { testFirestoreConnection } from './lib/firebase';
import { loadUserRegistrationFromFirestore, saveUserRegistrationToFirestore } from './lib/firestoreService';

// Professional smooth fade-in / fade-out page variants without CSS transforms (prevents breaking position: sticky)
const pageTransitionVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [registeredUser, setRegisteredUser] = useState<UserRegistrationData | null>(null);
  const [workshopControls, setWorkshopControls] = useState<{
    viewport: 'desktop' | 'tablet' | 'mobile';
    setViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
    isCloudSaving: boolean;
    lastCloudSavedAt: Date | null;
    handleSaveToCloud: () => Promise<void> | void;
  } | null>(null);

  useEffect(() => {
    // Validate connection to Firestore on boot
    testFirestoreConnection();

    // Check if there is an existing registered user in Firestore
    loadUserRegistrationFromFirestore()
      .then((user) => {
        if (user) {
          setRegisteredUser(user);
        }
      })
      .catch((err) => {
        console.warn('Initial registration load notice:', err);
      });
  }, []);

  const handleNavigateToRegister = () => {
    setCurrentPage('register');
  };

  const handleRegistrationComplete = (data: UserRegistrationData) => {
    setRegisteredUser(data);
    saveUserRegistrationToFirestore(data);
  };

  return (
    <TextEditProvider>
      <main
        id="weelink-app-root"
        dir="rtl"
        className="w-full min-h-screen bg-[#050b18] text-white flex flex-col relative font-['Cairo',sans-serif]"
      >
        {/* Top Navbar */}
        <Navbar currentPage={currentPage} onNavigate={setCurrentPage} workshopControls={workshopControls} />

        {/* Pages View with Framer Motion transitions */}
        <div className="flex-1 flex flex-col relative w-full">
          <AnimatePresence mode="wait">
            {currentPage === 'home' && (
              <motion.div
                key="home"
                id="home-page-container"
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col w-full max-w-7xl mx-auto"
              >
                <section
                  id="home-landing-section"
                  className="flex-1 flex flex-col items-center justify-center relative min-h-[calc(100vh-80px)] px-4"
                >
                  {/* Light, almost transparent orange cloud in the background */}
                  <TranslucentCloud />

                  {/* Center interactive Dark Orange Cloud Button */}
                  <div className="relative z-20 flex flex-col items-center justify-center">
                    <CloudButton onClick={handleNavigateToRegister} />
                  </div>
                </section>
              </motion.div>
            )}

            {currentPage === 'register' && (
              <motion.div
                key="register"
                id="register-page-container"
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col w-full max-w-7xl mx-auto"
              >
                <RegisterPage
                  onNavigate={setCurrentPage}
                  onRegistrationSuccess={handleRegistrationComplete}
                />
              </motion.div>
            )}

            {currentPage === 'workshop' && (
              <motion.div
                key="workshop"
                id="workshop-page-container"
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ transform: 'none' }}
                className="flex-1 flex flex-col w-full"
              >
                <WorkshopPage
                  onNavigate={setCurrentPage}
                  userData={registeredUser || undefined}
                  onRegisterControls={setWorkshopControls}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </TextEditProvider>
  );
}
