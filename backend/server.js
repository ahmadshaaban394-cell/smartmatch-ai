const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= FILES ================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/* ================= DB ================= */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "smartmatch_ai",
});

db.connect((err) => {
  if (err) {
    console.log("DB Error ❌", err);
  } else {
    console.log("MySQL Connected ✅");
  }
});

/* ================= AUTH ================= */

app.post("/signup", (req, res) => {
  const { email, password, role, company_name } = req.body;

  if (!email || !password || !role) {
    return res.json({ success: false, message: "Missing required fields" });
  }

  const checkSql = "SELECT * FROM users WHERE email = ?";
  db.query(checkSql, [email], (err, result) => {
    if (err) {
      return res.json({ success: false, message: "DB error" });
    }

    if (result.length > 0) {
      return res.json({ success: false, message: "Email already exists" });
    }

    const insertUserSql =
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)";

    db.query(insertUserSql, [email, password, role], (err2, userResult) => {
      if (err2) {
        return res.json({ success: false, message: "User insert failed" });
      }

      const userId = userResult.insertId;

      if (role === "client") {
        const insertClientSql =
          "INSERT INTO clients (user_id, company_name) VALUES (?, ?)";

        db.query(
          insertClientSql,
          [userId, company_name || null],
          (err3) => {
            if (err3) {
              return res.json({
                success: false,
                message: "Client insert failed",
              });
            }

            return res.json({ success: true, user_id: userId });
          }
        );
      } else {
        return res.json({ success: true, user_id: userId });
      }
    });
  });
});

app.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.json({ success: false, message: "Missing required fields" });
  }

  const sql = "SELECT * FROM users WHERE email=? AND password=? AND role=?";
  db.query(sql, [email, password, role], (err, result) => {
    if (err) {
      return res.json({ success: false, message: "DB error" });
    }

    if (result.length > 0) {
      return res.json({ success: true, user: result[0] });
    } else {
      return res.json({ success: false, message: "Wrong credentials" });
    }
  });
});

/* ================= PROFILES ================= */

app.get("/profile/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = "SELECT * FROM profiles WHERE user_id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      return res.json({ success: false, message: "DB error" });
    }

    if (result.length > 0) {
      return res.json({ success: true, profile: result[0] });
    } else {
      return res.json({ success: true, profile: null });
    }
  });
});

app.post("/profile", (req, res) => {
  const { user_id, full_name, bio, location, phone_number } = req.body;

  if (!user_id) {
    return res.json({ success: false, message: "Missing user_id" });
  }

  const checkSql = "SELECT * FROM profiles WHERE user_id = ?";
  db.query(checkSql, [user_id], (err, result) => {
    if (err) {
      return res.json({ success: false, message: "DB error" });
    }

    if (result.length > 0) {
      const updateSql = `
        UPDATE profiles
        SET full_name=?, bio=?, location=?, phone_number=?
        WHERE user_id=?
      `;

      db.query(
        updateSql,
        [full_name, bio, location, phone_number, user_id],
        (err2) => {
          if (err2) {
            return res.json({ success: false, message: "Profile update failed" });
          }

          return res.json({ success: true, message: "Profile updated" });
        }
      );
    } else {
      const insertSql = `
        INSERT INTO profiles (user_id, full_name, bio, location, phone_number)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [user_id, full_name, bio, location, phone_number],
        (err2) => {
          if (err2) {
            return res.json({ success: false, message: "Profile insert failed" });
          }

          return res.json({ success: true, message: "Profile created" });
        }
      );
    }
  });
});

app.post("/profile/upload-picture", upload.single("image"), (req, res) => {
  const { user_id } = req.body;

  if (!req.file || !user_id) {
    return res.json({
      success: false,
      message: "Missing image or user_id",
    });
  }

  const imagePath = `/uploads/${req.file.filename}`;

  const checkSql = "SELECT * FROM profiles WHERE user_id = ?";
  db.query(checkSql, [user_id], (err, result) => {
    if (err) {
      return res.json({ success: false, message: "DB error" });
    }

    if (result.length > 0) {
      const sql = "UPDATE profiles SET profile_picture=? WHERE user_id=?";
      db.query(sql, [imagePath, user_id], (err2) => {
        if (err2) {
          return res.json({
            success: false,
            message: "Failed to save profile picture",
          });
        }

        return res.json({ success: true, profile_picture: imagePath });
      });
    } else {
      const insertSql = `
        INSERT INTO profiles (user_id, profile_picture)
        VALUES (?, ?)
      `;
      db.query(insertSql, [user_id, imagePath], (err2) => {
        if (err2) {
          return res.json({
            success: false,
            message: "Failed to create profile picture record",
          });
        }

        return res.json({ success: true, profile_picture: imagePath });
      });
    }
  });
});

/* ================= FREELANCER ================= */

app.post("/freelancer/profile", (req, res) => {
  const { user_id, expected_salary, availability, location } = req.body;

  if (!user_id) {
    return res.json({ success: false, message: "Missing user_id" });
  }

  const checkSql = "SELECT * FROM freelancers WHERE user_id = ?";
  db.query(checkSql, [user_id], (err, result) => {
    if (err) {
      return res.json({ success: false, message: "DB error" });
    }

    if (result.length > 0) {
      const updateSql = `
        UPDATE freelancers
        SET expected_salary=?, availability=?, location=?
        WHERE user_id=?
      `;

      db.query(
        updateSql,
        [expected_salary, availability, location, user_id],
        (err2) => {
          if (err2) {
            return res.json({ success: false, message: "Update failed" });
          }

          db.query(
            "SELECT id FROM freelancers WHERE user_id=?",
            [user_id],
            (err3, rows) => {
              if (err3 || rows.length === 0) {
                return res.json({
                  success: false,
                  message: "Freelancer fetch failed",
                });
              }

              return res.json({
                success: true,
                freelancer_id: rows[0].id,
              });
            }
          );
        }
      );
    } else {
      const insertSql = `
        INSERT INTO freelancers (user_id, expected_salary, availability, location)
        VALUES (?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [user_id, expected_salary, availability, location],
        (err2, insertResult) => {
          if (err2) {
            return res.json({ success: false, message: "Insert failed" });
          }

          return res.json({
            success: true,
            freelancer_id: insertResult.insertId,
          });
        }
      );
    }
  });
});

