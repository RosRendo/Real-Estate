import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, Sparkles, User, ArrowRight } from "lucide-react";

export default function AiAssistant({ 
  onExecuteCommand, 
  properties 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "init",
      sender: "bot",
      text: "Hello! I am your Real Estate OS AI Assistant. How can I help you manage your portfolio today?",
      suggestions: [
        "Show me vacant properties",
        "Who has overdue payments?",
        "Highlight maintenance alerts on the map",
        "Which building generates the most revenue?"
      ]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto scroll to bottom of chat logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text
    };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput("");

    setIsTyping(true);

    // Simulate AI thinking and command processing
    setTimeout(() => {
      processCommand(text.toLowerCase());
    }, 1000);
  };

  const processCommand = (query) => {
    let replyText = "";
    let suggestions = [];
    let commandData = null;

    // Helper: Find properties by matching name
    const findBuilding = (name) => {
      return properties.find(p => p.name.toLowerCase().includes(name));
    };

    if (query.includes("vacant") || query.includes("vacancy")) {
      // Find vacant units count
      let vacantCount = 0;
      properties.forEach(p => {
        vacantCount += p.units.filter(u => u.status === "vacant").length;
      });

      replyText = `I found **${vacantCount} vacant units** across your portfolio. I have filtered the directory view and highlighted them in red on your map.`;
      commandData = { type: "FILTER_STATUS", value: "vacant" };
      suggestions = ["Show them on the occupancy heatmap", "Which unit generated the most revenue?"];

    } else if (query.includes("late") || query.includes("overdue") || query.includes("hasn't paid") || query.includes("payment")) {
      // Find delinquent units
      const delinquents = [];
      properties.forEach(p => {
        p.units.forEach(u => {
          if (u.tenant && u.tenant.paymentStatus === "Late") {
            delinquents.push({ pName: p.name, uNum: u.number, tName: u.tenant.name, amount: u.tenant.paymentAmount });
          }
        });
      });

      if (delinquents.length > 0) {
        const listStr = delinquents.map(d => `• **${d.pName} Unit ${d.uNum}**: ${d.tName} ($${d.amount.toLocaleString()} overdue)`).join("\n");
        replyText = `There are **${delinquents.length} accounts** with overdue payments:\n\n${listStr}\n\nI have highlighted these locations on the map. You can click on the units in the right panel to send payment reminders.`;
        commandData = { type: "SHOW_LATE_PAYMENTS" };
      } else {
        replyText = "Great news! All tenants have paid their rent. There are no overdue accounts at this time.";
      }
      suggestions = ["Show me vacant properties", "Compare portfolio revenue"];

    } else if (query.includes("maintenance") || query.includes("repair") || query.includes("fix") || query.includes("ticket")) {
      // Find active maintenance
      let ticketsCount = 0;
      properties.forEach(p => {
        p.units.forEach(u => {
          ticketsCount += u.maintenance.filter(t => t.status === "Open").length;
        });
      });

      replyText = `There are currently **${ticketsCount} open maintenance tasks** needing attention. I have updated the map overlay to show active maintenance hot spots (colored in orange/red).`;
      commandData = { type: "SHOW_MAINTENANCE" };
      suggestions = ["Show Skyline Heights", "Reset map filters"];

    } else if (query.includes("revenue") || query.includes("highest revenue") || query.includes("most money") || query.includes("highest earner")) {
      // Find top revenue earner
      let topProp = null;
      let topRev = -1;

      properties.forEach(p => {
        const pRev = p.units
          .filter(u => u.status === "occupied" || (u.tenant && u.status === "maintenance"))
          .reduce((sum, u) => sum + u.rent, 0);
        if (pRev > topRev) {
          topRev = pRev;
          topProp = p;
        }
      });

      if (topProp) {
        replyText = `Your highest generating property is **${topProp.name}**, contributing **$${topRev.toLocaleString()}/month** in gross rental income. I have focused the 3D map camera on it.`;
        commandData = { type: "SELECT_PROPERTY", value: topProp.id };
      } else {
        replyText = "I couldn't aggregate revenue data right now.";
      }
      suggestions = ["Open analytics dashboard", "Show them on the rental yield heatmap"];

    } else if (query.includes("skyline") || query.includes("heights")) {
      const b = findBuilding("skyline");
      replyText = `Focusing map camera on **Skyline Heights** (1024 Broad St). This building contains 15 residential units with 86% occupancy.`;
      commandData = { type: "SELECT_PROPERTY", value: b.id };
      suggestions = ["Show its individual unit matrix", "Who has overdue payments?"];

    } else if (query.includes("villas") || query.includes("oakridge")) {
      const b = findBuilding("oakridge");
      replyText = `Zooming to **Oakridge Villas** (410 Pine Ln). A premium single-family craftsman smart-home.`;
      commandData = { type: "SELECT_PROPERTY", value: b.id };
      suggestions = ["Show nearby school distance", "Show vacant units"];

    } else if (query.includes("plaza") || query.includes("emerald")) {
      const b = findBuilding("emerald");
      replyText = `Focusing on **Emerald Plaza** (88 Commercial Blvd). A low-rise professional plaza with commercial office spaces.`;
      commandData = { type: "SELECT_PROPERTY", value: b.id };
      suggestions = ["Show commercial tenant details", "Show portfolio analytics"];

    } else if (query.includes("heatmap") || query.includes("overlay")) {
      let metric = "status";
      if (query.includes("yield")) metric = "yield";
      else if (query.includes("occupancy")) metric = "occupancy";
      else if (query.includes("value") || query.includes("worth")) metric = "value";
      else if (query.includes("maintenance")) metric = "maintenance";

      replyText = `I have switched the map visual overlay to **${metric} mode**. Check the legend in the bottom right corner for metric brackets.`;
      commandData = { type: "SHOW_HEATMAP", value: metric };
      suggestions = ["Show vacant properties", "Reset map overlay"];

    } else if (query.includes("reset") || query.includes("clear") || query.includes("all properties")) {
      replyText = "Map filters and directory search metrics have been reset. Displaying all portfolio holdings.";
      commandData = { type: "RESET_FILTERS" };
      suggestions = ["Show me vacant properties", "Who has overdue payments?"];

    } else if (query.includes("help") || query.includes("what can i ask") || query.includes("menu")) {
      replyText = `You can ask me to perform operations or query database statistics. Try asking:
• *"Show vacant properties"* (Filters search list)
• *"Who is late on payments?"* (Lists delinquent rents)
• *"Highlight maintenance tickets"* (Shows maintenance overlay)
• *"Zoom into Skyline Heights"* (Manipulates 3D camera)
• *"Switch to yield heatmap"* (Changes WebGL colors)`;
      suggestions = ["Show me vacant properties", "Who is late on payments?"];

    } else {
      replyText = `I heard your request: "${query}". I am a helper bot for this portfolio dashboard. You can ask me to show vacant units, list overdue rent payments, zoom into properties (like Skyline Heights), or switch heatmap layers. Type **"help"** for templates!`;
      suggestions = ["Show vacant properties", "Who has overdue payments?", "Reset map filters"];
    }

    setIsTyping(false);
    
    // Add Bot response message
    setMessages(prev => [...prev, {
      id: `bot-${Date.now()}`,
      sender: "bot",
      text: replyText,
      suggestions: suggestions
    }]);

    // Dispatch command action to dashboard
    if (commandData && onExecuteCommand) {
      onExecuteCommand(commandData);
    }
  };

  return (
    <>
      {/* Floating chatbot bubble */}
      {!isOpen && (
        <button
          className="btn btn-primary"
          style={{
            position: "absolute",
            bottom: "24px",
            right: "24px",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            zIndex: 100
          }}
          onClick={() => setIsOpen(true)}
          title="Open AI Assistant"
        >
          <MessageSquare size={24} />
          {/* Subtle animated notification dot */}
          <span 
            style={{ 
              position: "absolute", 
              top: "-2px", 
              right: "-2px", 
              width: "12px", 
              height: "12px", 
              background: "var(--status-vacant)", 
              borderRadius: "50%", 
              border: "2px solid var(--bg-primary)"
            }}
          />
        </button>
      )}

      {/* Expanded chat window */}
      {isOpen && (
        <div
          className="glass-panel animate-slide-up"
          style={{
            position: "absolute",
            bottom: "24px",
            right: "24px",
            width: "360px",
            height: "480px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-medium)",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 100
          }}
        >
          {/* Chat Header */}
          <div 
            style={{
              padding: "14px 20px",
              background: "rgba(11, 15, 25, 0.8)",
              borderBottom: "1px solid var(--border-light)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div 
                style={{ 
                  background: "rgba(59, 130, 246, 0.15)", 
                  color: "var(--accent-light)", 
                  padding: "6px", 
                  borderRadius: "8px" 
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700 }}>AI Portfolio Assistant</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.65rem", color: "var(--status-occupied)" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--status-occupied)" }}></span>
                  Agent Online
                </div>
              </div>
            </div>

            <button 
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer"
              }}
              onClick={() => setIsOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          {/* Chat Messages */}
          <div 
            ref={scrollRef}
            style={{
              flex: 1,
              padding: "16px 20px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              background: "rgba(8, 12, 20, 0.4)"
            }}
          >
            {messages.map(msg => {
              const isBot = msg.sender === "bot";
              return (
                <div 
                  key={msg.id}
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignSelf: isBot ? "flex-start" : "flex-end",
                    flexDirection: isBot ? "row" : "row-reverse",
                    maxWidth: "85%"
                  }}
                >
                  {/* Sender Avatar */}
                  <div 
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: isBot ? "rgba(59, 130, 246, 0.15)" : "rgba(255,255,255,0.05)",
                      color: isBot ? "var(--accent-light)" : "var(--text-white)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      flexShrink: 0
                    }}
                  >
                    {isBot ? <Sparkles size={11} /> : <User size={11} />}
                  </div>

                  {/* Bubble */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div
                      style={{
                        background: isBot ? "rgba(255, 255, 255, 0.03)" : "var(--accent)",
                        color: isBot ? "var(--text-primary)" : "var(--text-white)",
                        padding: "8px 12px",
                        borderRadius: isBot ? "0 12px 12px 12px" : "12px 0 12px 12px",
                        fontSize: "0.78rem",
                        lineHeight: 1.4,
                        border: isBot ? "1px solid var(--border-light)" : "none",
                        whiteSpace: "pre-wrap"
                      }}
                    >
                      {/* Simplistic renderer for markdown-like bold highlights */}
                      {msg.text.split("**").map((part, i) => 
                        i % 2 === 1 ? <strong key={i} style={{ color: "var(--text-white)" }}>{part}</strong> : part
                      )}
                    </div>

                    {/* Dynamic Suggestions (if bot) */}
                    {isBot && msg.suggestions && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
                        {msg.suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(s)}
                            style={{
                              alignSelf: "flex-start",
                              background: "rgba(255,255,255,0.02)",
                              border: "1px solid var(--border-light)",
                              borderRadius: "20px",
                              padding: "4px 10px",
                              fontSize: "0.7rem",
                              color: "var(--text-secondary)",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "var(--transition)",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.borderColor = "var(--accent-light)";
                              e.target.style.color = "var(--text-white)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.borderColor = "var(--border-light)";
                              e.target.style.color = "var(--text-secondary)";
                            }}
                          >
                            {s}
                            <ArrowRight size={10} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={{ display: "flex", gap: "8px", alignSelf: "flex-start" }}>
                <div 
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "rgba(59, 130, 246, 0.15)",
                    color: "var(--accent-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <Sparkles size={11} />
                </div>
                <div 
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    padding: "10px 14px",
                    borderRadius: "0 12px 12px 12px",
                    border: "1px solid var(--border-light)",
                    display: "flex",
                    gap: "4px",
                    alignItems: "center"
                  }}
                >
                  <span style={{ width: "5px", height: "5px", background: "var(--text-muted)", borderRadius: "50%", display: "inline-block", animation: "fadeIn 0.6s infinite alternate" }}></span>
                  <span style={{ width: "5px", height: "5px", background: "var(--text-muted)", borderRadius: "50%", display: "inline-block", animation: "fadeIn 0.6s infinite alternate 0.2s" }}></span>
                  <span style={{ width: "5px", height: "5px", background: "var(--text-muted)", borderRadius: "50%", display: "inline-block", animation: "fadeIn 0.6s infinite alternate 0.4s" }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: "12px 20px",
              background: "rgba(11, 15, 25, 0.8)",
              borderTop: "1px solid var(--border-light)",
              display: "flex",
              gap: "8px"
            }}
          >
            <input
              type="text"
              placeholder="Ask AI property assistant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-white)",
                fontSize: "0.78rem",
                outline: "none"
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: "36px",
                height: "36px",
                padding: 0,
                borderRadius: "var(--radius-sm)"
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
