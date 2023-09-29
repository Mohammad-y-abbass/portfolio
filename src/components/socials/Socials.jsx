import React from "react";
import github from "../../assets/github.png";
import linkedin from "../../assets/linkedin.png";
import "./Socials.css";
const Socials = () => {
  return (
    <div className="socials">
      <a href="https://github.com/Mohammad-y-abbass" target="_blank">
        <img src={github} className="social-img" />
      </a>
      <a
        href="https://www.linkedin.com/in/mohammad-abbass-493457267/"
        target="_blank"
      >
        <img src={linkedin} className="social-img" />
      </a>
    </div>
  );
};

export default Socials;
