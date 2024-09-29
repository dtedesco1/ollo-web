# OllO Web - Short-Form Audio Platform

## Overview

OllO Web is the browser-based interface for OllO, an innovative short-form audio application. Built with Next.js and Firebase, this web version complements the main OllO mobile app, providing users with a seamless experience to interact with OllO's content on desktop and mobile web browsers.

## Features

- Browse and listen to short audio clips
- User authentication and profile viewing
- Discover trending and popular audio content
- Web-optimized playback of OllO's short-form audio
- Responsive design for various screen sizes

## Prerequisites

- Node.js (version 14 or later recommended)
- npm or yarn
- Firebase account and project set up

## Setup

1. Clone the repository:

   ```
   git clone https://github.com/your-username/ollo-web.git
   cd ollo-web
   ```

2. Install dependencies:

   ```
   npm install
   ```

   or

   ```
   yarn install
   ```

3. Set up Firebase:
   - Create a `firebase-cred.json` file in the root directory with your Firebase service account credentials.
   - Ensure the `firebase-cred.json` is added to `.gitignore` to keep your credentials secure.

4. Run the development server:

   ```
   npm run dev
   ```

   or

   ```
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the OllO Web application.

## Project Structure

- `/src`: Source code for the web application
- `/public`: Static files and assets
- `/src/components`: Reusable React components
- `/src/pages`: Next.js pages and API routes
- `/src/utils`: Utility functions, including Firebase admin setup

## Deployment

OllO Web can be deployed on Vercel or any other platform that supports Next.js applications. Ensure that you set up the necessary environment variables for Firebase integration.

## Security Note

Be cautious with the `firebase-cred.json` file and any other sensitive credentials. Never commit them to version control. Use environment variables for production deployments.

## Contributing

We welcome contributions to OllO Web! If you have ideas for improving the web experience or new features specific to the browser version, please feel free to submit a Pull Request or open an Issue.

## License

TODO

## Related Projects

For the full OllO experience, check out our mobile applications:

- [OllO iOS App](https://apps.apple.com/us/app/ollo)
- [OllO Android App](https://play.google.com/store/apps/details?id=com.ollo)
