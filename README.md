# Museboard

Museboard is a modern social media application built with React, TypeScript, and Appwrite. It provides a platform for users to share their thoughts, images, and connect with others.

## Features

- **Authentication**: Secure user sign-up and sign-in.
- **Create & Share Posts**: Users can create posts with images and captions.
- **Explore Feed**: Discover posts from other users.
- **Like & Save Posts**: Engage with content by liking and saving posts for later.
- **User Profiles**: View user profiles with their posts.
- **Top Creators**: See a list of popular creators.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Appwrite (for authentication, database, and storage)
- **UI Components**: Shadcn UI

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Abhi-developer01/Museboard.git
    cd Museboard
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

3.  **Set up Appwrite:**
    - Create an Appwrite project.
    - Set up the required collections (users, posts, saves).
    - Get your Appwrite project ID, database ID, and collection IDs.

4.  **Configure environment variables:**
    - Create a `.env` file in the root of the project.
    - Add your Appwrite configuration details to the `.env` file:
      ```
      VITE_APPWRITE_PROJECT_ID=your_project_id
      VITE_APPWRITE_DATABASE_ID=your_database_id
      VITE_APPWRITE_STORAGE_ID=your_storage_id
      VITE_APPWRITE_USER_COLLECTION_ID=your_user_collection_id
      VITE_APPWRITE_POST_COLLECTION_ID=your_post_collection_id
      VITE_APPWRITE_SAVES_COLLECTION_ID=your_saves_collection_id
      ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    or
    ```bash
    yarn dev
    ```

The application will be available at `http://localhost:5173`.
