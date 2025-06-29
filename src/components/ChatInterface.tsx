import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User, X, Upload, FileText, Calendar, Zap, DollarSign, Percent } from 'lucide-react';
import { Message } from '../types';
import { getSolarUsageData } from '../data/solarData';

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
  const [extractedData, setExtractedData] = useState<any>(null);
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
      setIsProcessing(true);
      
      try {
        // Create form data
        const formData = new FormData();
        formData.append('file', file);

        // Call OCR API
        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('OCR processing failed');
        }

        const data = await response.json();
        if (data.success) {
          setOcrData(data.extracted_data);
          console.log('OCR Data:', data.extracted_data);
        } else {
          console.error('OCR Error:', data.error_message);
        }
      } catch (error) {
        console.error('Error processing document:', error);
      } finally {
        setIsProcessing(false);
      }
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
      
      setShowUploadModal(true);
    }
  };

  const handleImageAnalysis = () => {
    if (!uploadedImage) return;

    // Add user message with file
    const userMessage: Message = {
      id: Date.now().toString(),
      content: `📎 Uploaded document: ${uploadedImage.name}${imageQuestion ? `\nQuestion: ${imageQuestion}` : ''}`,
      sender: 'user',
      timestamp: new Date(),
      type: 'upload',
      imageUrl: uploadedImage.type.startsWith('image/') && imagePreview ? imagePreview : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setShowUploadModal(false);
    setIsTyping(true);

    // Generate response based on OCR data
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateDocumentAnalysisResponse(imageQuestion, uploadedImage),
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);

    // Reset states
    setUploadedImage(null);
    setImagePreview(null);
    setImageQuestion('');
  };

  const generateDocumentAnalysisResponse = (question: string, file: File): string => {
    if (!ocrData) {
      return "I'm still processing the document. Please ask your question again in a moment.";
    }

    const lowerQuestion = question.toLowerCase();
    
    // Helper function to format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: ocrData.currency || 'USD'
      }).format(amount);
    };

    // Handle different types of questions
    if (lowerQuestion.includes('total') || lowerQuestion.includes('cost') || lowerQuestion.includes('amount')) {
      const total = ocrData.total_amount;
      const subtotal = ocrData.subtotal;
      const tax = ocrData.tax_amount;
      
      return `The total amount is ${formatCurrency(total)}. This includes:
• Subtotal: ${formatCurrency(subtotal)}
• Tax: ${formatCurrency(tax)}${ocrData.shipping_cost ? `\n• Shipping: ${formatCurrency(ocrData.shipping_cost)}` : ''}${ocrData.discount ? `\n• Discount: ${formatCurrency(ocrData.discount)}` : ''}`;
    }

    if (lowerQuestion.includes('date') || lowerQuestion.includes('when')) {
      return `This invoice is dated ${ocrData.date}.`;
    }

    if (lowerQuestion.includes('supplier') || lowerQuestion.includes('seller') || lowerQuestion.includes('vendor')) {
      const supplier = ocrData.supplier_info;
      return `The supplier is ${supplier.company_name}${supplier.address ? `\nAddress: ${supplier.address}` : ''}${supplier.phone ? `\nPhone: ${supplier.phone}` : ''}`;
    }

    if (lowerQuestion.includes('items') || lowerQuestion.includes('products') || lowerQuestion.includes('bought')) {
      const items = ocrData.items;
      return `Here are the items in the invoice:\n${items.map((item: any, index: number) => 
        `${index + 1}. ${item.product_name} - ${item.quantity} ${item.unit || 'units'} at ${formatCurrency(item.unit_price)} each = ${formatCurrency(item.amount)}`
      ).join('\n')}`;
    }

    if (lowerQuestion.includes('payment') || lowerQuestion.includes('terms')) {
      const terms = ocrData.payment_terms;
      return `Payment Terms:\n${Object.entries(terms).map(([key, value]) => 
        value ? `• ${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value}` : ''
      ).filter(Boolean).join('\n')}`;
    }

    // Default response with overview
    return `This invoice contains the following information:
• Invoice Number: ${ocrData.invoice_number}
• Date: ${ocrData.date}
• Supplier: ${ocrData.supplier_info.company_name}
• Total Amount: ${formatCurrency(ocrData.total_amount)}
• Number of Items: ${ocrData.items.length}

What specific information would you like to know about?`;
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
        content: '💰 **Cost Analysis**\n\n**Monthly Spending (Last 7 months):**\n• Total spent: $382.71\n• Average monthly: $54.67\n• Highest month: May 2025 ($84.55)\n• Lowest month: April 2025 ($39.92)\n\n**Cost Breakdown:**\n• Energy charges: $273.54 (71%)\n• Service fees: $109.17 (29%)\n• Average rate: $0.15/kWh\n\n**Savings Opportunities:**\n• Optimize panel efficiency\n• Consider time-of-use rates\n• Monitor service fee variations',
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
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
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
                disabled={isProcessing}
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