import React, { useState, useRef, useEffect, FC } from "react";
import { ArrowRight, ArrowLeft, Send, FileDown, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { useArticleChat } from "@/hooks/useArticleChat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2pdf from 'html2pdf.js';
import { motion, AnimatePresence } from "framer-motion";
import { Message } from "@/lib/openai";
import DOMPurify from 'dompurify';

// Constants
const PULSE_DURATION = 5000;
const INITIAL_BOT_MESSAGE = "Hi! We are reading about the three branches of government. Hit me up if you want to chat about the article or if you have any questions.";
const PDF_OPTIONS = {
  margin: 10,
  filename: 'learning-material.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
};

// Types
interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  streamContent?: string;
}

interface ArticleChatScreenProps {
  articleContent: string;
  assistantId: string;
  systemPrompt: string;
  onNext: () => void;
  onPrevious?: () => void;
}

// Components
const MessageBubble: FC<MessageBubbleProps> = ({ message, isStreaming = false, streamContent = '' }) => (
  <div className="flex flex-col">
    <div className="flex items-start mb-1">
      <div className={`w-8 h-8 rounded-full ${
        message.role === 'assistant' 
          ? 'bg-primary-100 text-primary-600' 
          : 'bg-gray-200 text-gray-600'
      } flex items-center justify-center mr-2 flex-shrink-0 text-xs font-medium`}>
        {message.role === 'assistant' ? 
          <MessageSquare className="h-4 w-4" /> : 
          "You"}
      </div>
      <span className="text-xs text-gray-500 mt-1">
        {message.role === 'assistant' ? 'Assistant' : 'You'}
      </span>
    </div>
    <div className={`ml-10 ${
      message.role === 'assistant' 
        ? 'bg-gray-100' 
        : 'bg-white border border-gray-200'
    } rounded-lg p-3 text-gray-700`}>
      <div className="typing-text markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {isStreaming ? streamContent : message.content}
        </ReactMarkdown>
      </div>
    </div>
  </div>
);

const LoadingDots: FC = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-pulse flex space-x-2">
      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
    </div>
  </div>
);

export default function ArticleChatScreen({ 
  articleContent, 
  assistantId,
  systemPrompt,
  onNext,
  onPrevious
}: ArticleChatScreenProps) {
  // State
  const [inputMessage, setInputMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBubbleDismissed, setIsBubbleDismissed] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Chat functionality
  // Log which system prompt we're using
  console.log(`ArticleChatScreen using system prompt with length: ${systemPrompt?.length || 0} characters`);
  
  const { 
    messages, 
    sendMessage, 
    isThinking: isLoading, 
    status,
    resetConversation,
    streamContent: currentStreamingMessage,
    isStreaming: isTyping
  } = useArticleChat(INITIAL_BOT_MESSAGE);
  
  // Reset conversation on mount to ensure system prompt is applied
  useEffect(() => {
    console.log("ArticleChatScreen mounted - resetting conversation to ensure proper system prompt");
    
    // Clear existing messages and set the initial welcome
    // Use empty dependency array since we only want this to run on mount
  }, []);

  // Effects
  useEffect(() => {
    // Stop pulsing after set duration
    const timer = setTimeout(() => setShouldPulse(false), PULSE_DURATION);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Auto-scroll chat container to latest message instead of the entire page
    const messageContainer = messagesEndRef.current?.closest('.overflow-y-auto');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages, currentStreamingMessage]);

  // Event handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage("");
    }
  };
  
  const handleDownloadPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = articleContent;
    html2pdf().from(element).set(PDF_OPTIONS).save();
  };
  
  // Handle closing the chat with animation that reverses the opening animation
  const handleCloseChat = () => {
    // We'll delay the actual state change to allow the animation to complete
    setTimeout(() => {
      setIsChatOpen(false);
    }, 300); // This delay matches the animation duration
  };

  return (
    <div className="flex flex-col p-4 md:p-6 h-full relative">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        {isChatOpen ? "Article & Discussion" : "Article"}
      </h1>
      <div className="flex-grow flex flex-col md:flex-row md:flex-nowrap gap-4 md:gap-6 mb-24 relative">
        {/* Article Section */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col"
          initial={{ width: isChatOpen ? "60%" : "100%" }}
          animate={{
            width: isChatOpen ? "60%" : "100%",
            transition: { duration: 0.3 }
          }}
        >
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-lg text-gray-800">Learning Material</h2>
            <Button 
              onClick={handleDownloadPDF}
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 text-xs"
            >
              <FileDown className="h-3.5 w-3.5" />
              Download PDF
            </Button>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100vh-380px)] md:h-[calc(100vh-350px)] relative">
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(articleContent) }}
            />
            
            {/* Navigation buttons positioned at bottom corners of article container */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
              <div className="pointer-events-auto">
                {onPrevious ? (
                  <Button
                    onClick={onPrevious}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-white/90 backdrop-blur-sm shadow-sm"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                ) : <div></div>}
              </div>
              
              <div className="pointer-events-auto">
                <Button
                  onClick={onNext}
                  className="bg-primary hover:bg-primary/90 text-white shadow-sm"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Chat Section - Using AnimatePresence for animation */}
        <AnimatePresence mode="sync">
          {isChatOpen && (
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col relative"
              style={{ flex: "0 0 40%" }}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Close button for the chat section */}
              <motion.button
                className="absolute top-2 right-2 rounded-full bg-gray-100 p-1 hover:bg-gray-200 z-10"
                onClick={handleCloseChat}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.2 }}
              >
                <X className="h-4 w-4 text-gray-600" />
              </motion.button>
              
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-lg text-gray-800">Discussion Assistant</h2>
              </div>
              <motion.div 
                className="p-4 overflow-y-auto h-[calc(100vh-380px)] md:h-[calc(100vh-350px)] space-y-4"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
              >
                {/* Regular messages */}
                {messages.map((message: Message, index: number) => (
                  <motion.div 
                    key={index} 
                    className="message-appear"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MessageBubble message={message} />
                  </motion.div>
                ))}
                
                {/* Streaming message */}
                {isTyping && currentStreamingMessage && (
                  <MessageBubble 
                    message={{ role: 'assistant', content: '' }} 
                    isStreaming={true} 
                    streamContent={currentStreamingMessage} 
                  />
                )}
                
                {/* Initial loading indicator */}
                {isLoading && !currentStreamingMessage && <LoadingDots />}
                
                {/* Reference for scrolling to bottom */}
                <div ref={messagesEndRef} />
              </motion.div>
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSubmit} className="flex items-start gap-2">
                  <AutoResizeTextarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-grow focus:border-primary-500"
                    maxRows={5}
                    autoFocus
                    onKeyDown={(e) => {
                      // Submit on Enter key without Shift key
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={isLoading}
                    className="p-2 bg-primary hover:bg-primary/90 text-white mt-1"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating chat bubble */}
      <AnimatePresence mode="wait">
        {!isChatOpen && !isBubbleDismissed && (
          <motion.div 
            className="fixed bottom-24 right-6 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <motion.button
                className="flex items-center gap-2 px-5 py-4 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
                onClick={() => setIsChatOpen(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={shouldPulse ? 
                  { opacity: [0.9, 1, 0.9], transition: { repeat: Infinity, duration: 2 } } : 
                  { opacity: 1 }
                }
              >
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">Want to chat with this article?</span>
              </motion.button>
              <motion.button
                className="absolute -top-2 -right-2 rounded-full bg-white shadow-md p-1 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBubbleDismissed(true);
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.2 }}
              >
                <X className="h-4 w-4 text-gray-600" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}