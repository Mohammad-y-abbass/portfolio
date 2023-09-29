import React from 'react'
import NavigationBar from './components/Navbar/Navbar'
import './App.css'
import About from './components/About/About'
import Skills from './components/Skills/Skills'
import Experience from './components/Experience/Experience'
import 'aos/dist/aos.css'; // Import AOS styles
import Projects from './components/Projects/Projects'
import Contact from './components/contact/Contact'
import Socials from './components/socials/Socials'



const App = () => {



  return (
      <div>
        <NavigationBar />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
        <Socials/>
      </div>
  );
}

export default App