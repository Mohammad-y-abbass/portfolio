import React from "react";
import "./Skills.css";
import skills from "../../utils/skills";
import Scroll from "../Scroll/Scroll";
import AOS from "aos";
import "aos/dist/aos.css";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";


AOS.init();

const SkillsComponent = () => {


  return (
    <section className="container py-5" data-aos="fade-right" id="2">
      <h1 className="text-center mb-5">Skills</h1>
      <p className="text-center skills-text">
        Here are some of the skills I have been working on for the past year.
      </p>
      <div className="skill-con">
      <div className="skills d-flex justify-content-center align-items-center flex-wrap gap-5 mb-5">
        {skills.map((skill, index) => (
          <OverlayTrigger
            key={index}
            placement="top"
            overlay={<Tooltip id={`tooltip-${index}`}>{skill.name}</Tooltip>}
          >
            <div
              className="skill d-flex justify-content-center align-items-center p-2"
              key={index}
            >
              <img
                src={skill.img}
                alt={skill.name}
                className="img-fluid skill-img"
              />
            </div>
          </OverlayTrigger>
        ))}
      </div>
      </div>
    
    
    </section>
  );
};

export default SkillsComponent;
