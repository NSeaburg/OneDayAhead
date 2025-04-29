import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowLeft, Send, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2pdf from 'html2pdf.js';

interface ArticleChatScreenProps {
  articleContent: string;
  assistantId: string;
  systemPrompt: string;
  onNext: () => void;
  onPrevious?: () => void;
}

export default function ArticleChatScreen({ 
  articleContent, 
  assistantId,
  systemPrompt,
  onNext,
  onPrevious
}: ArticleChatScreenProps) {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    threadId, 
    currentStreamingMessage, 
    isTyping 
  } = useStreamingChat({
    assistantId,
    systemPrompt,
    initialMessage: "Hello! I'm your learning assistant for this module. Feel free to ask any questions about the article content or related topics, and I'll help clarify concepts or provide additional information."
  });

  // Scroll to bottom of messages when new messages appear or when typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage("");
    }
  };
  
  // Function to handle PDF download
  const handleDownloadPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = articleContent;
    
    const options = {
      margin: 10,
      filename: 'three-branches-of-government.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().from(element).set(options).save();
  };

  // HTML Content for the learning material
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Down With Gravity</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        padding: 0;
        margin: 0;
      }
      h1, h2 {
        color: #004080;
      }
      ul {
        padding-left: 1.5rem;
      }
      .section {
        margin-bottom: 1.5rem;
      }
      .vocab {
        background-color: #f0f8ff;
        padding: 0.8rem;
        border-radius: 8px;
      }
      .questions {
        background-color: #f9f9f9;
        padding: 0.8rem;
        border-radius: 8px;
      }
    </style>
  </head>
  <body>
    <h1>Down With Gravity</h1>

    <div class="section">
      <p><strong>Objective:</strong> Explore that gravity is an attraction between objects with mass.</p>
      <p><strong>Grade:</strong> 5</p>
    </div>

    <div class="section">
      <h2>Materials</h2>
      <ul>
        <li>Pencil</li>
        <li>String</li>
        <li>Paper Clips</li>
        <li>Scissors</li>
        <li>Water Bottle (Full and Half Empty)</li>
        <li>Food Coloring (Optional)</li>
        <li>Paper (Flat and Crumpled)</li>
        <li>Disposable Cup</li>
        <li>Sink or Bathtub</li>
      </ul>
    </div>

    <div class="section">
      <h2>Activity 1: Gravity Pencil Demo</h2>
      <p><strong>What to Do:</strong></p>
      <ul>
        <li>Tie one end of the string to the pencil, and the other to a paperclip so it dangles freely.</li>
        <li>Move the pencil and observe how the paperclips move.</li>
      </ul>
    </div>

    <div class="section">
      <h2>Activity 2: Water Bottle and Paper Experiments</h2>
      <p><strong>Gravity: Water Bottle Experiment</strong></p>
      <ul>
        <li>Hold the full and half-empty water bottles at the same height and drop them simultaneously.</li>
      </ul>

      <p><strong>Air Resistance and Gravity on Earth</strong></p>
      <ul>
        <li>Drop a flat paper and a crumpled paper ball from the same height.</li>
        <li>Observe that the crumpled paper lands first because air resistance slows the flat paper.</li>
      </ul>
    </div>

    <div class="section">
      <h2>Activity 3: Gravity in a Cup</h2>
      <ul>
        <li>Poke a hole in the bottom of a disposable cup (ask an adult if needed).</li>
        <li>Cover the hole, fill the cup with water, and then release the hole to observe.</li>
        <li>Hypothesize what will happen when you release the water and cup simultaneously over a sink.</li>
      </ul>
    </div>

    <div class="section vocab">
      <h2>Vocabulary</h2>
      <ul>
        <li><strong>Gravity:</strong> The force that attracts all objects toward one another.</li>
        <li><strong>Force:</strong> A push or pull.</li>
        <li><strong>Mass:</strong> The amount of matter in an object.</li>
        <li><strong>Air Resistance:</strong> The frictional force air exerts against a moving object.</li>
      </ul>
    </div>

    <div class="section questions">
      <h2>Student Reflection Questions</h2>
      <ul>
        <li>How does gravity pull different masses (heavy and light)?</li>
        <li>How does air resistance affect the rate that objects fall?</li>
        <li>What would happen if the hole was bigger or smaller in the cup experiment?</li>
      </ul>
    </div>

    <div class="section">
      <h2>What's Happening?</h2>
      <p>Gravity is a force that pulls objects together. Its strength depends on the mass of the objects. Larger mass = stronger pull. Earth's massive size overpowers our personal gravitational pull. In space, without nearby large masses, personal gravity becomes noticeable.</p>
      <p>Other forces like air resistance also affect how objects move, especially when falling.</p>
    </div>

    <div class="section">
      <p>Check out more activities at <a href="https://www.nysci.org" target="_blank">www.nysci.org</a>.</p>
    </div>
  </body>
  </html>
  `;

  return (
    <div className="flex flex-col p-4 md:p-6 h-full">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Article & Discussion</h1>
      <div className="flex-grow flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Article Section - Now showing HTML content */}
        <div className="md:w-1/2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
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
          <div className="p-4 overflow-y-auto h-[calc(100vh-350px)] md:h-[calc(100vh-320px)]">
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: articleContent }}
            />
          </div>
        </div>
        
        {/* Chat Section */}
        <div className="md:w-1/2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-lg text-gray-800">Discussion Assistant</h2>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100vh-350px)] md:h-[calc(100vh-320px)] space-y-4">
            {/* Regular messages */}
            {messages.map((message, index) => (
              <div key={index} className="message-appear flex flex-col">
                <div className="flex items-start mb-1">
                  <div className={`w-8 h-8 rounded-full ${
                    message.role === 'assistant' 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'bg-gray-200 text-gray-600'
                  } flex items-center justify-center mr-2 flex-shrink-0`}>
                    <i className={message.role === 'assistant' ? 'ri-robot-line' : 'ri-user-line'}></i>
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
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Streaming message - plain text display with no animations */}
            {isTyping && currentStreamingMessage && (
              <div className="flex flex-col">
                <div className="flex items-start mb-1">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-2 flex-shrink-0">
                    <i className="ri-robot-line"></i>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    Assistant
                  </span>
                </div>
                <div className="ml-10 bg-gray-100 rounded-lg p-3 text-gray-700">
                  <div className="typing-text markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentStreamingMessage}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
            
            {/* Initial loading indicator */}
            {isLoading && !currentStreamingMessage && (
              <div className="flex items-center justify-center p-4">
                <div className="animate-pulse flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                </div>
              </div>
            )}
            
            {/* Reference for scrolling to bottom */}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-grow focus:border-primary-500"
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={isLoading}
                className="p-2 bg-primary hover:bg-primary/90 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-between">
        {onPrevious ? (
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : <div></div>}
        
        <Button
          onClick={onNext}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}