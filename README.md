# Delivery Tracker Frontend

This is the frontend application for the Delivery Tracker, built with React.

## Technologies

- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Cloudflare Pages](https://pages.cloudflare.com/) - Hosting platform
- [React Scripts](https://create-react-app.dev/) - Build tooling

## Features

- View active and completed deliveries
- Update delivery status (picked up, delivered, settled)
- Send SMS to recipients
- Open navigation to delivery addresses
- Mobile-friendly interface

## Project Structure

```
public/         # Static assets
src/
├── App.tsx     # Main application component
├── App.css     # Application styles
└── index.tsx   # Entry point
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

Build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

### Testing

Run tests:

```bash
npm test
```

### Deployment

Deploy to Cloudflare Pages:

```bash
npm run deploy
```

## API Integration

The frontend communicates with the backend API through the following endpoints:

- `GET /api/deliveries` - Fetch all deliveries
- `POST /api/deliveries/:id/status` - Update delivery status

## License

This project is proprietary and confidential.
