function Tag({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-foreground/10 hover:border-foreground/15 mx-auto flex w-max cursor-pointer items-center gap-2.5 rounded-full border py-1 px-2 backdrop-blur-lg select-none">
      <div className="bg-primary/40 relative flex h-3.5 w-3.5 items-center justify-center rounded-full">
        <div className="bg-primary/60 flex h-2.5 w-2.5 animate-ping items-center justify-center rounded-full">
          <div className="bg-primary/60 flex h-2.5 w-2.5 animate-ping items-center justify-center rounded-full"></div>
        </div>

        <div className="bg-primary absolute top-1/2 left-1/2 flex h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"></div>
      </div>
      {children}
    </div>
  );
}

export default Tag;
