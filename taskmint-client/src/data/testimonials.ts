import testimonialImg1 from "@/assets/images/testimonial_1.png";
import testimonialImg2 from "@/assets/images/testimonial_2.png";
import testimonialImg3 from "@/assets/images/testimonial_3.png";
import testimonialImg4 from "@/assets/images/testimonial_4.png";
import testimonialImg5 from "@/assets/images/testimonial_5.png";
import testimonialImg6 from "@/assets/images/testimonial_6.png";

interface TestimonialsType {
  image: string;
  name: string;
  content: string;
  username: string;
}

export const testimonialData: TestimonialsType[] = [
  {
    image: testimonialImg1,
    name: "Emma Johnson",
    username: "@emmaj",
    content:
      "Taskmint has completely streamlined my daily workflow. I feel more productive than ever!",
  },
  {
    image: testimonialImg2,
    name: "Liam Carter",
    username: "@liamc",
    content:
      "With Taskmint, I never miss a deadline. The intuitive design and powerful features keep me on track effortlessly.",
  },
  {
    image: testimonialImg3,
    name: "Sophia Brown",
    username: "@sophiebrownie",
    content:
      "The team collaboration tools in Taskmint have made project management a breeze for our company.",
  },
  {
    image: testimonialImg4,
    name: "Noah Davis",
    username: "@noahd",
    content:
      "I’ve tried other tools, but none compare to the simplicity and efficiency of Taskmint. Highly recommended!",
  },
  {
    image: testimonialImg5,
    name: "Olivia Taylor",
    username: "@oliviat",
    content:
      "Taskmint's ability to integrate with my favorite tools has been a game-changer for productivity.",
  },
  {
    image: testimonialImg6,
    name: "James Wilson",
    username: "@jamesw",
    content:
      "From personal tasks to team projects, Taskmint keeps everything organized and easy to manage.",
  },
];
