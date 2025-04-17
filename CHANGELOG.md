# Changelog

## [Unreleased] - 2025-04-18

### Added
- Added fullscreen toggle button to the image modal.
- Added mouse wheel zoom functionality (centered on cursor) to images within the modal.
- Added support for processing and displaying Discord CDN attachment URLs (`cdn.discordapp.com/attachments/...`).
  - Modified `controller.php` to pass valid Discord attachment URLs to the frontend instead of marking them as errors.
  - Modified `js/main.js` to detect Discord URLs, determine media type (image/video) based on file extension, and display them using the full original URL.
- Added a loading indicator overlay that displays while fetching Imgur data.
  - Added HTML structure for the loader in `api/index.php`.
  - Added CSS styles for the loader and its animation in `css/style.css`.
  - Modified `js/main.js` to show the loader before the AJAX request and hide it upon completion (success or error).
- Added double-click zoom functionality to the image modal.
- Implemented conditional video autoplay on desktop (screen width >= 1920px): Videos now only load and attempt to autoplay when they scroll into the viewport, using IntersectionObserver. Videos are paused when scrolled out of view.
- Implemented client-side caching using `localStorage` to store results for submitted URL sets for 1 hour, reducing redundant processing.

### Fixed
- Added more detailed console logging to the IntersectionObserver callback for video autoplay to help diagnose issues.
- Re-enabled logic to attempt resuming video playback if a paused video scrolls back into view on desktop.
- Prevent videos from attempting to autoplay sequentially on mobile devices after submitting multiple links by removing the `autoplay` attribute.
- Clicking modal background while in fullscreen now exits fullscreen instead of closing the modal entirely.
- Prevent page scroll when scrolling anywhere inside the open image modal.
- Image modal now closes when clicking the background area (outside the image and control buttons).
- Fixed Discord media downloads: Uses the `fetch` method for images (which works) and the direct link method (`<a download>`) workaround for videos (which were blocked via `fetch`).
- Improved error logging for download failures to provide more details in the browser console, aiding diagnosis of issues (e.g., Discord video downloads).
- Fixed download functionality for Discord attachments (and other URLs with query parameters) by correctly extracting the filename.
- Corrected the logic populating the main results textarea (`#result`) to display non-Imgur URLs (Discord) correctly instead of formatting them like Imgur links.
- Corrected a JavaScript error where a non-existent function (`addMediaToContainer`) was called, preventing the loader from being hidden after the AJAX request completed.
- Prevent image modal from closing via background click when in fullscreen mode.

### Changed
- Changed the loading indicator from a spinner to an indeterminate progress bar animating from left to right.
- Updated the loading indicator to show a simulated percentage increase (0-99%) next to the "Loading..." text and reflect this percentage in the progress bar width.
- Adjusted the speed of the simulated progress percentage increase to better align with typical request durations (aiming for ~6 seconds instead of ~3 seconds).
- Refactored media display logic in `js/main.js` to better handle different URL sources (Imgur, Discord).
- Removed `checkUrlStatus` call for Discord URLs in `controller.php` as it's not necessary.
- Updated image modal HTML structure and CSS for fullscreen and zoom features.
- Refactored image modal JavaScript logic to handle zoom, fullscreen, and state resets.
- Simplified initial view mode selection: Defaults to Grid View if screen width >= 1024px, otherwise Column View (no longer checks first item type).
- Lowered screen width threshold to 1024px for auto-selecting Grid View as default when the first result is an image.
- Updated initial view mode heuristic to consider screen width (default to Grid View for images only if screen width >= 1024px).
- Prevent zooming out smaller than the initial fitted size in the image modal.
- Image modal zoom now centers on the image middle if the cursor is outside the image bounds during scroll; otherwise, centers on the cursor.

### Removed
- Removed console logging statements previously added for debugging video autoplay.
- Removed all code related to processing Twitter/X status URLs.
- Removed the old loading indicator. 