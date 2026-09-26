# Sistema Experto de Diagnóstico de Suspensión (Mazda)

Sistema experto que diagnostica fallas comunes en el sistema de suspensión de vehículos Mazda mediante un motor de inferencia basado en reglas lógicas. El usuario responde preguntas de tipo Sí/No y el sistema deduce la falla probable siguiendo encadenamiento hacia adelante (forward chaining).
Construido en HTML, CSS y JavaScript puro, sin frameworks ni dependencias externas.

## Características

- 🔧 Motor de inferencia con **forward chaining** sobre una base de reglas lógicas (∧, ∨).
- 🌳 Diagnóstico guiado por árbol de decisión para bujes, amortiguadores, fugas y rótulas.
- 📋 Visualización de las reglas lógicas implementadas y sus equivalencias (p → q, silogismos, etc.).
- 🧾 Trazabilidad: muestra las reglas activadas y las condiciones deducidas en cada diagnóstico.
- 🌗 Modo claro / oscuro.
- 💻 100% frontend, sin backend ni dependencias externas.

## Uso del Sistema

Abre `index.html` en el navegador y presiona "Comenzar Diagnóstico". Responde las preguntas de Sí/No; el sistema irá aplicando las reglas lógicas hasta llegar a un diagnóstico o indicar que no se detectó falla. Puedes consultar la base de reglas en la sección "Ver Reglas del Sistema".

## Estructura del proyecto

```
.
├── index.html          # Estructura principal y plantillas de la interfaz
├── css/
│   └── styles.css      # Estilos y temas (claro/oscuro)
├── js/
│   └── script.js       # Motor de inferencia y lógica del diagnóstico
├── assets/
│   ├── icons/           # Favicon e iconos
│   └── imgs/            # Diagrama del árbol de decisión
└── README.md
```
