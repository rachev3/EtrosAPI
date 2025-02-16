Title: Extract and Integrate Basketball Match Statistics from PDF
──────────────────────────────

Overview:
Develop a Node.js Express (type=module) service that processes a basketball match statistic PDF (see
), extracts both team-level and player-level data, checks for duplicate entries, and uploads the parsed data to the EtrosAPI database. Only admins should be permitted to perform the upload.

──────────────────────────────

Objectives
• Create a secure module (admin-only access) to accept and process a basketball statistic PDF.
• Parse and extract key data fields including overall match details, team statistics, and individual player statistics.
• Implement a duplicate check mechanism to avoid re-uploading the same match statistics, ideally using opponent and match date as criteria.
• Integrate with the existing EtrosAPI endpoints to store the extracted data.
• Provide robust error handling, logging, and testing.

────────────────────────────── 2. Requirements & Functional Specifications

A. Input and PDF Parsing
• Accept a PDF file with a layout similar to “FIBA_Box_Score_GOCh_vs_ETR_04_qnuari.pdf” (​
).
• Use a Node.js PDF parsing library (e.g., pdf-parse or pdfjs) to extract the text content.
• Identify and extract:

- Match metadata: game number, date, start time, attendance, game duration, etc.
- Team-level statistics: overall points, scoring breakdowns (points from turnovers, points in the paint, bench points, etc.), scoring intervals, etc.
- Player-level statistics: player name, minutes played, field goal stats, free throws, rebounds, assists, turnovers, steals, blocks, fouls, plus/minus, and special markers (e.g., DNP).
- Coach and team names, and any additional match summary information.

B. Data Transformation and Validation
• Map the extracted data to your database schema.
• Validate and convert numerical and date fields as needed.
• Handle edge cases such as missing data or “DNP” entries appropriately.

C. Duplicate Checking
• Implement a check to prevent duplicate uploads by comparing opponent and match date.
• Optionally, the game number (if available) may be used as an additional check, but the primary criteria should be the opponent and date.
• Decide whether to skip or update a record if a duplicate is detected.

D. API Integration
• Utilize EtrosAPI’s endpoints (see docs at https://etrosapi.onrender.com/api-docs/ and the GitHub repo) to insert new match records.
• Define endpoints for:

- Inserting new match records.
- Adding team-level statistics.
- Adding individual player statistics.
  • Ensure that all API calls include proper error handling and logging.

E. Security
• Ensure that only authenticated admin users can perform the upload.
• Implement necessary authentication middleware and authorization checks within your Express.js application.

────────────────────────────── 3. Technical Implementation

A. Environment & Tools
• Use Node.js with Express.js (type=module).
• Choose a PDF parsing library like pdf-parse or pdfjs for Node.js.
• Set up authentication/authorization (e.g., JWT, session-based) to restrict access to admin users.

B. Implementation Steps

PDF Ingestion and Parsing:
Create an API endpoint for file uploads, ensuring that the endpoint is protected for admin use.
Use your chosen PDF parsing library to extract text from the PDF.
Employ regex or parsing logic to segment the text into match metadata, team stats, and player stats.
Data Extraction & Mapping:
Identify headers (e.g., “FIBA Box Score”) and table structures in the text.
Convert string values to appropriate data types (dates, numbers, etc.).
Organize the data into objects representing match details, team statistics, and player statistics.
Duplicate Check Logic:
Before inserting a new record via the API, query the database (or call an EtrosAPI endpoint) to check for an existing match based on opponent and date.
Log and manage duplicates appropriately (either skip insertion or update the existing record).
API Communication:
Design functions to POST new match data and associated statistics.
Map your data to the API’s expected payload formats and handle responses with error-checking and retries as needed.
Testing and Logging:
Write unit and integration tests to validate the PDF parsing and data extraction.
Test duplicate record scenarios to ensure the duplicate check works correctly.
Log key events (e.g., upload attempts, duplicate detections, API responses) for monitoring and debugging.
────────────────────────────── 4. Additional Considerations

• Scalability:

Plan for concurrent PDF processing if multiple uploads are expected. Consider using asynchronous operations or job queues.
• Extensibility:

Design the parser modularly to allow for future adjustments if the PDF layout changes or new statistics need extraction.
• Security:

Strictly enforce admin-only access for the upload functionality through robust authentication and authorization strategies.
• Documentation:

Provide comprehensive inline documentation, a README, and deployment instructions.
────────────────────────────── 5. Deliverables

• A fully documented codebase including:

The secure PDF upload endpoint (admin-only).
The PDF parsing module and data extraction logic.
The duplicate check implementation.
Integration with EtrosAPI endpoints for match, team, and player data.
Comprehensive unit and integration tests.
• Deployment instructions and API documentation.

────────────────────────────── 6. Acceptance Criteria

• The service accurately extracts all match, team, and player statistics from PDFs with the provided layout (​
).
• Duplicate checking functions reliably based on opponent and match date.
• Data is correctly inserted into the database via EtrosAPI with proper error handling and logging.
• Only authenticated admin users can access the upload endpoint.
• Code is modular, well-documented, and covered by sufficient tests.
