import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, RotateCcw } from "lucide-react";

interface DevMenuProps {
  currentScreen: number;
  setCurrentScreen: (screen: number) => void;
  resetApp: () => void;
}

export default function DevMenu({ currentScreen, setCurrentScreen, resetApp }: DevMenuProps) {
  const screens = [
    { id: 1, name: "Video Screen" },
    { id: 2, name: "Article Chat Screen" },
    { id: 3, name: "Assessment Bot (Reginald)" },
    { id: 4, name: "Teaching Bot (Low/Medium/High)" },
    { id: 5, name: "Final Feedback Screen" },
  ];

  return (
    <div className="fixed top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-md h-9 bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700 shadow-md"
          >
            <Settings className="h-4 w-4 mr-1" />
            <span>Dev Menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Developer Navigation</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {screens.map((screen) => (
            <DropdownMenuItem
              key={screen.id}
              className={currentScreen === screen.id ? "bg-indigo-50 font-medium" : ""}
              onClick={() => setCurrentScreen(screen.id)}
            >
              {screen.name}
              {currentScreen === screen.id && <span className="ml-1 text-indigo-600">•</span>}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={resetApp} className="text-red-600 hover:text-red-700 font-medium">
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset Application
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}