import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import ChatIcon from '@mui/icons-material/Chat';

const ModernSidebar = ({ currentView, setCurrentView }) => {
  return (
    <Box
      sx={{
        width: '64px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 3,
        backgroundColor: '#fff',
        borderRight: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Icône Articles */}
      <Tooltip title="Articles" placement="right">
        <IconButton
          onClick={() => setCurrentView('papers')}
          color={currentView === 'papers' ? 'primary' : 'default'}
          sx={{
            mb: 2,
            transition: 'color 0.2s',
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
        >
          <ArticleIcon />
        </IconButton>
      </Tooltip>

      {/* Icône Chat */}
      <Tooltip title="Chat" placement="right">
        <IconButton
          onClick={() => setCurrentView('chat')}
          color={currentView === 'chat' ? 'primary' : 'default'}
          sx={{
            mb: 2,
            transition: 'color 0.2s',
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
        >
          <ChatIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ModernSidebar;
