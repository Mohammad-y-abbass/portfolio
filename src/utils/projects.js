import face from "../assets/th.jpeg";
import data from "../assets/CountriesData.png";
import bigData from "../assets/bigData.png";
import workoutBuddy from "../assets/workout-buddy.png";

const projects = [
  {
    name: "Facial Expression Recognition",
    id: 1,
    description:
      "Designed and developed a web application using JavaScript that harnesses the power of the FaceJS API to predict and display facial expressions in real time. This innovative project combines computer vision and web technology to offer users a dynamic and interactive experience.",
    tech: "JavaScript, FaceJS API",
    image: face,
    demo: "https://facial-expression-recognition.netlify.app/",
    code: "https://github.com/Mohammad-y-abbass/face-detection",
  },
  {
    name: "Countries Data",
    id: 2,
    description:
      "Developed a dynamic web application using React.js to create an engaging dashboard for exploring comprehensive country data. Leveraged the Rest Country API to source real-time country information, which was elegantly presented in a Bootstrap-powered data table. Implemented a robust search feature to facilitate efficient data discovery.",
    tech: "Reactjs, bootstrap data table, Rest Country API",
    image: data,
    demo: "https://countries-data-react.netlify.app/",
    code: "https://github.com/Mohammad-y-abbass/Countries-Data",
  },
  {
    name: "Big Data Specialist",
    id: 3,
    description:
      "Developed a captivating static website using React.js to showcase and promote the Big Data Specialist community. This website serves as a visually engaging and informative platform designed to pique the interest of potential members and provide essential details about the community's mission, goals, and activities.",
    tech: "Reactjs, bootstrap",
    image: bigData,
    demo: "https://big-data-specialist.netlify.app/",
    code: "https://github.com/Mohammad-y-abbass/big-data-specialist",
  },
  {
    name: "Workout Buddy",
    id: 4,
    description:
      "Developed a MERN stack web application enabling users to create, edit, and delete custom workout routines. Simplified fitness management for users, enhancing their workout tracking and progress monitoring.",
    tech: "Reactjs, nodejs, expressjs, mongodb",
    code: "https://github.com/Mohammad-y-abbass/Workout-Buddy",
    image: workoutBuddy,
    demo: "https://workout-buddy-it1h.onrender.com/",
  },
];
export default projects;
