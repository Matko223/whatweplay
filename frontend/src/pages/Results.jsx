import React from 'react';
import { useLocation } from 'react-router-dom';

function Results() {
  const location = useLocation();
  const games = location.state?.games || [];

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl font-bold">Results</h1>
      <p>Found {games.length} games.</p>
    </div>
  );
}
export default Results;