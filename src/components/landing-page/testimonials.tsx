import Marquee from "react-fast-marquee";
import Section from "@/components/globals/section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { testimonialData } from "@/data/testimonials";

function Testimonial() {
  return (
    <Section className="from-primary to-background bg-gradient-to-b px-0 md:max-w-none md:px-0">
      <Section.Header>
        <Section.Title>Testimonials</Section.Title>
        <Section.Description>See what people say about us!</Section.Description>
      </Section.Header>

      <Section.Body className="md:max-w-none">
        <Marquee
          speed={50}
          gradient={false}
          pauseOnHover={true}
          className="inline-flex"
        >
          {testimonialData.map((testimonial, idx) => (
            <Card key={idx} className="bg-card/30 mx-2 max-w-sm">
              <CardContent>{testimonial.content}</CardContent>

              <CardFooter className="gap-2">
                <Avatar>
                  <AvatarImage src={testimonial.image} />
                  <AvatarFallback className="uppercase">
                    {testimonial.name
                      .split(" ")
                      .map((n) => (n ? n.at(0) : ""))
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="-space-y-1">
                  <h2 className="font-medium">{testimonial.name}</h2>
                  <p className="text-sm">{testimonial.username}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </Marquee>
      </Section.Body>
    </Section>
  );
}

export default Testimonial;
