// Toggle light and dark mode
export const toggle_dark_and_light_mode = (theme, setTheme) => {
    setTheme(theme);
    localStorage.setItem("theme", theme);
    return `The mode has been successfully updated to ${theme} mode`;
};