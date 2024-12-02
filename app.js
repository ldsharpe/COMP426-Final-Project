const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const db = require('./database'); // Import the SQLite database connection
const path = require('path');

const app = express();

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Middleware for managing sessions
app.use(session({
  secret: 'appleapplesauce', // Replace with a secure, random key
  resave: false,
  saveUninitialized: false,
}));

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to check if a user is authenticated
function checkAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login'); // Redirect to login if not authenticated
}

// Route for displaying the registration form
app.get('/register', (req, res) => {
  const error = req.query.error || ''; // Get error message from query string if present
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Register</title>
        <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f6f9;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        .container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            padding: 30px;
            width: 100%;
            max-width: 350px;
        }

        h2 {
            text-align: center;
            color: #333;
            margin-bottom: 20px;
            font-size: 22px;
        }

        label {
            font-size: 14px;
            margin-bottom: 8px;
            color: #555;
        }

        input[type="text"], input[type="password"] {
            width: 100%;
            padding: 10px;
            margin-top: 8px;
            border: 2px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
            transition: border 0.3s ease;
        }

        input[type="text"]:focus, input[type="password"]:focus {
            border-color: #6c8c9c;
            outline: none;
        }

        button {
            width: 100%;
            padding: 10px;
            background-color: #488286;
            color: white;
            font-size: 14px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 20px;
            transition: background-color 0.3s ease;
        }

        button:hover {
            background-color: #3a6a6a;
        }

        .error {
            color: red;
            font-size: 14px;
            text-align: center;
            margin-top: 20px;
        }

        p {
            text-align: center;
            margin-top: 20px;
        }

        p a {
            color: #488286;
            text-decoration: none;
            font-weight: bold;
        }

        p a:hover {
            text-decoration: underline;
        }
    </style>
    </head>
    <body>
         <div class="container">
        <h2>Register</h2>
        <form action="/register" method="POST" autocomplete="off">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required autocomplete="off">

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required autocomplete="off">

            <button type="submit">Register</button>
        </form>
        ${error ? `<p class="error">${error}</p>` : ''}
        <p>Already have an account? <a href="/login">Log in here</a>.</p>
    </body>
    </html>
  `);
});

// Handle form submission (register user)
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Check if the username already exists
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).send('Error querying database');
    }
    if (user) {
      // If the username already exists, redirect to register page with error message in the query string
      return res.redirect('/register?error=Username%20already%20exists');
    }

    // Hash the password if username is available
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).send('Error hashing password');
      }

      // Insert the username and hashed password into the database
      db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashedPassword], function(err) {
        if (err) {
          return res.status(500).send('Error saving user');
        }
        res.redirect('/login'); // Redirect to login after successful registration
      });
    });
  });
});


// Route for displaying the login form
app.get('/login', (req, res) => {
  const error = req.query.error || ''; // Get error message from query string if present
  res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f6f9;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        .container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            padding: 30px;
            width: 100%;
            max-width: 350px;
        }

        h2 {
            text-align: center;
            color: #333;
            margin-bottom: 20px;
            font-size: 22px;
        }

        label {
            font-size: 14px;
            margin-bottom: 8px;
            color: #555;
        }

        input[type="text"], input[type="password"] {
            width: 100%;
            padding: 10px;
            margin-top: 8px;
            border: 2px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
            transition: border 0.3s ease;
        }

        input[type="text"]:focus, input[type="password"]:focus {
            border-color: #6c8c9c;
            outline: none;
        }

        button {
            width: 100%;
            padding: 10px;
            background-color: #488286;
            color: white;
            font-size: 14px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 20px;
            transition: background-color 0.3s ease;
        }

        button:hover {
            background-color: #3a6a6a;
        }

        .error {
            color: red;
            font-size: 14px;
            text-align: center;
            margin-top: 20px;
        }

        p {
            text-align: center;
            margin-top: 20px;
        }

        p a {
            color: #488286;
            text-decoration: none;
            font-weight: bold;
        }

        p a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Log In</h2>
        <form action="/login" method="POST" autocomplete="off">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" placeholder="Enter your username" required autocomplete="off">

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" placeholder="Enter your password" required autocomplete="off">

            <button type="submit">Log In</button>
        </form>

        <p>Don't have an account? <a href="/register">Register here</a>.</p>
        <p><a href="/update-password">Forgot Password?</a></p>
        <p><a href="/delete-account">Delete Account</a></p>
    </div>
</body>
</html>

  `);
});

// Route to display the delete account page
app.get('/delete-account', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'delete.html'));
});

// Route to handle account deletion
app.post('/delete-account', (req, res) => {
  const { username } = req.body;

  // Check if the user exists in the database
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).send('Error querying database');
    }
    if (!user) {
      // If the user is not found, redirect back to delete.html with an error in the query string
      return res.redirect('/delete.html?error=Username%20not%20found');
    }

    // If user exists, proceed to delete the account
    db.run('DELETE FROM users WHERE username = ?', [username], function (err) {
      if (err) {
        return res.status(500).send('Error deleting account');
      }
      // After successful deletion, redirect to login or home page
      res.redirect('/login');
    });
  });
});


app.get('/update-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'update-password.html'));
});

// Handle Update Password POST request
app.post('/update-password', (req, res) => {
  const { username, newPassword } = req.body;

  // Check if the user exists in the database
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).send('Error querying the database');
    }
    if (!user) {
      return res.status(400).send('<p class="error">User not found</p><a href="/update-password">Try again</a>');
    }

    // Hash the new password
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).send('Error hashing password');
      }

      // Update the password in the database
      db.run('UPDATE users SET password_hash = ? WHERE username = ?', [hashedPassword, username], function (err) {
        if (err) {
          return res.status(500).send('Error updating password');
        }
        res.send('<p class="success">Password updated successfully! <a href="/login">Log in</a></p>');
      });
    });
  });
});

// Handle login submission
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the user exists in the database
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).send('Error querying database');
    }
    if (!user) {
      return res.redirect('/login?error=Invalid username or password');
    }

    // Compare the hashed password
    bcrypt.compare(password, user.password_hash, (err, result) => {
      if (result) {
        // Save the user ID and username in the session and redirect to a protected route
        req.session.userId = user.id;
        req.session.username = user.username; // Store the username in the session
        res.redirect('/weather');
      } else {
        res.redirect('/login?error=Invalid username or password');
      }
    });
  });
});


// Protected route for weather
app.get('/weather', checkAuthenticated, (req, res) => {
  // Render the weather page with the username
  res.render('weather', { username: req.session.username });
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login'); // Redirect to login after logging out
  });
});



// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
