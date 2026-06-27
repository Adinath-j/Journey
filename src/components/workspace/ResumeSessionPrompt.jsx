import { BookOpen, Play, Trash2 } from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "motion/react";

export function ResumeSessionPrompt() {
  const { promptResume, topic, acceptResume, discardSession } = useSessionStore();

  if (!promptResume || !topic) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm grid place-items-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
        >
          <GlassCard className="p-8 max-w-md w-full border-violet-500/20 bg-gradient-to-br from-slate-900 to-[#0b1120] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
            
            <div className="mx-auto w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="size-6 text-violet-400" />
            </div>
            
            <h2 className="text-xl font-medium text-white mb-2">Unfinished Session Found</h2>
            <p className="text-sm text-slate-400 mb-8">
              You were studying <strong>{topic.title}</strong> before the app was closed. Would you like to resume where you left off?
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button 
                variant="ghost" 
                onClick={discardSession}
                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 px-6"
              >
                <Trash2 className="size-4 mr-2" /> Discard
              </Button>
              <Button 
                onClick={acceptResume}
                className="bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20 px-6"
              >
                <Play className="size-4 mr-2 fill-current" /> Resume Session
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
