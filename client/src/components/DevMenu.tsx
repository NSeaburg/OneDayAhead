import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, RotateCcw, GraduationCap, BookOpen, MessagesSquare } from "lucide-react";

interface DevMenuProps {
  currentScreen: number;
  setCurrentScreen: (screen: number) => void;
  resetApp: () => void;
  setTeachingLevel?: (level: 'low' | 'medium' | 'high') => void;
  currentLevel?: 'low' | 'medium' | 'high';
}

export default function DevMenu({ 
  currentScreen, 
  setCurrentScreen, 
  resetApp,
  setTeachingLevel,
  currentLevel 
}: DevMenuProps) {
  const screens = [
    { id: 1, name: "Video Screen", icon: <BookOpen className="h-4 w-4 mr-2" /> },
    { id: 2, name: "Article Chat Screen", icon: <MessagesSquare className="h-4 w-4 mr-2" /> },
    { id: 3, name: "Assessment Bot (Reginald)", icon: <GraduationCap className="h-4 w-4 mr-2" /> },
    { id: 4, name: "Teaching Bot Screen", icon: <GraduationCap className="h-4 w-4 mr-2" /> },
    { id: 5, name: "Final Feedback Screen", icon: <MessagesSquare className="h-4 w-4 mr-2" /> },
  ];

  // Handle teaching bot level selection
  const handleTeachingLevelSelect = (level: 'low' | 'medium' | 'high') => {
    if (setTeachingLevel) {
      setTeachingLevel(level);
    }
    // Navigate to teaching bot screen
    setCurrentScreen(4);
  };

  const teachingLevels = [
    { id: 'low', name: "Mr. Whitaker (Low)", color: "bg-blue-50", activeColor: "text-blue-600" },
    { id: 'medium', name: "Mrs. Bannerman (Medium)", color: "bg-purple-50", activeColor: "text-purple-600" },
    { id: 'high', name: "Dr. Parton (High)", color: "bg-amber-50", activeColor: "text-amber-600" },
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
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Developer Navigation</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Main screens */}
          <DropdownMenuGroup>
            {screens.map((screen) => (
              screen.id !== 4 ? (
                <DropdownMenuItem
                  key={screen.id}
                  className={currentScreen === screen.id ? "bg-indigo-50 font-medium" : ""}
                  onClick={() => setCurrentScreen(screen.id)}
                >
                  {screen.icon}
                  {screen.name}
                  {currentScreen === screen.id && <span className="ml-1 text-indigo-600">•</span>}
                </DropdownMenuItem>
              ) : (
                // Submenu for teaching bots with different levels
                <DropdownMenuSub key={screen.id}>
                  <DropdownMenuSubTrigger className={currentScreen === screen.id ? "bg-indigo-50 font-medium" : ""}>
                    {screen.icon}
                    {screen.name}
                    {currentScreen === screen.id && <span className="ml-1 text-indigo-600">•</span>}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="w-56">
                      <DropdownMenuLabel>Teaching Level</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {teachingLevels.map((level) => (
                        <DropdownMenuItem
                          key={level.id}
                          className={currentLevel === level.id ? level.color + " font-medium" : ""}
                          onClick={() => handleTeachingLevelSelect(level.id as 'low' | 'medium' | 'high')}
                        >
                          {level.name}
                          {currentLevel === level.id && <span className={`ml-1 ${level.activeColor}`}>•</span>}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              )
            ))}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => window.location.href = '/teaching-bot'} className="text-green-600 hover:text-green-700 font-medium">
            <GraduationCap className="h-4 w-4 mr-2" />
            Teaching Bot Test Page
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={resetApp} className="text-red-600 hover:text-red-700 font-medium">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Application
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}