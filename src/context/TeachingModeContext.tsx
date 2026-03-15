import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TeachingModeContextType {
    isTeachingMode: boolean;
    toggleTeachingMode: () => void;
}

const TeachingModeContext = createContext<TeachingModeContextType>({
    isTeachingMode: false,
    toggleTeachingMode: () => { },
});

export const useTeachingMode = () => useContext(TeachingModeContext);

export const TeachingModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isTeachingMode, setIsTeachingMode] = useState(false);
    const toggleTeachingMode = () => setIsTeachingMode(prev => !prev);

    return (
        <TeachingModeContext.Provider value={{ isTeachingMode, toggleTeachingMode }}>
            {children}
        </TeachingModeContext.Provider>
    );
};
