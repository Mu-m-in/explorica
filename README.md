# Explorica 🏡

### Discover places. Find your next stay.

**Explorica** is a full-stack property listing and booking/renting web application where users can explore properties across different destinations, view listing details, and interact with a property marketplace through a server-rendered web interface.

🌐 **Live Demo:** [explorica.onrender.com](https://explorica.onrender.com) 

---

## ✨ Features

- **Property Discovery** — Browse available property listings with images, pricing, locations, and details.
- **Property Management** — Create, view, edit, and delete listings through the application's listing workflows.
- **User Authentication** — Register and log in using Passport.js with a local authentication strategy.
- **Reviews** — Add and manage property reviews through the review system.
- **Image Uploads** — Upload and display property images using Cloudinary.
- **Database Persistence** — Store application data using MongoDB and Mongoose.
- **Session Management** — Maintain user sessions with Express Session and MongoDB-backed session storage.
- **Input Validation** — Validate listing and review data using Joi and application middleware.
- **Responsive Interface** — Render dynamic pages using EJS templates, reusable layouts, Bootstrap, and custom CSS.
- **Cloud Deployment** — Run the application publicly through Render with configuration supplied through environment variables.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Backend | Node.js, Express.js |
| Frontend | EJS, EJS-Mate, Bootstrap, CSS, JavaScript |
| Database | MongoDB Atlas, Mongoose |
| Authentication | Passport.js, Passport Local, Passport Local Mongoose |
| Sessions | Express Session, Connect Mongo |
| Image Storage | Cloudinary, Multer, Multer Storage Cloudinary |
| Validation | Joi |
| Middleware | Method Override, Connect Flash |
| Deployment | Render |
| Version Control | Git, GitHub |

## 🏗️ Project Structure

```text
explorica/
├── controller/       # Application controllers
├── init/             # Initialization and seed data
├── models/           # Mongoose data models
├── public/           # Static assets, CSS and JavaScript
├── routes/           # Listing, review and user routes
├── utils/            # Shared utility functions
├── views/            # EJS templates and page layouts
├── app.js            # Express application entry point
├── cloudConfig.js    # Cloudinary configuration
├── middleware.js     # Custom middleware
├── schema.js         # Request validation schemas
├── package.json      # Dependencies and npm scripts
└── README.md
```

## 🚀 Getting Started

Follow these steps to run Explorica locally.

### Prerequisites

Make sure you have:

- [Node.js](https://nodejs.org/) — version 24.7.0, matching the project's configured engine
- npm
- A [MongoDB Atlas](https://www.mongodb.com/atlas) database or compatible MongoDB instance
- A [Cloudinary](https://cloudinary.com/) account for image uploads

### 1. Clone the repository

```bash
git clone https://github.com/Mu-m-in/explorica.git
cd explorica
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
ATLASDB_URL=your_mongodb_connection_uri
SECRET=your_session_secret

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

NODE_ENV=development
```

Replace the example values with your own credentials.

**Security:** Never commit your `.env` file, database credentials, session secret, or Cloudinary API secret to GitHub. Keep `.env` in `.gitignore`.

### 4. Start the application

```bash
npm start
```

Open the local URL configured by the application in your browser. The default port is `3000`, unless overridden by the `PORT` environment variable.

## ☁️ Deployment

Explorica is deployed on Render.

**Live application:** [https://explorica.onrender.com](https://explorica.onrender.com)

To deploy your own instance:

1. Fork or clone the GitHub repository.
2. Create a new **Web Service** on [Render](https://render.com/).
3. Connect your GitHub repository and select the `main` branch.
4. Configure the build command as `npm install`.
5. Configure the start command as `npm start`.
6. Add the required environment variables through Render's Environment settings.
7. Configure MongoDB Atlas network access so the deployed service can connect.
8. Deploy the application and inspect the logs for startup or database errors.

Render can automatically deploy new commits when automatic deployment is enabled.

## 🔐 Security and Configuration

- Store credentials in environment variables rather than source code.
- Use HTTPS for the deployed application.
- Keep session secrets private and use secure cookie settings in production.
- Restrict database access to trusted connections where possible.
- Validate incoming user input before saving data.
- Keep dependencies updated and review security advisories regularly.

## 🧪 Testing

Before considering a deployment ready, verify:

- The listings page loads successfully.
- Registration, login, and logout work correctly.
- Listings and reviews persist in MongoDB.
- Listing creation, editing, and deletion behave as expected.
- Image uploads work through Cloudinary.
- Session state remains consistent across requests.
- Invalid input and unauthorized actions are handled correctly.

## 🗺️ Future Improvements

Potential enhancements for Explorica include:

- Advanced property search and filtering.
- Interactive maps and location-based discovery.
- Pagination and sorting.
- Improved property galleries.
- Booking availability and reservation workflows.
- Automated tests and continuous integration.
- More detailed property amenities and pricing information.

These are potential enhancements, not claims that they are already implemented.

## 👨‍💻 Author

**Mumin Tariq**

- GitHub: [@Mu-m-in](https://github.com/Mu-m-in)
- LinkedIn: [Mumin Tariq](https://www.linkedin.com/in/mumintariq)


---

<p align="center">
  <strong>Explorica — Explore places. Discover possibilities.</strong>
</p>
