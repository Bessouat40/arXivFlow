import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

function SearchBar({ papers, setFilters }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/findSimilarity?user_input=${encodeURIComponent(
          searchTerm
        )}`
      );
      if (!response.ok) {
        throw new Error('Error during similarity search');
      }
      const data = await response.json();
      const filteredPapers =
        data.sources && data.sources.length > 0
          ? papers.filter((paper) =>
              data.sources.some(
                (source) => paper.title.toLowerCase() === source.toLowerCase()
              )
            )
          : papers;
      setFilters(filteredPapers);
    } catch (error) {
      console.error('Error:', error);
      setFilters(papers);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilters(papers);
  };

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
    >
      <TextField
        variant="outlined"
        placeholder="Search papers"
        sx={{ width: '50%' }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleSearch} aria-label="Search">
                <SearchIcon />
              </IconButton>
              <IconButton onClick={clearSearch} aria-label="Clear">
                <CloseIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
}

export default SearchBar;
