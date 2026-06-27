import { useState } from "react";
import { X, Download, Monitor, Moon, Sun, Type, Command, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useThemeStore } from "@/store/useThemeStore";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { useLogStore } from "@/store/useLogStore";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

export function SettingsModal({ isOpen, onClose }) {
  const { theme, setTheme, accentColor, setAccentColor } = useThemeStore();
  const { nodes } = useRoadmapStore();
  const { logs } = useLogStore();

  if (!isOpen) return null;

  const handleExportJSON = () => {
    try {
      const data = JSON.stringify({ roadmap: nodes, logs }, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `journey_export_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Workspace exported successfully!");
    } catch (error) {
      toast.error("Failed to export workspace");
    }
  };

  const handleExportMarkdown = () => {
    try {
      let md = "# My Learning Journey\n\n## Roadmap\n";
      nodes.forEach(n => {
        md += `- [${n.status === "complete" ? "x" : " "}] **${n.title}** (${n.status})\n`;
      });
      md += "\n## Study Logs\n";
      logs.forEach(l => {
        md += `### ${l.title} - ${new Date(l.date).toLocaleDateString()}\n`;
        md += `- Duration: ${l.durationMinutes}m\n`;
        if (l.notes) md += `- Notes: ${l.notes}\n`;
      });

      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `journey_export_${new Date().toISOString().split("T")[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Markdown exported successfully!");
    } catch (error) {
      toast.error("Failed to export Markdown");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0f1524] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#141b2d]">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* Theme Section */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Monitor className="size-4" /> Appearance
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "dark", label: "Dark", icon: Moon, bg: "bg-[#020612]" },
                { id: "midnight", label: "Midnight", icon: Moon, bg: "bg-black" },
                { id: "light", label: "Light", icon: Sun, bg: "bg-slate-100 text-slate-900" },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border transition-all",
                    theme === t.id ? "border-violet-500 bg-violet-500/10" : "border-white/5 hover:border-white/20 bg-white/5"
                  )}
                >
                  <div className={cn("size-10 rounded-full flex items-center justify-center shadow-inner", t.bg)}>
                    <t.icon className={cn("size-5", t.id === "light" ? "text-slate-900" : "text-white")} />
                  </div>
                  <span className={cn("text-sm font-medium", theme === t.id ? "text-violet-300" : "text-slate-400")}>{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Accent Color Section */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Type className="size-4" /> Accent Color
            </h3>
            <div className="flex items-center gap-3">
              {[
                { id: "violet", hex: "#8b5cf6" },
                { id: "emerald", hex: "#10b981" },
                { id: "blue", hex: "#3b82f6" },
                { id: "rose", hex: "#f43f5e" },
                { id: "amber", hex: "#f59e0b" },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setAccentColor(c.id)}
                  className={cn(
                    "size-10 rounded-full transition-all ring-offset-2 ring-offset-[#0f1524]",
                    accentColor === c.id ? "ring-2 scale-110" : "hover:scale-105 opacity-80 hover:opacity-100"
                  )}
                  style={{ backgroundColor: c.hex, ringColor: c.hex }}
                />
              ))}
            </div>
          </section>

          {/* Export Section */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Download className="size-4" /> Export Data
            </h3>
            <div className="flex items-center gap-4">
              <Button variant="glass" onClick={handleExportJSON} className="flex-1 justify-center gap-2">
                <Download className="size-4" /> Backup JSON
              </Button>
              <Button variant="glass" onClick={handleExportMarkdown} className="flex-1 justify-center gap-2">
                <Download className="size-4" /> Export Markdown
              </Button>
            </div>
          </section>

          {/* Shortcuts Section */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Command className="size-4" /> Keyboard Shortcuts
            </h3>
            <div className="bg-black/20 rounded-xl border border-white/5 divide-y divide-white/5">
              {[
                { label: "Command Palette", keys: ["Ctrl", "K"] },
                { label: "Toggle Focus Mode", keys: ["F"] },
                { label: "New Study Log", keys: ["L"] },
                { label: "Close Overlays", keys: ["Esc"] },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3">
                  <span className="text-sm text-slate-300">{s.label}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k, j) => (
                      <span key={j} className="px-2 py-1 bg-white/10 text-slate-300 text-xs rounded border border-white/10 shadow-sm">{k}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
