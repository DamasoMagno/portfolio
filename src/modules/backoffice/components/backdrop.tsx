export function BackofficeBackdrop() {
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0">
    <div className="absolute inset-0 [background-image:radial-gradient(#a8a8b3_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07]" />
    <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
    <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[80px]" />
  </div>;
}
