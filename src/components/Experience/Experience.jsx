import React from "react";
import "./Experience.css";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS CSS
AOS.init();

const Experience = () => {
  return (
    <section className="container py-5" data-aos="fade-right" id="3">
      <h1 className="text-center mb-5">Experience</h1>
      <div className="experience p-md-5 p-3 mb-5">
        <h2 className="exp-title">Internship, Bracket Technologies</h2>
        <h2 className="exp-title">Web Developer</h2>
        <p className="date"> June 2023-August 2023</p>
        
        <h4 className="exp-title">Key Responsibilities:</h4>
        <ul>
          <li>
            Worked on a flight and hotel booking platform using bracket
            programming language.
          </li>
          <li>
            Developed and implement an Agent Registration Form, allowing the
            addition of travel agents. This involved creating user-friendly
            input fields, data validation, and database.
          </li>
          <li>
            Designed and developed a powerful search engine with advanced
            filtering options to facilitate efficient agent discovery. Users
            could search for agents based on various criteria such as location,
            specialty, and user ratings.
          </li>
          <li>
            Designed and coded a responsive table to display search results,
            ensuring a clean and intuitive user interface.
          </li>
        </ul>
        <h4 className="exp-title">Learning Outcome:</h4>
        <ul>
          <li>
            Enhanced problem-solving skills through debugging and
            troubleshooting complex issues.
          </li>
          <li>
            Gained insights into the travel and hospitality industry,
            particularly in the context of online booking systems.
          </li>
          <li>Developed a strong understanding of web design principles.</li>
          <li>
            Enhanced teamwork and communication skills through collaboration
            with cross-functional teams.
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Experience;