app.post("/freelancer/upload-pdf", upload.single("pdf"), (req, res) => {
  const { freelancer_id } = req.body;

  if (!req.file || !freelancer_id) {
    return res.json({
      success: false,
      message: "Missing file or freelancer_id",
    });
  }

  const pdfPath = `/uploads/${req.file.filename}`;
  const sql = "UPDATE freelancers SET pdf_path=? WHERE id=?";

  db.query(sql, [pdfPath, freelancer_id], (err) => {
    if (err) {
      return res.json({
        success: false,
        message: "Failed to save PDF path",
      });
    }

    return res.json({ success: true, pdf_path: pdfPath });
  });
});

app.post("/freelancer/skill", (req, res) => {
  const { freelancer_id, skill } = req.body;

  if (!freelancer_id || !skill) {
    return res.json({ success: false, message: "Missing fields" });
  }

  const checkSkillSql = "SELECT * FROM skills WHERE skill_name = ?";
  db.query(checkSkillSql, [skill], (err, result) => {
    if (err) {
      return res.json({ success: false, message: "DB error" });
    }

    if (result.length > 0) {
      const skillId = result[0].id;

      const linkSql =
        "INSERT IGNORE INTO freelancer_skills (freelancer_id, skill_id) VALUES (?, ?)";

      db.query(linkSql, [freelancer_id, skillId], (err2) => {
        if (err2) {
          return res.json({ success: false, message: "Skill link failed" });
        }

        return res.json({ success: true });
      });
    } else {
      const insertSkillSql = "INSERT INTO skills (skill_name) VALUES (?)";

      db.query(insertSkillSql, [skill], (err2, skillResult) => {
        if (err2) {
          return res.json({ success: false, message: "Skill insert failed" });
        }

        const skillId = skillResult.insertId;
        const linkSql =
          "INSERT IGNORE INTO freelancer_skills (freelancer_id, skill_id) VALUES (?, ?)";

        db.query(linkSql, [freelancer_id, skillId], (err3) => {
          if (err3) {
            return res.json({ success: false, message: "Skill link failed" });
          }

          return res.json({ success: true });
        });
      });
    }
  });
});

