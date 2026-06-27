import { useState } from "react";
import { X, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useRoadmapStore } from "@/store/useRoadmapStore";

export function ImportModal({ isOpen, onClose }) {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const { importRoadmap, isLoading } = useRoadmapStore();

  const handleValidate = () => {
    try {
      const data = JSON.parse(jsonText);
      if (!Array.isArray(data)) {
        throw new Error("JSON must be an array of roadmap nodes.");
      }
      setParsedData(data);
      setIsValid(true);
      setError(null);
    } catch (err) {
      setError(err.message);
      setIsValid(false);
      setParsedData(null);
    }
  };

  const handleImport = async () => {
    if (!isValid || !parsedData) return;
    try {
      await importRoadmap(parsedData);
      onClose();
      setJsonText("");
      setIsValid(false);
      setParsedData(null);
    } catch (err) {
      setError("Import failed: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm grid place-items-center p-4">
      <GlassCard className="p-6 max-w-2xl w-full flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Upload className="size-5 text-violet-400" />
            Import Roadmap
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <p className="text-sm text-slate-400 mb-4">
          Paste your JSON roadmap structure below. It should be an array of node objects with optional nested <code className="bg-white/10 px-1 rounded">children</code> arrays.
        </p>

        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setIsValid(false);
            setError(null);
          }}
          className="w-full flex-1 min-h-[300px] bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm text-slate-300 outline-none focus:border-violet-500/50 resize-none custom-scrollbar mb-4"
          placeholder='[\n  {\n    "title": "Data Structures",\n    "estimatedHours": 10,\n    "children": [\n      { "title": "Arrays" }\n    ]\n  }\n]'
        />

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <AlertTriangle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {isValid && parsedData && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm mb-4 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="size-4 shrink-0" />
            JSON is valid! Ready to import {parsedData.length} root topics.
          </div>
        )}

        <div className="flex justify-end gap-3 mt-auto">
          <Button variant="ghost" onClick={onClose} className="hover:bg-white/5">
            Cancel
          </Button>
          {!isValid ? (
            <Button onClick={handleValidate} className="bg-white/10 hover:bg-white/20">
              Validate JSON
            </Button>
          ) : (
            <Button 
              onClick={handleImport} 
              disabled={isLoading}
              className="bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20"
            >
              {isLoading ? "Importing..." : "Import Now"}
            </Button>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
