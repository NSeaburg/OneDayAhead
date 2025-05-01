import React, { useState } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { 
  ChevronDown, 
  Bug, 
  Users, 
  Book, 
  Award, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';

export default function DevNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, navigate] = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="fixed top-0 right-0 z-50">
      <button
        onClick={toggleMenu}
        className="flex items-center gap-1 bg-black/80 text-white px-3 py-1.5 rounded-bl-md hover:bg-black/90 transition-colors"
      >
        <Bug className="h-4 w-4" />
        <span className="text-xs font-medium">Dev</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="bg-white shadow-lg border border-gray-200 rounded-bl-lg rounded-tl-lg p-3 w-64 absolute right-0 top-full">
          <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Character Screens</h3>
          
          <div className="space-y-1 mb-3">
            <NavItem 
              icon={<MessageSquare className="h-4 w-4" />}
              label="Article Chat Bot"
              onClick={() => {
                window.location.href = '/?screen=article-chat'; // Use direct window.location.href instead of navigate
                setIsOpen(false);
              }}
            />
            
            <NavItem 
              icon={<Users className="h-4 w-4" />}
              label="Reginald Assessment Bot"
              onClick={() => {
                window.location.href = '/?screen=assessment';
                setIsOpen(false);
              }}
            />
            
            <NavItem 
              icon={<Book className="h-4 w-4 text-amber-600" />}
              label="Mr. Whitaker (Low)"
              onClick={() => {
                window.location.href = '/?screen=teacher-low';
                setIsOpen(false);
              }}
            />
            
            <NavItem 
              icon={<Book className="h-4 w-4 text-blue-600" />}
              label="Mrs. Bannerman (Medium)"
              onClick={() => {
                window.location.href = '/?screen=teacher-medium';
                setIsOpen(false);
              }}
            />
            
            <NavItem 
              icon={<Book className="h-4 w-4 text-green-600" />}
              label="Mrs. Parton (High)"
              onClick={() => {
                window.location.href = '/?screen=teacher-high';
                setIsOpen(false);
              }}
            />
            
            <NavItem 
              icon={<Award className="h-4 w-4" />}
              label="Final Feedback Screen"
              onClick={() => {
                window.location.href = '/?screen=feedback';
                setIsOpen(false);
              }}
            />
          </div>
          
          <div className="pt-2 border-t border-gray-100">
            <button 
              className="flex items-center w-full text-xs text-gray-600 hover:text-gray-900 py-1 px-2 rounded hover:bg-gray-50"
              onClick={() => {
                window.location.href = '/';
                setIsOpen(false);
              }}
            >
              <ArrowRight className="h-3 w-3 mr-1.5" />
              <span>Reset to Start</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      className="flex items-center gap-2 w-full text-xs hover:bg-gray-50 p-2 rounded text-left transition-colors"
      onClick={onClick}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="font-medium text-gray-800">{label}</span>
    </button>
  );
}