app.get("/jobs/latest", (req, res) => {
  const sql = `
    SELECT jobs.*, clients.company_name
    FROM jobs
    LEFT JOIN clients ON jobs.client_id = clients.id
    ORDER BY jobs.id DESC
    LIMIT 5
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.json([]);
    }

    return res.json(result);
  });
});

/* ================= CLIENT / JOBS ================= */

app.post("/client/job", (req, res) => {
  const {
    user_id,
    company_name,
    title,
    description,
    budget_min,
    budget_max,
    location,
  } = req.body;

  if (!user_id || !title || !location || !description) {
    return res.json({
      success: false,
      message: "Please fill in title, location, and description",
    });
  }

  const clientSql = "SELECT * FROM clients WHERE user_id = ?";

  db.query(clientSql, [user_id], (err, result) => {
    if (err) {
      return res.json({ success: false, message: "DB error" });
    }

    const insertJobForClient = (clientId) => {
      const jobSql = `
        INSERT INTO jobs (client_id, title, description, budget_min, budget_max, location)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        jobSql,
        [clientId, title, description, budget_min, budget_max, location],
        (err2, jobResult) => {
          if (err2) {
            return res.json({ success: false, message: "Job insert failed" });
          }

          return res.json({
            success: true,
            job_id: jobResult.insertId,
          });
        }
      );
    };

    if (result.length > 0) {
      insertJobForClient(result[0].id);
    } else {
      const insertClientSql =
        "INSERT INTO clients (user_id, company_name) VALUES (?, ?)";

      db.query(
        insertClientSql,
        [user_id, company_name || null],
        (err2, clientResult) => {
          if (err2) {
            return res.json({
              success: false,
              message: "Client insert failed",
            });
          }

          insertJobForClient(clientResult.insertId);
        }
      );
    }
  });
});

app.get("/client/latest-job/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT jobs.*
    FROM jobs
    JOIN clients ON jobs.client_id = clients.id
    WHERE clients.user_id = ?
    ORDER BY jobs.id DESC
    LIMIT 1
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      return res.json({ success: false, message: "DB error" });
    }

    if (result.length > 0) {
      return res.json({ success: true, job: result[0] });
    } else {
      return res.json({ success: true, job: null });
    }
  });
});

app.post("/job/upload-pdf", upload.single("pdf"), (req, res) => {
  const { job_id } = req.body;

  if (!req.file || !job_id) {
    return res.json({
      success: false,
      message: "Missing file or job_id",
    });
  }

  const pdfPath = `/uploads/${req.file.filename}`;
  const sql = "UPDATE jobs SET pdf_path=? WHERE id=?";

  db.query(sql, [pdfPath, job_id], (err) => {
    if (err) {
      return res.json({
        success: false,
        message: "Failed to save PDF path",
      });
    }

    return res.json({ success: true, pdf_path: pdfPath });
  });
});

app.post("/job/skill", (req, res) => {
  const { job_id, skill } = req.body;

  if (!job_id || !skill) {
    return res.json({ success: false, message: "Missing fields" });
  }

  const checkSkillSql = "SELECT * FROM skills WHERE skill_name = ?";
  db.query(checkSkillSql, [skill], (err, result) => {
    if (err) {
      return res.json({ success: false, message: "DB error" });
    }

    if (result.length > 0) {
      const skillId = result[0].id;

      const linkSql =
        "INSERT IGNORE INTO job_required_skills (job_id, skill_id) VALUES (?, ?)";

      db.query(linkSql, [job_id, skillId], (err2) => {
        if (err2) {
          return res.json({ success: false, message: "Skill link failed" });
        }

        return res.json({ success: true });
      });
    } else {
      const insertSkillSql = "INSERT INTO skills (skill_name) VALUES (?)";

      db.query(insertSkillSql, [skill], (err2, skillResult) => {
        if (err2) {
          return res.json({ success: false, message: "Skill insert failed" });
        }

        const skillId = skillResult.insertId;
        const linkSql =
          "INSERT IGNORE INTO job_required_skills (job_id, skill_id) VALUES (?, ?)";

        db.query(linkSql, [job_id, skillId], (err3) => {
          if (err3) {
            return res.json({ success: false, message: "Skill link failed" });
          }

          return res.json({ success: true });
        });
      });
    }
  });
});

