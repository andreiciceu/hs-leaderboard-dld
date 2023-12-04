const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Config
const baseURL = "https://hearthstone.blizzard.com/api/community/leaderboardsData";
const region = "EU";
const leaderboardId = "arena";
const seasonId = 42;

const outFile = path.join(__dirname, "leaderboardData.csv");
const MAX_RETRIES = 10;

// Global variables
let currentPage = 1;
let totalPages = 10;

const fetchPage = async (page) => {
  const url = `${baseURL}?region=${region}&leaderboardId=${leaderboardId}&page=${page}&seasonId=${seasonId}`;
  try {
    const response = await axios.get(url);
    totalPages = response.data.leaderboard?.pagination?.totalPages ?? totalPages;

    return response.data.leaderboard.rows;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

const initCsv = () => fs.writeFileSync(outFile, "rank,accountid,rating\n");
const addToCSV = (data) =>
  fs.appendFileSync(
    outFile,
    data.map((row) => `${row.rank},${row.accountid},${row.rating}`).join("\n") + "\n"
  );

/**
 * Fetches all data from the leaderboard and writes it to a CSV file
 */
const fetchAllData = async () => {
  initCsv();
  let retries = 0;
  while (currentPage <= totalPages && retries < MAX_RETRIES) {
    console.log(`Fetching page ${currentPage} of ${totalPages}, retry ${retries}`);
    const rows = await fetchPage(currentPage);

    if (rows?.length) {
      addToCSV(rows);
      currentPage++;
      retires = 0;
    } else {
      retries++;
    }
  }
};

// Run
fetchAllData();
