import { motion } from "motion/react";

function Loading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-8 bg-background">
      {/* loader */}
      <div className="grid h-16 w-16 grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="rounded-md bg-primary"
            initial={{ opacity: 0.2, scale: 0.8 }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1, 0.8],
              rotate: [0, 90, 180],
              borderRadius: ["20%", "50%", "20%"],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: index * 0.2,
            }}
          />
        ))}
      </div>

      {/* text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm font-medium text-muted-foreground animate-pulse"
      >
        Initializing workspace...
      </motion.p>
    </div>
  );
}

export default Loading;
