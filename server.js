const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

const db = new sqlite3.Database('C:\\Users\\shait\\OneDrive\\Desktop\\user_data_base\\user_data.db');


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(express.static(path.join(__dirname, "Online-Education-Platform")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Online-Education-Platform", "login.html"));
});



app.post("/dashboard", (req, res) => {
    const { username, password } = req.body;

   
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err || !row) {
            return res.status(400).send("Invalid credentials");
        }
        res.sendFile(path.join(__dirname, "Online-Education-Platform", "dashboard.html"));
    });
});




// Handle registration form submission (POST request)
app.post("/", (req, res) => {
    const { username, email, password } = req.body;
    console.log("Received Data:", req.body); // This is for checking the form data
    
    if (!username || !email || !password) {
        return res.status(400).send("All fields are required");
    }

    

    const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    stmt.run(username, email, password, function (err) {
        if (err) {
            console.error("Database Error:", err.message);
            return res.status(500).send("Error inserting user into database");
        }
        res.redirect("/");
    });
    stmt.finalize();
});




//COURSE ENTROLLEMENT 

app.post('/enroll', async (req, res) => {
    const { userId, courseName } = req.body;

    try {
        // Fetch the user's current enrolled courses
        const query = 'SELECT enrolled_courses FROM users WHERE id = ?';
        const [results] = await db.query(query, [userId]);

        let enrolledCourses = results[0].enrolled_courses || '';

        // Append the new course
        if (enrolledCourses) {
            enrolledCourses += `,${courseName}`;
        } else {
            enrolledCourses = courseName;
        }

        // Update the user's enrolled courses
        const updateQuery = 'UPDATE users SET enrolled_courses = ? WHERE id = ?';
        await db.query(updateQuery, [enrolledCourses, userId]);

        res.status(200).json({ message: 'Enrollment successful' });
    } catch (error) {
        console.error('Error during enrollment:', error);
        res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
});





// Start the server
app.listen(3005, () => {
    console.log("Server is running on http://localhost:3005");
});
