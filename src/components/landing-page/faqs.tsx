import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import Section from "@/components/globals/section";
import { type FaqsType, faqs } from "@/constants/faqs";
import { cn } from "@/lib/utils";

function Faqs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <Section className="from-primary to-background bg-linear-to-b">
      <Section.Header>
        <Section.Title>
          Frequently asked <br /> questions
        </Section.Title>
      </Section.Header>

      <Section.Body className="flex flex-col items-center">
        {faqs.map((faq, index) => (
          <FaqAccordion
            key={faq.question}
            faq={faq}
            isOpen={openIndex === index}
            onClick={() => handleClick(index)}
          />
        ))}
      </Section.Body>
    </Section>
  );
}

function FaqAccordion({
  faq,
  isOpen,
  onClick,
}: {
  faq: FaqsType;
  isOpen: boolean;
  onClick: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  return (
    <div className={cn("max-w-xl divide-y transition-all duration-600")}>
      <button
        type="button"
        className="flex w-full items-center justify-between py-5 text-left"
        onClick={onClick}
      >
        <h3 className="text-lg font-medium">{faq.question}</h3>
        <span
          className={cn("transform transition-transform duration-300", {
            "rotate-45": isOpen,
          })}
        >
          <Plus />
        </span>
      </button>
      <div
        ref={contentRef}
        className={`overflow-hidden transition-[height] duration-500`}
        style={{
          height: isOpen ? `${contentRef.current?.scrollHeight}px` : "0px",
        }}
      >
        <p className="text-muted-foreground py-2 font-mono">{faq.answer}</p>
      </div>
    </div>
  );
}

export default Faqs;
