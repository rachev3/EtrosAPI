### 🛠️ Task: Add Support for Nested Population in API

#### 📋 Summary:

Enhance the API to support **nested population** of related documents using dot notation (e.g., `populate=playerStats.player`). This will allow clients to retrieve deeply related data in a single request.

---

#### 🎯 Objectives:

- Extend the `populate` query parameter to support nested relationships using dot notation (e.g., `playerStats.player`).
- Support multiple nested fields (e.g., `playerStats,playerStats.player,playerStats.match`).
- Maintain backward compatibility with existing single-level population (e.g., `populate=player`).
- Allow combining with filtering, sorting, pagination, and selective field population if already supported.

---

#### 🧠 Example Usage:

**Request:**

```
GET /api/matches?populate=playerStats.player
```

**Expected Behavior:**
The response should include `match.playerStats`, and each `playerStats` should have its corresponding `player` data populated.

**Advanced:**

```
GET /api/matches?populate=playerStats.player,playerStats.match
```

---

#### 🔧 Technical Suggestions:

- Use Mongoose’s `.populate()` method with recursive support:
  ```js
  populate({
    path: "playerStats",
    populate: {
      path: "player",
      select: "name number position", // optional
    },
  });
  ```
- Parse the `populate` query param and dynamically build nested populate options.
- Handle cases where the same path is mentioned multiple times with different sub-paths.

---

#### ✅ Acceptance Criteria:

- API correctly handles nested population via query string.
- Works with multiple nested paths.
- Does not break existing population behavior.
- Code is clean and well-commented.

---
