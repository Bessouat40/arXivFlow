import React, { useState, useEffect } from 'react';
import { Grid, Typography, Pagination, Box } from '@mui/material';
import SearchBar from './components/SearchBar';
import PaperCard from './components/PaperCard';

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [papers, setPapers] = useState([]);
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await fetch(
          `http://${process.env.REACT_APP_MINIO_HOST}:8000/getPapers`
        );
        if (!response.ok) {
          throw new Error('Error during articles loading...');
        }
        const data = await response.json();
        setPapers(data);
        setFilters(data);
      } catch (error) {
        console.error('Error: ', error);
      }
    };

    fetchPapers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const papersPerPage = 12;
  const indexOfLastPaper = currentPage * papersPerPage;
  const indexOfFirstPaper = indexOfLastPaper - papersPerPage;
  const currentPapers = filters.slice(indexOfFirstPaper, indexOfLastPaper);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 3 }}>
      <SearchBar papers={papers} setFilters={setFilters} />
      {filters.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          No papers found
        </Typography>
      ) : (
        <>
          <Grid
            container
            spacing={5}
            sx={{
              mt: 2,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {currentPapers.map((paper) => (
              <Grid item key={paper.pdfUrl}>
                <PaperCard title={paper.title} pdfUrl={paper.pdfUrl} />
              </Grid>
            ))}
          </Grid>
          <Pagination
            count={Math.ceil(filters.length / papersPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}
          />
        </>
      )}
    </Box>
  );
}

export default App;
