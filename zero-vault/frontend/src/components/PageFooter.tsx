interface PageFooterProps {
  label: string;
}

export function PageFooter({ label }: PageFooterProps) {
  return (
    <footer className="page-footer">
      <span>© {new Date().getFullYear()} ZeroDawn</span>
      <span>
        <span className="footer-live-dot" />
        {label}
      </span>
      <span>ZERO VAULT · PRIVATE BY DESIGN</span>
    </footer>
  );
}
