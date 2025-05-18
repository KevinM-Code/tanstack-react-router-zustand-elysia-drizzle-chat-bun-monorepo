import React, { createContext, useReducer, useContext } from 'react';



//Create the context
const defaultValue = {}
const UserNameContext = createContext(defaultValue);

// Create the reducer function
export const userNameReducer = (state, action) => {
    
    switch (action.type) {
        case 'SET_NAME':
            return { name: action.payload };
        default:
            return state;
    }
};

// Create the context provider component
export const UserNameProvider = ({ children }) => {
   
    const [state, dispatch] = useReducer(userNameReducer, { name: null });

    return (      
        <UserNameContext.Provider value={{ state, dispatch }}>
            { children }
        </UserNameContext.Provider>
    );
};

// Custom hook to access the context
export const useUserName = () => {
    
    const context = useContext(UserNameContext);
    if (context === undefined) {
        throw new Error('useUserName must be used within a UserNameProvider');
    }
    return context;
};