import React, { createContext, useState, useEffect, useContext } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Read saved theme from localStorage, default to 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('localhire-theme') || 'light';
  });

  // Whenever theme changes, apply/remove 'dark' class on <html> and save to localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('localhire-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Convenience hook
export const useTheme = () => useContext(ThemeContext);