app.get("/freelancers/latest", (req, res) => {
  const sql = `
    SELECT 
      freelancers.id,
      freelancers.user_id,
      freelancers.expected_salary,
      freelancers.availability,
      freelancers.location,
      profiles.phone_number,
      freelancers.created_at
    FROM freelancers
    LEFT JOIN profiles ON freelancers.user_id = profiles.user_id
    ORDER BY freelancers.id DESC
    LIMIT 5
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.json([]);
    }

    return res.json(result);
  });
});

/* ================= APPLICATIONS ================= */

app.post("/apply", (req, res) => {
  const { freelancer_id, job_id } = req.body;

  if (!freelancer_id || !job_id) {
    return res.json({ success: false, message: "Missing fields" });
  }

  const checkSql =
    "SELECT * FROM applications WHERE freelancer_id=? AND job_id=?";

  db.query(checkSql, [freelancer_id, job_id], (err, result) => {
    if (err) {
      return res.json({ success: false, message: "DB error" });
    }

    if (result.length > 0) {
      return res.json({
        success: false,
        message: "You already applied for this job",
      });
    }

    const sql =
      "INSERT INTO applications (freelancer_id, job_id, status) VALUES (?, ?, 'pending')";

    db.query(sql, [freelancer_id, job_id], (err2, insertResult) => {
      if (err2) {
        return res.json({ success: false, message: "Apply failed" });
      }

      return res.json({
        success: true,
        application_id: insertResult.insertId,
        message: "Application submitted successfully",
      });
    });
  });
});

app.get("/applications/freelancer/:freelancerId", (req, res) => {
  const { freelancerId } = req.params;

  const sql = `
    SELECT 
      applications.id,
      applications.status,
      applications.created_at,
      jobs.title,
      jobs.description,
      jobs.location,
      jobs.budget_min,
      jobs.budget_max
    FROM applications
    JOIN jobs ON applications.job_id = jobs.id
    WHERE applications.freelancer_id = ?
    ORDER BY applications.created_at DESC
  `;

  db.query(sql, [freelancerId], (err, result) => {
    if (err) {
      return res.json([]);
    }

    return res.json(result);
  });
});

app.get("/applications/job/:jobId", (req, res) => {
  const { jobId } = req.params;

  const sql = `
    SELECT 
      applications.id,
      applications.status,
      applications.created_at,
      freelancers.id AS freelancer_id,
      freelancers.expected_salary,
      freelancers.availability,
      freelancers.location,
      profiles.phone_number
    FROM applications
    JOIN freelancers ON applications.freelancer_id = freelancers.id
    LEFT JOIN profiles ON freelancers.user_id = profiles.user_id
    WHERE applications.job_id = ?
    ORDER BY applications.created_at DESC
  `;

  db.query(sql, [jobId], (err, result) => {
    if (err) {
      return res.json([]);
    }

    return res.json(result);
  });
});

app.put("/applications/:applicationId/status", (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.json({ success: false, message: "Missing status" });
  }

  const allowedStatuses = ["pending", "accepted", "rejected"];
  if (!allowedStatuses.includes(status)) {
    return res.json({ success: false, message: "Invalid status" });
  }

  const sql = "UPDATE applications SET status=? WHERE id=?";

  db.query(sql, [status, applicationId], (err) => {
    if (err) {
      return res.json({ success: false, message: "Update failed" });
    }

    return res.json({ success: true, message: "Status updated successfully" });
  });
});

/* ================= MATCHES ================= */

app.get("/matches/freelancer/:freelancerId", (req, res) => {
  const { freelancerId } = req.params;

  const sql = `
    SELECT matches.*, jobs.title, jobs.location, jobs.budget_min, jobs.budget_max
    FROM matches
    JOIN jobs ON matches.job_id = jobs.id
    WHERE matches.freelancer_id = ?
    ORDER BY matches.match_score DESC
  `;

  db.query(sql, [freelancerId], (err, result) => {
    if (err) {
      return res.json([]);
    }

    return res.json(result);
  });
});

app.get("/matches/job/:jobId", (req, res) => {
  const { jobId } = req.params;

  const sql = `
    SELECT 
      matches.*,
      freelancers.location,
      freelancers.expected_salary,
      freelancers.availability,
      profiles.phone_number
    FROM matches
    JOIN freelancers ON matches.freelancer_id = freelancers.id
    LEFT JOIN profiles ON freelancers.user_id = profiles.user_id
    WHERE matches.job_id = ?
    ORDER BY matches.match_score DESC
  `;

  db.query(sql, [jobId], (err, result) => {
    if (err) {
      return res.json([]);
    }

    return res.json(result);
  });
});

app.get("/applications/client/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT
      applications.id,
      applications.status,
      applications.created_at,
      applications.job_id,
      jobs.title,
      jobs.location AS job_location,
      freelancers.id AS freelancer_id,
      freelancers.expected_salary,
      freelancers.availability,
      freelancers.location AS freelancer_location,
      profiles.phone_number
    FROM applications
    JOIN jobs ON applications.job_id = jobs.id
    JOIN clients ON jobs.client_id = clients.id
    JOIN freelancers ON applications.freelancer_id = freelancers.id
    LEFT JOIN profiles ON freelancers.user_id = profiles.user_id
    WHERE clients.user_id = ?
    ORDER BY applications.created_at DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      return res.json([]);
    }

    return res.json(result);
  });
});

/* ================= SERVER ================= */
app.listen(8000, () => {
  console.log("Server running on port 8000 🔥");
});