import React from "react";
import "./Scroll.css";

const Scroll = ({ id }) => {
  // Function to scroll to the specified section
  const scrollToSection = () => {
    const targetSection = document.getElementById(id);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a href={`#${id}`} onClick={scrollToSection} >
      <button className="btn d-block mx-auto" id="scrollButton">
        <div className="scroll"> </div>
      </button>
    </a>
  );
};

export default Scroll;
