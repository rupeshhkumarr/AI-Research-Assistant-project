import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { AppRouter } from './routes/AppRouter';
import { ToastContainer } from './components/common/ToastContainer';

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <ChatProvider>
            <BrowserRouter>
              <AppRouter />
              <ToastContainer />
            </BrowserRouter>
          </ChatProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
