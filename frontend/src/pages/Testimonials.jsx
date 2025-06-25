import React from "react";
import ImprovedFooter from "../components/common/ImprovedFooter";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Web Developer",
      company: "TechCorp Solutions",
      image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Priya",
      content: "The courses at Beeja Academy transformed my career. The practical approach and industry-relevant curriculum helped me land my dream job as a web developer. The instructors are highly knowledgeable and supportive.",
    },
    {
      name: "Rahul Patel",
      role: "Data Scientist",
      company: "DataMinds Analytics",
      image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Rahul",
      content: "I completed the Data Science track, and it exceeded my expectations. The hands-on projects and real-world datasets gave me practical experience that I use daily in my work. The community support was invaluable.",
    },
    {
      name: "Ananya Kumar",
      role: "UI/UX Designer",
      company: "Creative Solutions",
      image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Ananya",
      content: "The design courses here are exceptional. They cover both theoretical principles and practical applications. The feedback from industry experts helped me improve my portfolio significantly.",
    },
    {
      name: "Mohammed Ali",
      role: "Cloud Engineer",
      company: "CloudTech Systems",
      image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Mohammed",
      content: "The cloud computing certification program was comprehensive and up-to-date with industry standards. The labs and practical exercises prepared me well for real-world scenarios.",
    },
    {
      name: "Sarah Wilson",
      role: "Full Stack Developer",
      company: "InnovateTech",
      image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Sarah",
      content: "The full stack development bootcamp was intense but incredibly rewarding. The curriculum covered all modern technologies, and the project-based learning approach was very effective.",
    },
    {
      name: "Raj Malhotra",
      role: "DevOps Engineer",
      company: "AgileOps Solutions",
      image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Raj",
      content: "The DevOps course helped me understand the complete CI/CD pipeline. The instructors shared valuable insights from their industry experience, which was incredibly helpful.",
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-richblack-900">
      <div className="w-11/12 max-w-maxContent mx-auto py-12 text-richblack-5">
        <h1 className="text-3xl font-bold mb-6">Student Success Stories</h1>
        
        <div className="space-y-6">
          <section className="space-y-4">
            <p className="text-richblack-100">
              Discover how Beeja Academy has helped students transform their careers and achieve their goals. 
              These testimonials reflect the real experiences of our learners.
            </p>
          </section>

          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-richblack-800 p-6 rounded-lg flex flex-col">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-richblack-50">{testimonial.name}</h3>
                    <p className="text-sm text-richblack-300">{testimonial.role}</p>
                    <p className="text-sm text-richblack-300">{testimonial.company}</p>
                  </div>
                </div>
                <p className="text-richblack-100 flex-grow">{testimonial.content}</p>
              </div>
            ))}
          </section>

          <section className="space-y-4 mt-8">
            <h2 className="text-2xl font-semibold text-richblack-50">Join Our Success Stories</h2>
            <p className="text-richblack-100">
              Start your learning journey with us today and become part of our growing community of successful graduates. 
              Our comprehensive courses, expert instructors, and supportive learning environment will help you achieve your career goals.
            </p>
          </section>
        </div>
      </div>
      <ImprovedFooter />
    </div>
  );
};

export default Testimonials;
