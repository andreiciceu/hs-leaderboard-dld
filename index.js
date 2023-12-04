const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseURL = "https://hearthstone.blizzard.com/api/community/leaderboardsData";
const region = "EU";
const leaderboardId = "arena";
const seasonId = 42;

let currentPage = 1;
let totalPages = 10;
let firstFetch = true;

const fetchPage = async (page) => {
  const url = `${baseURL}?region=${region}&leaderboardId=${leaderboardId}&page=${page}&seasonId=${seasonId}`;
  try {
    const response = await axios.get(url);

    if (firstFetch) {
      totalPages = response.data.leaderboard.pagination.totalPages;
      firstFetch = false;
    }

    return response.data.leaderboard.rows;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

const addToCSV = (data) => {
  const csvRows = ["rank,accountid,rating"];
  data.forEach((row) => {
    csvRows.push(`${row.rank},${row.accountid},${row.rating}`);
  });
  fs.appendFileSync(path.join(__dirname, "leaderboardData.csv"), csvRows.join("\n"));
};

const fetchAllData = async () => {
  fs.writeFileSync(path.join(__dirname, "leaderboardData.csv"), "");
  while (currentPage <= totalPages) {
    console.log(`Fetching page ${currentPage} of ${totalPages}`);
    const rows = await fetchPage(currentPage);

    if (rows?.length) {
      addToCSV(rows);
      currentPage++;
  }
};

fetchAllData();
