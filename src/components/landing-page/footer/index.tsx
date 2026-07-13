import SubscribeNewsLetter from "@/components/landing-page/footer/news-letter";
import { Separator } from "@/components/ui/separator";
import { socialNavs } from "@/constants/socials";

function Footer() {
  return (
    <footer>
      <SubscribeNewsLetter />
      <Separator />

      <div className="my-6 grid grid-cols-1 place-items-center px-4 md:grid-cols-3 md:px-8">
        <p className="font-heading text-muted-foreground mr-auto text-sm font-medium">
          © {new Date()?.getFullYear()} Taskmint, Inc. All rights reserved
        </p>

        <h3 className="font-light font-mono">
          Built by{" "}
          <a
            className="text-primary"
            href="https://github.com/justinedoc"
            target="_blank"
            rel="noopener"
          >
            @justinedoc
          </a>
        </h3>

        <ul className="ml-auto flex items-center gap-3">
          {socialNavs.map((socialNav) => (
            <li key={socialNav.name}>
              <a href={socialNav.url}>{<socialNav.icon />}</a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
