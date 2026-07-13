import Section from "@/components/globals/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SubscribeNewsLetter() {
  return (
    <Section>
      <Section.Header>
        <Section.Title>Get instant access</Section.Title>
        <Section.Description>
          Celebrate the joy of accomplishment with an app designed to track your
          progress and motivate your efforts.
        </Section.Description>
      </Section.Header>

      <Section.Body>
        <div className="relative mx-auto max-w-md">
          <Input
            placeholder="yourname@email.com"
            type="email"
            required
            className="h-12 rounded-full pl-4"
          />
          <Button
            size="lg"
            className="absolute top-1/2 right-0.5 -translate-y-1/2"
          >
            Subscribe
          </Button>
        </div>
      </Section.Body>
    </Section>
  );
}

export default SubscribeNewsLetter;
