# Assignment: Enhance Basketball API with Advanced Query Features

## Overview

Our current RESTful API for the basketball team application supports basic CRUD operations on models such as Articles, Players, Matches, and PlayerStats. Your assignment is to extend the API by implementing advanced query features that allow for flexible data retrieval. These enhancements include:

- **Filtering:** Allow clients to narrow down results based on model attributes.
- **Sorting:** Enable clients to order results based on one or more fields.
- **Pagination:** Support retrieving data in manageable chunks.
- **Populating Relations (Optional):** Provide an option to include related data (for example, player details within player statistics).

---

## Detailed Requirements

### 1. Filtering

- **Objective:** Implement a mechanism to filter data based on query parameters.
- **What to Do:**
  - Accept query parameters that correspond to the model’s fields.
  - Support advanced filtering operators, such as greater than, less than, and their inclusive variants.
  - Ensure that the API parses these parameters and applies the corresponding filters to the data retrieval process.
- **Example Use Case:** A client may want to retrieve players who play a specific position or who are above a certain age.

### 2. Sorting

- **Objective:** Allow clients to sort the results returned by the API.
- **What to Do:**
  - Introduce a query parameter that specifies the sorting criteria.
  - Support both ascending and descending order through a simple notation (for example, a prefix to indicate descending order).
  - Make sure that the API can sort on multiple fields if needed.
- **Example Use Case:** A client could request player statistics ordered by points scored in descending order, followed by rebounds.

### 3. Pagination

- **Objective:** Implement pagination to manage large sets of data efficiently.
- **What to Do:**
  - Use query parameters to determine the page number and the number of records per page.
  - Calculate and apply the correct offset (skip) based on the current page.
  - Optionally, return additional metadata like the total number of pages or records.
- **Example Use Case:** When retrieving articles, clients should be able to request a specific page with a defined number of articles per page.

### 4. Optional Population of Relations

- **Objective:** Allow the API to include related data in the response when requested, but make it optional.
- **What to Do:**
  - Provide a way for clients to request that certain relations be populated (for example, including player information within player statistics).
  - Ensure that if the client does not request population, the API returns only the primary model data.
  - The implementation should avoid unnecessary data fetching unless explicitly requested by the client.
- **Example Use Case:** A client may request player statistics with the associated player’s details (like name, age, and position) only when needed.

---

## Implementation Guidelines

- **Utility Class Approach:**  
  Consider creating a reusable utility (or helper class) that encapsulates the functionality for filtering, sorting, and pagination. This class should be chainable so that each of the features can be applied in sequence to the database query.

- **Optional Population:**  
  Design the solution so that relation population is triggered only when the client explicitly indicates it. This could be done by checking for a specific query parameter. If the parameter is not present, the API should return just the base data.

- **Consistency Across Models:**  
  Ensure that the advanced query features work uniformly across all endpoints (Articles, Players, Matches, PlayerStats). For models like PlayerStats that naturally involve related data, document clearly how the optional population can be activated.

---

- **Documentation:**  
  Update the API documentation to include:
  - A detailed explanation of each new query parameter.
  - Examples of requests and responses demonstrating filtering, sorting, pagination, and optional population.
  - Guidance on how to enable relation population when needed.
