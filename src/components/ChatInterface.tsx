import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User, X, Upload, Image } from 'lucide-react';
import { Message } from '../types';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your EnergySmart AI assistant. I can help you analyze energy invoices, monitor consumption, detect billing anomalies, and answer questions about your facilities. You can also upload invoice images directly here for instant analysis. How can I assist you today?',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Add user message with image
      const userMessage: Message = {
        id: Date.now().toString(),
        content: `📎 Uploaded invoice image: ${file.name}`,
        sender: 'user',
        timestamp: new Date(),
        type: 'upload'
      };

      setMessages(prev => [...prev, userMessage]);
      setShowUploadModal(false);
      setIsTyping(true);

      // Simulate AI processing the image
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: '📊 **Invoice Analysis Complete**\n\n**Extracted Data:**\n• Supplier: ENEL S.p.A.\n• Period: November 2024\n• Consumption: 2,847 kWh\n• Total Cost: €1,245.80\n• Unit Rate: €0.142/kWh\n• Facility: Manufacturing Unit A\n\n**Validation Results:**\n✅ Consumption matches meter readings\n⚠️ Unit rate 8% above market average (€0.131/kWh)\n✅ No billing anomalies detected\n\n**Recommendations:**\n• Consider negotiating better rates with supplier\n• Monitor consumption patterns for optimization opportunities\n\nWould you like me to analyze any specific aspect of this invoice?',
          sender: 'assistant',
          timestamp: new Date(),
          type: 'analysis'
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 2500);
    }
  };

  const generateAIResponse = (input: string): { content: string; type?: string } => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('invoice') || lowerInput.includes('bill')) {
      return {
        content: '📊 I can help you analyze invoices! I found 23 invoices this month across your facilities. 3 invoices show potential anomalies:\n\n• **ENEL Invoice #45821** - Unit A: 15% higher than expected (3,400 kWh billed vs 2,900 kWh actual)\n• **ENI Invoice #78392** - Unit C: Rate mismatch (€0.142/kWh vs market rate €0.135/kWh)\n• **Edison Invoice #23441** - Unit B: Weekend consumption spike\n\nWould you like me to analyze any specific invoice or facility? You can also upload invoice images directly for instant analysis.',
        type: 'analysis'
      };
    }
    
    if (lowerInput.includes('consumption') || lowerInput.includes('usage')) {
      return {
        content: '⚡ **Energy Consumption Summary**\n\n**This Month vs Last Month:**\n• Total consumption: 45,670 kWh (-8.3%)\n• Peak demand: 127 kW (↑12%)\n• Off-peak efficiency: 89% (↑5%)\n\n**Top Consumers:**\n1. Manufacturing Unit A: 18,450 kWh\n2. Data Center B: 12,330 kWh\n3. Office Complex C: 8,890 kWh\n\n**Recommendations:**\n• Schedule high-power operations during off-peak hours\n• Investigate peak demand increase in Manufacturing Unit A',
        type: 'analysis'
      };
    }
    
    if (lowerInput.includes('alert') || lowerInput.includes('anomaly')) {
      return {
        content: '🚨 **Active Alerts (3)**\n\n**Critical:**\n• Building C - Consumption spike: 45% above normal (requires immediate attention)\n\n**Medium:**\n• Invoice discrepancy detected for Facility B\n• Meter reading delay for Unit D (72 hours)\n\n**Low:**\n• Minor efficiency drop in HVAC system\n\nShall I provide detailed analysis for any of these alerts?',
        type: 'alert'
      };
    }
    
    if (lowerInput.includes('cost') || lowerInput.includes('spend')) {
      return {
        content: '💰 **Cost Analysis**\n\n**Monthly Spending:**\n• Current month: €18,450 (-12% from last month)\n• Projected annual: €230,000\n• Savings YTD: €28,500\n\n**Cost Breakdown by Facility:**\n• Manufacturing: €8,900 (48%)\n• Offices: €4,200 (23%)\n• Data Center: €3,800 (21%)\n• Other: €1,550 (8%)\n\n**Optimization Opportunities:**\n• Switch to time-of-use tariff: Est. savings €2,400/year\n• Power factor correction: Est. savings €1,800/year',
        type: 'analysis'
      };
    }
    
    return {
      content: 'I understand you\'re asking about energy management. I can help you with:\n\n• **Invoice Analysis** - Upload invoice images for instant parsing and validation\n• **Consumption Monitoring** - Track usage patterns and anomalies\n• **Cost Optimization** - Identify savings opportunities\n• **Facility Management** - Monitor multiple locations\n• **Alert Management** - Real-time notifications for issues\n\nWhat specific aspect would you like to explore? You can also upload an invoice image for immediate analysis.'
    };
  };

  const quickActions = [
    'Analyze this month\'s invoices',
    'Show consumption anomalies',
    'Compare facility costs',
    'Check billing accuracy'
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
            onClick={() => setShowUploadModal(true)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about energy consumption, invoices, alerts..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload Invoice Image</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">What happens after upload:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• AI automatically extracts supplier, consumption, and cost data</li>
                  <li>• Cross-validates usage against your meter readings</li>
                  <li>• Compares unit rates with current market tariffs (ARERA)</li>
                  <li>• Flags any billing anomalies or unusual consumption patterns</li>
                  <li>• Provides instant analysis and recommendations</li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Select an invoice image to analyze
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Select Image from Device
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Supports JPG, PNG, PDF up to 10MB
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;