import React from "react";
import { Type, ImageIcon, Undo, Redo } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DesignToolbar({ activeTool, onToolSelect }) {
  const tools = [
    { id: "text", name: "Add Text", icon: Type },
    { id: "image", name: "Upload Logo", icon: ImageIcon },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Design Tools</h3>

      <div className="flex gap-2">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={activeTool === tool.id ? "default" : "outline"}
            size="sm"
            onClick={() => onToolSelect(activeTool === tool.id ? null : tool.id)}
            className={`flex-1 ${
              activeTool === tool.id
                ? "bg-[var(--accent)] hover:bg-[var(--primary)]"
                : ""
            }`}
          >
            <tool.icon className="w-4 h-4 mr-2" />
            {tool.name}
          </Button>
        ))}
      </div>

      {/* Undo/Redo - placeholder for future implementation */}
      <div className="flex gap-2 pt-2 border-t">
        <Button variant="ghost" size="sm" disabled className="flex-1">
          <Undo className="w-4 h-4 mr-1" />
          Undo
        </Button>
        <Button variant="ghost" size="sm" disabled className="flex-1">
          <Redo className="w-4 h-4 mr-1" />
          Redo
        </Button>
      </div>
    </div>
  );
}
