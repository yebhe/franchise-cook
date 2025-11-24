import React, { createContext, useEffect, useState } from 'react'

export const ThemeContext = createContext()

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("light")

    const hanldeTheme = ()=> {
        theme === 'light' ? setTheme('dark') : setTheme('light')
    }

    useEffect(()=>{
        document.body.className = theme
    },[theme])


  return (
    <ThemeContext.Provider value={{ theme, hanldeTheme}}>
        { children }
    </ThemeContext.Provider>
  )
}

export default ThemeProvider

