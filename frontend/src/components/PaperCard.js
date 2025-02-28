import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  Box,
  Button,
  CircularProgress,
  Tooltip,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import { pdfjs, Document, Page } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PaperCard({ title, pdfUrl }) {
  const [open, setOpen] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [inputPage, setInputPage] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [dialogIsLoaded, setDialogIsLoaded] = useState(false);
  const [dialogHasError, setDialogHasError] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsLoaded(true);
    setDialogIsLoaded(true);
    setHasError(false);
    setDialogHasError(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF loading error:', error);
    setHasError(true);
    setDialogHasError(true);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setPageNumber(1);
    setScale(1.5);
    setInputPage('');
  };

  const handlePrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
      setInputPage(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
      setInputPage(pageNumber + 1);
    }
  };

  const handlePageChange = (e) => {
    const value = e.target.value;
    setInputPage(value);
  };

  const handleGoToPage = () => {
    const page = parseInt(inputPage, 10);
    if (!isNaN(page) && page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
    setInputPage(pageNumber);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!open) return;

      switch (event.key) {
        case 'ArrowLeft':
          handlePrevPage();
          break;
        case 'ArrowRight':
          handleNextPage();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, pageNumber, numPages, scale]);

  return (
    <>
      <Card
        sx={{
          width: 350,
          height: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
          },
          background: 'linear-gradient(135deg, #ffffff, #f9f9f9)',
        }}
      >
        <Box
          sx={{
            height: '70%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderBottom: '1px solid #eee',
          }}
        >
          {!isLoaded && !hasError && <CircularProgress color="primary" />}
          {hasError ? (
            <Typography color="error" align="center" sx={{ px: 2 }}>
              Failed to load PDF
            </Typography>
          ) : (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
            >
              <Page
                pageNumber={pageNumber}
                width={260}
                renderTextLayer={false}
              />
            </Document>
          )}
        </Box>
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 1.5,
            backgroundColor: '#fff',
            borderRadius: '0 0 12px 12px',
          }}
        >
          <Typography
            gutterBottom
            variant="subtitle1"
            component="div"
            sx={{
              fontWeight: 500,
              color: '#333',
              textAlign: 'center',
              maxWidth: '90%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </Typography>
          <Tooltip title="View PDF">
            <IconButton
              onClick={handleOpen}
              aria-label="View PDF"
              sx={{
                color: '#1976d2',
                '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' },
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen
        maxWidth="xl"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
          },
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1,
          }}
          aria-label="Fermer"
        >
          <CloseIcon fontSize="large" />
        </IconButton>

        <DialogContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
              bgcolor: '#f5f5f5',
              borderRadius: '8px',
              p: 2,
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) =>
                console.error('Erreur lors du chargement du PDF :', error)
              }
            >
              <Page pageNumber={pageNumber} scale={scale} />
            </Document>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              p: 1,
            }}
          >
            <Tooltip title="Page précédente">
              <span>
                <IconButton
                  onClick={handlePrevPage}
                  disabled={pageNumber <= 1}
                  aria-label="Page précédente"
                  sx={{
                    color: '#1976d2',
                    '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Typography
              variant="body1"
              sx={{ fontWeight: 500, color: '#424242' }}
            >
              Page {pageNumber} de {numPages || '...'}
            </Typography>
            <Tooltip title="Page suivante">
              <span>
                <IconButton
                  onClick={handleNextPage}
                  disabled={pageNumber >= numPages}
                  aria-label="Page suivante"
                  sx={{
                    color: '#1976d2',
                    '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' },
                  }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </span>
            </Tooltip>
            <TextField
              type="number"
              value={inputPage}
              onChange={handlePageChange}
              placeholder={pageNumber.toString()}
              size="small"
              sx={{
                width: 70,
                mx: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  backgroundColor: '#fff',
                },
              }}
              inputProps={{ min: 1, max: numPages }}
            />
            <Button
              variant="contained"
              onClick={handleGoToPage}
              disabled={!numPages}
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                '&:hover': { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)' },
              }}
            >
              Go
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PaperCard;
