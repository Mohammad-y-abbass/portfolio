import { useState } from "react";
import "./Projects.css";
import Card from "../card/Card";
import projects from "../../utils/projects";
import AOS from "aos";
import "aos/dist/aos.css";
AOS.init();
import { Modal } from "antd";
const Projects = () => {
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const showModal = (project) => {
    setOpen(true);
    setSelectedProject(project);
  };
  const closeModal = () => {
    setOpen(false);
  };

  return (
    <section id="4" className="p-sm-5 " data-aos="fade-right">
      <div className="container mb-5">
        <h1 className="text-center mb-5">Projects</h1>
        <div className="projects mx-auto d-block">
          <div className="cards">
            {projects.map((project) => (
              <Card
                name={project.name}
                image={project.image}
                description={project.description}
                demo={project.demo}
                code={project.code}
                key={project.id}
                tech={project.tech}
                event={() => showModal(project)}
              />
            ))}
          </div>
        </div>
      </div>
      <Modal
        open={open}
        onCancel={closeModal}
        footer={null}
        style={{ }}
      >
        {selectedProject && (
          <div>
            <h2>{selectedProject.name}</h2>
            <img
              src={selectedProject.image}
              alt={selectedProject.name}
              style={{ width: "100%", borderRadius: "4px", margin: "1rem 0" }}
            />
            <p style={{textAlign: 'justify'}}>{selectedProject.description}</p>

            <h4>Technologies used:</h4>
            <p>{selectedProject.tech}</p>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default Projects;
