import AppImage from "@/assets/images/about-img.png";
import Section from "@/components/globals/section";

function Interface() {
  return (
    <Section className="from-background to-primary bg-gradient-to-b">
      <Section.Header className="max-w-xl">
        <Section.Title>Intuitive interface</Section.Title>
        <Section.Description>
          Feel the joy of accomplishment with an app designed to track your
          progress and motivate your efforts
        </Section.Description>
      </Section.Header>

      <Section.Body className="mx-auto">
        <img src={AppImage} alt="Task mint's dashboard image" />
      </Section.Body>
    </Section>
  );
}

export default Interface;
