import { PDFExtract } from "pdf.js-extract";

/**
 * Main function to parse basketball match statistics from PDF
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<Object>} Parsed match data
 */
export const parseMatchStatistics = async (pdfBuffer) => {
  try {
    const pdfExtract = new PDFExtract();
    const options = {}; // Use default options

    // Extract text from PDF
    const data = await pdfExtract.extractBuffer(pdfBuffer, options);

    // Group items by their y-position to preserve rows
    const yPositions = new Map();
    data.pages.forEach((page) => {
      page.content.forEach((item) => {
        const y = Math.round(item.y); // Round to handle minor differences
        if (!yPositions.has(y)) {
          yPositions.set(y, []);
        }
        yPositions.get(y).push(item);
      });
    });

    // Sort by y position and then x position within each row
    const lines = Array.from(yPositions.entries())
      .sort(([y1], [y2]) => y1 - y2)
      .map(([_, items]) =>
        items
          .sort((a, b) => a.x - b.x)
          .map((item) => item.str)
          .join(" ")
      );

    // Extract basic match information
    const matchInfo = extractMatchInfo(lines);

    // Extract team statistics
    const teamStats = extractTeamStats(lines, matchInfo.isEtrosHome);

    // Extract player statistics only for Етрос
    const etrosPlayers = extractPlayerStats(lines);

    // Structure the return data to match controller expectations
    return {
      metadata: {
        date: matchInfo.date,
        venue: matchInfo.venue,
        gameNo: matchInfo.gameNumber,
        attendance: matchInfo.attendance,
        duration: matchInfo.duration,
        isEtrosHome: matchInfo.isEtrosHome,
      },
      homeTeam: matchInfo.isEtrosHome
        ? {
            name: "Етрос",
            score: matchInfo.etrosScore,
            players: etrosPlayers,
          }
        : {
            name: matchInfo.opponent,
            score: matchInfo.opponentScore,
          },
      awayTeam: matchInfo.isEtrosHome
        ? {
            name: matchInfo.opponent,
            score: matchInfo.opponentScore,
          }
        : {
            name: "Етрос",
            score: matchInfo.etrosScore,
            players: etrosPlayers,
          },
      teamStats: teamStats,
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

/**
 * Extract basic match information from the text lines
 * @param {string[]} lines - Array of text lines from the PDF
 * @returns {Object} Basic match information
 */
const extractMatchInfo = (lines) => {
  let matchInfo = {
    date: null,
    venue: null,
    opponent: null,
    etrosScore: null,
    opponentScore: null,
    gameNumber: null,
    attendance: null,
    duration: null,
    isEtrosHome: null,
  };

  for (const line of lines) {
    // Try to find the game number
    const gameNoMatch = line.match(/Game No\.:\s*(\d+)/i);
    if (gameNoMatch) {
      matchInfo.gameNumber = gameNoMatch[1];
    }

    // Try to find the attendance
    const attendanceMatch = line.match(/Attendance:\s*(\d+)/i);
    if (attendanceMatch) {
      matchInfo.attendance = parseInt(attendanceMatch[1]);
    }

    // Try to find the duration
    const durationMatch = line.match(/Game Duration:\s*(\d{2}):(\d{2})/i);
    if (durationMatch) {
      matchInfo.duration = `${durationMatch[1]}:${durationMatch[2]}`;
    }

    // Try to find the score line and determine if Етрос is home or away
    const scoreMatch = line.match(/(\S+)\s+(\d+)\s*[–-]\s*(\d+)\s+(\S+)/);
    if (scoreMatch) {
      const team1 = scoreMatch[1].trim();
      const score1 = parseInt(scoreMatch[2]);
      const score2 = parseInt(scoreMatch[3]);
      const team2 = scoreMatch[4].trim();

      if (team1 === "Етрос") {
        matchInfo.isEtrosHome = true;
        matchInfo.etrosScore = score1;
        matchInfo.opponentScore = score2;
        matchInfo.opponent = team2;
      } else if (team2 === "Етрос") {
        matchInfo.isEtrosHome = false;
        matchInfo.etrosScore = score2;
        matchInfo.opponentScore = score1;
        matchInfo.opponent = team1;
      }
    }

    // Try to find the date and venue
    const dateMatch = line.match(
      /([^,]+),\s*(\w+)\s+(\d{1,2})\s+(\w+)\s+(\d{4})/i
    );
    if (dateMatch) {
      matchInfo.venue = dateMatch[1].trim();
      const day = dateMatch[3];
      const month = dateMatch[4];
      const year = dateMatch[5];

      // Create date object
      try {
        matchInfo.date = new Date(`${month} ${day}, ${year}`);
        if (isNaN(matchInfo.date.getTime())) {
          // If date is invalid, try with month mapping
          const monthMap = {
            jan: 0,
            january: 0,
            qnuari: 0,
            feb: 1,
            february: 1,
            februari: 1,
            mar: 2,
            march: 2,
            mart: 2,
            apr: 3,
            april: 3,
            may: 4,
            mai: 4,
            jun: 5,
            june: 5,
            juni: 5,
            jul: 6,
            july: 6,
            juli: 6,
            aug: 7,
            august: 7,
            avgust: 7,
            sep: 8,
            september: 8,
            septemvri: 8,
            oct: 9,
            october: 9,
            oktomvri: 9,
            nov: 10,
            november: 10,
            noemvri: 10,
            dec: 11,
            december: 11,
            dekemvri: 11,
          };

          const monthNum = monthMap[month.toLowerCase()];
          if (monthNum !== undefined) {
            matchInfo.date = new Date(parseInt(year), monthNum, parseInt(day));
          }
        }
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    }

    // Try to find start time
    const timeMatch = line.match(/Start time:\s*(\d{2}):(\d{2})/i);
    if (timeMatch && matchInfo.date) {
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      matchInfo.date.setHours(hours, minutes);
    }
  }

  // Validate required fields
  if (
    !matchInfo.date ||
    !matchInfo.opponent ||
    matchInfo.isEtrosHome === null
  ) {
    throw new Error(
      "Missing required match information (date, opponent, or team positions)"
    );
  }

  return matchInfo;
};

/**
 * Extract team statistics from the text lines
 * @param {string[]} lines - Array of text lines from the PDF
 * @param {boolean} isEtrosHome - Whether Етрос is the home team
 * @returns {Object} Team statistics
 */
const extractTeamStats = (lines, isEtrosHome) => {
  const stats = {
    fieldGoalsMade: 0,
    fieldGoalsAttempted: 0,
    twoPointsMade: 0,
    twoPointsAttempted: 0,
    threePointsMade: 0,
    threePointsAttempted: 0,
    freeThrowsMade: 0,
    freeThrowsAttempted: 0,
    offensiveRebounds: 0,
    defensiveRebounds: 0,
    totalAssists: 0,
    totalSteals: 0,
    totalBlocks: 0,
    totalTurnovers: 0,
    totalFouls: 0,
    totalPoints: 0,
  };

  // Find both Totals lines
  const totalsLines = lines.filter(
    (line) =>
      line.trim().startsWith("Totals") &&
      (line.includes("200:00") || line.includes("225:00"))
  );

  if (totalsLines.length === 2) {
    // Get the correct Totals line based on whether Етрос is home or away
    const totalsLine = totalsLines[isEtrosHome ? 0 : 1];

    try {
      // Split the line by spaces and filter out empty strings
      const parts = totalsLine.split(/\s+/).filter(Boolean);

      // Find the index of time (either 200:00 or 225:00)
      const timeIndex = parts.findIndex(
        (part) => part === "200:00" || part === "225:00"
      );

      if (timeIndex !== -1) {
        // Field Goals
        const [fgm, fga] = parts[timeIndex + 1].split("/").map(Number);
        stats.fieldGoalsMade = fgm;
        stats.fieldGoalsAttempted = fga;

        // Two Points (skip percentage)
        const [twopm, twopa] = parts[timeIndex + 3].split("/").map(Number);
        stats.twoPointsMade = twopm;
        stats.twoPointsAttempted = twopa;

        // Three Points (skip percentage)
        const [threepm, threepa] = parts[timeIndex + 5].split("/").map(Number);
        stats.threePointsMade = threepm;
        stats.threePointsAttempted = threepa;

        // Free Throws (skip percentage)
        const [ftm, fta] = parts[timeIndex + 7].split("/").map(Number);
        stats.freeThrowsMade = ftm;
        stats.freeThrowsAttempted = fta;

        // Individual stats (after all shooting stats and percentages)
        const statsStart = timeIndex + 9;
        stats.offensiveRebounds = Number(parts[statsStart]);
        stats.defensiveRebounds = Number(parts[statsStart + 1]);
        // Skip total rebounds
        stats.totalAssists = Number(parts[statsStart + 3]);
        stats.totalTurnovers = Number(parts[statsStart + 4]);
        stats.totalSteals = Number(parts[statsStart + 5]);
        stats.totalBlocks = Number(parts[statsStart + 6]);
        stats.totalFouls = Number(parts[statsStart + 7]);
        stats.totalPoints = Number(parts[parts.length - 1]);
      }
    } catch (error) {
      console.error("Error parsing team stats:", error);
    }
  }

  return stats;
};

/**
 * Extract player statistics from the text lines
 * @param {string[]} lines - Array of text lines from the PDF
 * @returns {Array} Player statistics for Етрос team
 */
const extractPlayerStats = (lines) => {
  const players = [];
  let isEtrosSection = false;
  let currentPlayer = null;

  for (const line of lines) {
    // Check if we're in the Етрос section
    if (line.includes("Етрос") && line.includes("(ЕТР)")) {
      isEtrosSection = true;
      continue;
    }

    // Check if we've reached the end of Етрос section
    if (
      isEtrosSection &&
      (line.includes("Coach:") || line.includes("Totals"))
    ) {
      isEtrosSection = false;
      // Add the last player if exists
      if (currentPlayer) {
        players.push(currentPlayer);
        currentPlayer = null;
      }
      continue;
    }

    // Only process lines in the Етрос section
    if (!isEtrosSection) {
      continue;
    }

    // Skip header lines and empty lines
    if (
      line.includes("No.") ||
      line.includes("Team/Coach") ||
      !line.trim() ||
      line.includes("Field Goals") ||
      line.includes("M/A")
    ) {
      continue;
    }

    // Start collecting player stats when we see a player number
    const playerMatch = line.match(/^\s*\*?\d+\s+([^0-9]+)/);
    if (playerMatch) {
      // Add previous player if exists
      if (currentPlayer) {
        players.push(currentPlayer);
      }

      // Extract player number
      const numberMatch = line.match(/^\s*\*?(\d+)/);
      const number = numberMatch ? numberMatch[1] : "";

      // Extract name and clean it
      const name = playerMatch[1].trim().replace(/\s*\(C\)/, "");

      currentPlayer = {
        number,
        name,
        didNotPlay: line.includes("DNP"),
      };

      if (!currentPlayer.didNotPlay) {
        // Parse the rest of the line for stats
        const stats = line.substring(playerMatch[0].length).trim().split(/\s+/);

        // First part is minutes
        currentPlayer.minutes = stats[0];

        // Next are the shooting stats (M/A %)
        const fgParts = stats[1].split("/");
        const twoParts = stats[3].split("/");
        const threeParts = stats[5].split("/");
        const ftParts = stats[7].split("/");

        currentPlayer.fieldGoals = {
          made: parseInt(fgParts[0]),
          attempts: parseInt(fgParts[1]),
          percentage: stats[2],
        };

        currentPlayer.twoPoints = {
          made: parseInt(twoParts[0]),
          attempts: parseInt(twoParts[1]),
          percentage: stats[4],
        };

        currentPlayer.threePoints = {
          made: parseInt(threeParts[0]),
          attempts: parseInt(threeParts[1]),
          percentage: stats[6],
        };

        currentPlayer.freeThrows = {
          made: parseInt(ftParts[0]),
          attempts: parseInt(ftParts[1]),
          percentage: stats[8],
        };

        // After shooting stats come rebounds
        const reboundStartIndex = 9;
        currentPlayer.rebounds = {
          offensive: parseInt(stats[reboundStartIndex]) || 0,
          defensive: parseInt(stats[reboundStartIndex + 1]) || 0,
          total: parseInt(stats[reboundStartIndex + 2]) || 0,
        };

        // Individual stats
        currentPlayer.assists = parseInt(stats[reboundStartIndex + 3]) || 0;
        currentPlayer.turnovers = parseInt(stats[reboundStartIndex + 4]) || 0;
        currentPlayer.steals = parseInt(stats[reboundStartIndex + 5]) || 0;
        currentPlayer.blocks = parseInt(stats[reboundStartIndex + 6]) || 0;
        currentPlayer.fouls = {
          personal: parseInt(stats[reboundStartIndex + 7]) || 0,
          drawn: parseInt(stats[reboundStartIndex + 8]) || 0,
        };
        currentPlayer.plusMinus = parseInt(stats[reboundStartIndex + 9]) || 0;
        currentPlayer.efficiency = parseInt(stats[reboundStartIndex + 10]) || 0;
        currentPlayer.points = parseInt(stats[reboundStartIndex + 11]) || 0;
      }
    }
  }

  // Don't forget to add the last player
  if (currentPlayer) {
    players.push(currentPlayer);
  }

  return players;
};

/**
 * Parse a shooting statistic (made/attempted)
 * @param {string} stat - Shooting statistic string (e.g., "3/7")
 * @returns {Object} Parsed shooting statistics
 */
const parseShootingStat = (stat) => {
  if (!stat || !stat.includes("/")) {
    return { made: 0, attempts: 0, percentage: 0 };
  }

  const [made, attempts] = stat.split("/").map(Number);
  return {
    made,
    attempts,
    percentage: attempts > 0 ? ((made / attempts) * 100).toFixed(1) : 0,
  };
};
