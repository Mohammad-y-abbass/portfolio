"# Solar System

A 3D interactive solar system visualization built with Three.js and Vite.

## Description

This project renders a realistic solar system with the Sun, Mercury, Venus, Earth, Mars, and their respective moons. Each celestial body is textured with high-resolution images and orbits around the Sun at different speeds.

## Features

- Realistic planet textures from NASA
- Orbital mechanics with different speeds for each planet
- Moon systems for Earth (Moon) and Mars (Phobos and Deimos)
- Space background with cubemap for immersive experience
- Interactive camera controls with OrbitControls

## Technologies Used

- **Three.js** - JavaScript 3D library for creating and displaying animated 3D computer graphics
- **Vite** - Fast build tool and development server
- **JavaScript ES modules** - Modern JavaScript module system

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository or download the project files
2. Navigate to the project directory
3. Install dependencies:

   ```bash
   npm install
   ```

### Running the Project

To start the development server:

```bash
npm run dev
```

This will start a local development server. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

### Building for Production

To build the project for production:

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
solar-system/
├── index.html          # Main HTML file
├── main.js            # Main JavaScript file with Three.js logic
├── style.css          # CSS styles
├── package.json       # Project dependencies and scripts
├── public/
│   ├── textures/      # Planet texture images (2k resolution)
│   └── cubeMaps/      # Background cubemap images
└── README.md          # This file
```

## Controls

- **Mouse drag**: Orbit the camera around the solar system
- **Mouse wheel**: Zoom in and out
- **Right-click drag**: Pan the camera

## Celestial Bodies

- **Sun**: Central star with emissive material
- **Mercury**: Innermost planet, fastest orbit
- **Venus**: Second planet, rotates clockwise
- **Earth**: Third planet with the Moon
- **Mars**: Fourth planet with Phobos and Deimos

## Assets

Planet textures are sourced from NASA's planetary data. The background cubemap provides a realistic space environment.

## Development

The project uses Vite for fast development with hot module replacement. All Three.js code is contained in `main.js`, making it easy to understand and modify.

## License

This project is for educational purposes. Texture assets may have their own licensing terms."
