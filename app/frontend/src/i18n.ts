import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
    .use(initReactI18next)
    .init({
        fallbackLng: "sk",
        lng: "sk",
        interpolation: {
            escapeValue: false,
        },
        resources: {
            sk: {
                translation: {
                    time: '',
                    track: '',
                    bell: '',
                    bell_descr: '',
                    lesson_detail: '',
                    
                    title: "Multi-language app",
                    label: "Select another language!",
                    about: "About",
                    home: "Domov",
                },
            },
            cz: {
                translation: {
                    title: "Aplicación en varios idiomas",
                    label: "Selecciona otro lenguaje!",
                    about: "Sobre mí",
                    home: "Inicio",
                },
            },
            pl: {
                translation: {
                    title: "Applicazione multilingue",
                    label: "Selezionare un'altra lingua ",
                    about: "Su di me",
                    home: "Casa",
                },
            },
            hu: {
                translation: {
                    title: "Applicazione multilingue",
                    label: "Selezionare un'altra lingua ",
                    about: "Su di me",
                    home: "Casa",
                },
            },
        },
    });

export default i18n;