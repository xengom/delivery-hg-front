# PWA Implementation for 행복한 꽃배달 (Happy Flower Delivery)

This project has been configured as a Progressive Web App (PWA) to provide a better user experience, including offline functionality and the ability to install the app on devices.

## Features Added

1. **Web App Manifest**: Configured with app name, icons, colors, and display settings
2. **Service Worker**: Implemented for offline caching and improved performance
3. **PWA Meta Tags**: Added for better integration with mobile devices
4. **iOS Support**: Added Apple-specific meta tags for iOS devices

## Required Manual Steps

Before building the application, you need to create the following icon files:

- `public/logo192.png` - 192x192 pixel PNG image
- `public/logo512.png` - 512x512 pixel PNG image

These icons should represent the app with a flower delivery theme.

## Testing PWA Functionality

To test the PWA functionality:

1. Build the application:
   ```
   npm run build
   ```

2. Serve the build directory using a static server:
   ```
   npx serve -s build
   ```

3. Open the application in Chrome and check PWA features:
   - Open Chrome DevTools
   - Go to the "Application" tab
   - Check "Manifest" and "Service Workers" sections
   - Verify that the service worker is registered and active

4. Test offline functionality:
   - Load the application
   - Disconnect from the internet
   - Refresh the page - it should still work

5. Test installation:
   - Look for the install prompt in Chrome's address bar
   - Or go to Chrome menu > "Install 행복한 꽃배달"

## Production Deployment

For production deployment, ensure:

1. The application is served over HTTPS
2. All icon files are properly created and included
3. The service worker is properly registered

## Troubleshooting

If the PWA features are not working:

1. Check browser console for errors
2. Verify that the service worker is registered
3. Clear browser cache and reload
4. Ensure all required files are present in the build directory