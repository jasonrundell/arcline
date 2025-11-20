export default function Footer() {
  return (
    <footer className="w-full border-t border-arc-gray/30 bg-arc-black/90 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-arc-gray">
          <p className="mb-2">ARC Line - ARC Raiders Multi-Hotline System</p>
          <p className="text-xs">
            Built for the{" "}
            <a
              href="https://codetv.dev/blog/web-dev-challenge-hackathon-s2e11-code-powered-phone-hotline"
              target="_blank"
              rel="noopener noreferrer"
              className="text-arc-cyan hover:text-arc-sand transition-colors"
            >
              Twilio Web Dev Challenge
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
