import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User, X, Upload, FileText, Calendar, Zap, DollarSign, Percent } from 'lucide-react';
import { Message } from '../types';
import { getSolarUsageData } from '../data/solarData';
import { analyzeDocumentWithGemini } from '../services/api';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ExtractedData {
  raw_text: string;
  structured_data: {
    total_amount: number | null;
    subtotal: number | null;
    tax_amount: number | null;
    date: string | null;
    invoice_number: string | null;
    vendor_name: string | null;
    line_items: Array<{ description: string; amount: number }>;
  } | null;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your EnergySmart AI assistant. I can help you analyze solar energy invoices, monitor consumption, detect billing anomalies, and answer questions about your solar panel system. You can also upload invoice documents directly here for instant analysis. How can I assist you today?',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageQuestion, setImageQuestion] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrData, setOcrData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        sender: 'assistant',
        timestamp: new Date(),
        type: aiResponse.type || 'text'
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedImage(file);
      
      // Only create preview URL for images, no OCR processing yet
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
      
      // Show the upload modal immediately
      setShowUploadModal(true);
    }
  };

  const handleImageAnalysis = async () => {
    if (!uploadedImage) return;

    // Log file details
    console.log('File details:', {
      name: uploadedImage.name,
      type: uploadedImage.type,
      size: uploadedImage.size,
    });

    // Add user message with file and question first
    const userMessage: Message = {
      id: Date.now().toString(),
      content: `📎 Analyzing document: ${uploadedImage.name}${imageQuestion ? `\nQuestion: ${imageQuestion}` : ''}`,
      sender: 'user',
      timestamp: new Date(),
      type: 'upload',
      imageUrl: uploadedImage.type.startsWith('image/') && imagePreview ? imagePreview : undefined
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Close the modal and show typing indicator
    setShowUploadModal(false);
    setIsTyping(true);

    try {
      // Show processing message
      const processingMessage: Message = {
        id: Date.now().toString(),
        content: "I'm analyzing your document. This will take a moment...",
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, processingMessage]);

      // Analyze document using Gemini
      const result = await analyzeDocumentWithGemini(uploadedImage, imageQuestion);

      if (result.success && result.extracted_data) {
        // Store the extracted data for follow-up questions
        setExtractedData(result.extracted_data);
        
        // Generate response based on the extracted data
        const response = generateDocumentAnalysisResponse(imageQuestion || '', result.extracted_data);
        
        // Add a hint about follow-up questions
        const fullResponse = response + "\n\nYou can ask me follow-up questions about this invoice, such as:\n" +
          "• What's the total amount?\n" +
          "• When was this invoice issued?\n" +
          "• Who is the vendor?\n" +
          "• Can you list the line items?\n" +
          "• What's the tax amount?";
        
        // Update messages with the analysis result
        const assistantMessage: Message = {
          id: Date.now().toString(),
          content: fullResponse,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'text'
        };
        
        // Replace processing message with actual response
        setMessages(prev => 
          prev.filter(msg => msg.id !== processingMessage.id).concat(assistantMessage)
        );
      } else {
        throw new Error(result.error_message || 'Failed to analyze document');
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error analyzing document:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: `I apologize, but I encountered an error while analyzing your document: ${error.message}\n\n` +
                "Please make sure:\n" +
                "• The file is a valid invoice or bill\n" +
                "• The image is clear and readable\n" +
                "• The file format is supported (PNG, JPEG, PDF)\n" +
                "• The file size is not too large (maximum 10MB)\n\n" +
                "You can also try:\n" +
                "• Converting the file to a different format\n" +
                "• Reducing the file size\n" +
                "• Making sure the document is properly oriented",
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      
      // Replace processing message with error message
      setMessages(prev => {
        // Find and remove the processing message if it exists
        const filteredMessages = prev.filter(msg => 
          !msg.content.includes("I'm analyzing your document")
        );
        return [...filteredMessages, errorMessage];
      });
    } finally {
      setIsTyping(false);
      setUploadedImage(null);
      setImagePreview(null);
      setImageQuestion('');
    }
  };

  const generateDocumentAnalysisResponse = (question: string, extractedData: any): string => {
    const { raw_text, structured_data } = extractedData;
    
    // If we have a specific question, use the raw text from Gemini
    if (question && question.trim() !== '') {
      return raw_text;
    }
    
    // Otherwise, generate a structured response from the parsed data
    if (!structured_data) {
      return "I apologize, but I couldn't structure the extracted data properly. Here's what I found:\n\n" + raw_text;
    }

    const {
      total_amount,
      subtotal,
      tax_amount,
      date,
      invoice_number,
      vendor_name,
      line_items
    } = structured_data;

    let response = '';

    if (vendor_name) {
      response += `Invoice from: ${vendor_name}\n`;
    }
    
    if (invoice_number) {
      response += `Invoice number: ${invoice_number}\n`;
    }
    
    if (date) {
      response += `Date: ${date}\n`;
    }

    response += '\nAmounts:\n';
    
    if (total_amount !== null) {
      response += `• Total: ${formatCurrency(total_amount)}\n`;
    }
    
    if (subtotal !== null) {
      response += `• Subtotal: ${formatCurrency(subtotal)}\n`;
    }
    
    if (tax_amount !== null) {
      response += `• Tax: ${formatCurrency(tax_amount)}\n`;
    }

    if (line_items && line_items.length > 0) {
      response += '\nLine Items:\n';
      line_items.forEach((item: any) => {
        response += `• ${item.description}: ${formatCurrency(item.amount)}\n`;
      });
    }

    return response;
  };

  const formatCurrency = (amount: number | null): string => {
    if (amount === null || isNaN(amount)) {
      return 'Not available';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const generateAIResponse = (input: string): { content: string; type?: 'text' | 'upload' | 'alert' | 'analysis' } => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('invoice') || lowerInput.includes('bill')) {
      return {
        content: '📊 I can help you analyze solar energy invoices! I found 7 invoices from the last 7 months. Here\'s a summary:\n\n• **Total Energy Generated**: 2,923 kWh\n• **Total Energy Used**: 2,147 kWh\n• **Total Cost**: $382.71\n• **Average Efficiency**: 73%\n\n**Recent Invoices:**\n• June 2025: $67.32 (440 kWh generated)\n• May 2025: $84.55 (581 kWh generated)\n• April 2025: $39.92 (472 kWh generated)\n\nWould you like me to analyze any specific invoice or upload a new one for instant analysis?',
        type: 'analysis'
      };
    }
    
    if (lowerInput.includes('consumption') || lowerInput.includes('usage')) {
      return {
        content: '⚡ **Solar Energy Consumption Summary**\n\n**Last 7 Months:**\n• Total generated: 2,923 kWh\n• Total used: 2,147 kWh\n• Average monthly generation: 417 kWh\n• Average monthly usage: 307 kWh\n\n**Efficiency Trends:**\n• Best month: January 2025 (62% efficiency)\n• Lowest month: April 2025 (47% efficiency)\n• Average efficiency: 73%\n\n**Recommendations:**\n• Monitor panel performance during cloudy periods\n• Consider energy storage for unused generation\n• Schedule regular panel maintenance',
        type: 'analysis'
      };
    }
    
    if (lowerInput.includes('cost') || lowerInput.includes('spend')) {
      return {
        content: '�� **Cost Analysis**\n\n**Monthly Spending (Last 7 months):**\n• Total spent: $382.71\n• Average monthly: $54.67\n• Highest month: May 2025 ($84.55)\n• Lowest month: April 2025 ($39.92)\n\n**Cost Breakdown:**\n• Energy charges: $273.54 (71%)\n• Service fees: $109.17 (29%)\n• Average rate: $0.15/kWh\n\n**Savings Opportunities:**\n• Optimize panel efficiency\n• Consider time-of-use rates\n• Monitor service fee variations',
        type: 'analysis'
      };
    }
    
    return {
      content: 'I understand you\'re asking about your solar energy system. I can help you with:\n\n• **Invoice Analysis** - Upload invoice images for instant parsing and validation\n• **Consumption Monitoring** - Track usage patterns and efficiency\n• **Cost Optimization** - Identify savings opportunities\n• **Performance Analysis** - Monitor panel efficiency\n• **Alert Management** - Real-time notifications for issues\n\nWhat specific aspect would you like to explore? You can also upload an invoice image for immediate analysis.',
      type: 'text'
    };
  };

  const quickActions = [
    'Analyze this month\'s invoice',
    'Show consumption trends',
    'Compare monthly costs',
    'Check panel efficiency'
  ];

  // Function to handle follow-up questions about invoice data
  const handleFollowUpQuestion = async (question: string) => {
    if (!extractedData) {
      return "I don't have any invoice data to answer questions about. Please upload an invoice first.";
    }

    // Add user's question to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: question,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Use Gemini to answer the follow-up question
      const model = new GoogleGenerativeAI(import.meta.env.GEMINI_API_KEY || '').getGenerativeModel({ 
        model: 'gemini-1.5-flash' 
      });

      const prompt = `Given this invoice data:
${JSON.stringify(extractedData.structured_data, null, 2)}

And the raw extracted text:
${extractedData.raw_text}

Please answer this question about the invoice: ${question}

If the question cannot be answered with the available data, please say so.
Keep the answer concise and focused on the question asked.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const answer = response.text();

      // Add AI's response to chat
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: answer,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error handling follow-up question:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I encountered an error while processing your question. Please try asking in a different way.",
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const message = inputMessage.trim();
    setInputMessage('');

    // If we have extracted data, treat it as a follow-up question
    if (extractedData) {
      await handleFollowUpQuestion(message);
    } else {
      // Handle as a regular message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: 'user',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, userMessage]);

      // Default response for non-invoice questions
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm designed to help you analyze invoices and answer questions about them. Please upload an invoice to get started.",
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">EnergySmart AI Assistant</h3>
            <p className="text-sm text-green-600">Online • Ready to help</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`flex-shrink-0 p-2 rounded-full ${
              message.sender === 'user' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              {message.sender === 'user' ? (
                <User className="h-4 w-4 text-blue-600" />
              ) : (
                <Bot className="h-4 w-4 text-gray-600" />
              )}
            </div>
            
            <div className={`max-w-[80%] ${
              message.sender === 'user' ? 'text-right' : ''
            }`}>
              {message.imageUrl && (
                <div className="mb-2">
                  <img 
                    src={message.imageUrl} 
                    alt="Uploaded invoice" 
                    className="max-w-full h-auto rounded-lg border border-gray-200"
                  />
                </div>
              )}
              <div className={`inline-block p-3 rounded-lg ${
                message.sender === 'user'
                  ? message.type === 'upload'
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white'
                  : message.type === 'alert'
                  ? 'bg-red-50 border border-red-200 text-gray-900'
                  : message.type === 'analysis'
                  ? 'bg-green-50 border border-green-200 text-gray-900'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}>
                <p className="whitespace-pre-line">{message.content}</p>
              </div>
              <p className={`text-xs text-gray-500 mt-1 ${
                message.sender === 'user' ? 'text-right' : ''
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="bg-gray-100 p-2 rounded-full">
              <Bot className="h-4 w-4 text-gray-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(action)}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about solar energy consumption, invoices, alerts..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.pages,image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Document Analysis</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadedImage(null);
                  setImagePreview(null);
                  setImageQuestion('');
                  setOcrData(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Document Preview */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Document Preview</h4>
              {uploadedImage && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="p-6 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">{uploadedImage.name}</p>
                        <p className="text-xs text-gray-500">{(uploadedImage.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <div className="mb-4">
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent"></div>
                  <span className="text-sm">Processing document...</span>
                </div>
              </div>
            )}

            {/* Question Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ask a question about this document:
              </label>
              <textarea
                value={imageQuestion}
                onChange={(e) => setImageQuestion(e.target.value)}
                placeholder="e.g., What's the total cost? What items were purchased? What are the payment terms?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadedImage(null);
                  setImagePreview(null);
                  setImageQuestion('');
                  setOcrData(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImageAnalysis}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Analyze Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;