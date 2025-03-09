import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchBotResponse = async (userMessage) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `http://${process.env.REACT_APP_MINIO_HOST}:8000/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_input: userMessage }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Erreur lors de l'appel API:", error);
      return "Une erreur s'est produite lors de la communication avec le serveur.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');

    const botResponseText = await fetchBotResponse(inputValue);

    const botMessage = {
      id: Date.now() + 1,
      text: botResponseText,
      sender: 'bot',
    };

    setMessages((prevMessages) => [...prevMessages, botMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const markdownStyles = {
    container: {
      fontFamily: 'inherit',
      lineHeight: '1.6',
      width: '100%',
    },
    h1: { fontSize: '1.8em', fontWeight: 'bold', margin: '0.8em 0 0.4em 0' },
    h2: { fontSize: '1.6em', fontWeight: 'bold', margin: '0.8em 0 0.4em 0' },
    h3: { fontSize: '1.4em', fontWeight: 'bold', margin: '0.7em 0 0.3em 0' },
    p: { margin: '0.5em 0' },
    ul: { marginLeft: '1.5em', listStyleType: 'disc' },
    ol: { marginLeft: '1.5em' },
    li: { margin: '0.3em 0' },
    code: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      padding: '0.2em 0.4em',
      borderRadius: '3px',
      fontFamily: 'monospace',
      fontSize: '0.9em',
    },
    pre: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      padding: '1em',
      borderRadius: '5px',
      overflow: 'auto',
      margin: '0.5em 0',
    },
    blockquote: {
      borderLeft: '4px solid #ddd',
      padding: '0 0 0 1em',
      color: '#666',
      margin: '0.5em 0',
    },
    table: {
      borderCollapse: 'collapse',
      width: '100%',
      margin: '1em 0',
    },
    th: {
      border: '1px solid #ddd',
      padding: '8px',
      textAlign: 'left',
      backgroundColor: '#f2f2f2',
    },
    td: {
      border: '1px solid #ddd',
      padding: '8px',
      textAlign: 'left',
    },
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#ffffff',
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              p: 3,
              backgroundColor: 'white',
            }}
          >
            <Box
              sx={{
                maxWidth: '800px',
                mx: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                flexDirection:
                  message.sender === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: message.sender === 'bot' ? '#10a37f' : '#1976d2',
                  height: 30,
                  width: 30,
                }}
              >
                {message.sender === 'bot' ? (
                  <SmartToyIcon sx={{ fontSize: 20 }} />
                ) : (
                  <PersonIcon sx={{ fontSize: 20 }} />
                )}
              </Avatar>

              <Box
                sx={{
                  flex: 1,
                  textAlign: message.sender === 'user' ? 'right' : 'left',
                }}
              >
                {message.sender === 'user' ? (
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#1976d2',
                      fontWeight: 500,
                    }}
                  >
                    {message.text}
                  </Typography>
                ) : (
                  <Box sx={{ width: '100%' }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ node, ...props }) => (
                          <Typography
                            variant="h5"
                            sx={markdownStyles.h1}
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <Typography
                            variant="h6"
                            sx={markdownStyles.h2}
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <Typography
                            variant="subtitle1"
                            sx={markdownStyles.h3}
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <Typography
                            variant="body1"
                            sx={markdownStyles.p}
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul style={markdownStyles.ul} {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol style={markdownStyles.ol} {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li style={markdownStyles.li} {...props} />
                        ),
                        code: ({ node, inline, ...props }) =>
                          inline ? (
                            <code style={markdownStyles.code} {...props} />
                          ) : (
                            <pre style={markdownStyles.pre}>
                              <code {...props} />
                            </pre>
                          ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            style={markdownStyles.blockquote}
                            {...props}
                          />
                        ),
                        table: ({ node, ...props }) => (
                          <table style={markdownStyles.table} {...props} />
                        ),
                        th: ({ node, ...props }) => (
                          <th style={markdownStyles.th} {...props} />
                        ),
                        td: ({ node, ...props }) => (
                          <td style={markdownStyles.td} {...props} />
                        ),
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        ))}

        {isLoading && (
          <Box
            sx={{
              p: 3,
              backgroundColor: 'white',
            }}
          >
            <Box
              sx={{
                maxWidth: '800px',
                mx: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: '#10a37f',
                  height: 30,
                  width: 30,
                }}
              >
                <SmartToyIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <CircularProgress size={16} />
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Box
        sx={{
          p: 2,
          bgcolor: 'white',
        }}
      >
        <Box
          sx={{
            maxWidth: '800px',
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            variant="outlined"
            placeholder="Send a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                pr: '40px',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#a0a0a0',
                },
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={isLoading || inputValue.trim() === ''}
            sx={{
              position: 'absolute',
              right: '8px',
              bottom: '8px',
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatBot;
