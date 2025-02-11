<?php
header('Content-Type: application/json'); // Set content type to JSON

// Check if the session has already been started
if (session_status() === PHP_SESSION_NONE) {
    session_start(); // Start the session if it hasn't been started
}

function fetchImgurAlbumImages($albumId)
{
    $clientId = '5dc6065411ee2ab'; // Use your actual Imgur Client-ID
    $url = "https://api.imgur.com/3/album/$albumId";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array("Authorization: Client-ID $clientId"));

    // Ignore SSL for localhost
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    $response = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE); // Get the status code
    curl_close($ch);

    if ($statusCode != 200) {
        return array(); // Return empty array if the request fails
    }

    $responseArray = json_decode($response, true);

    // if (isset($responseArray['data']['images']) && is_array($responseArray['data']['images'])) {
    //     $images = array_map(function ($image) {
    //         return "https://imgur.com/" . $image['id'];
    //     }, $responseArray['data']['images']);
    //     return $images;
    // }

    // detect image or video
    if (isset($responseArray['data']['images']) && is_array($responseArray['data']['images'])) {
        $mediaUrls = array_map(function ($image) {
            $mediaUrl = "https://i.imgur.com/" . $image['id'];
            // Append the correct file extension based on type
            if (strpos($image['type'], 'video') !== false) {
                // If it's a video
                $mediaUrl .= ".mp4"; // You might need to adjust based on available formats
            } else {
                // If it's an image
                $mediaUrl .= "." . explode('/', $image['type'])[1];
            }
            return $mediaUrl;
        }, $responseArray['data']['images']);
        return $mediaUrls;
    }

    return array();
}

function checkUrlStatus($url)
{
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false); // Don't follow redirects to get accurate status code

    // Ignore SSL for localhost
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return $statusCode;
}

function transformImgurUrls($inputUrls)
{
    // Split input by new lines and process each URL
    // $urls = explode("\n", $inputUrls);

    // Split input by any whitespace (spaces, tabs, or line breaks) and process each URL
    // preg_split() with a regular expression ('/\s+/'): This splits the input string by any sequence of whitespace characters, including spaces, tabs, and newlines.
    // PREG_SPLIT_NO_EMPTY flag: Ensures that empty elements are not included in the resulting array 
    // (i.e., it removes empty elements if there are extra spaces or line breaks).
    // The -1 ensures that the entire input string is split by whitespace, without limiting the number of splits.
    $urls = preg_split('/\s+/', $inputUrls, -1, PREG_SPLIT_NO_EMPTY);
    $transformedUrls = array();
    $errorUrls = array();

    // Regular expression to match the first pattern (e.g., https://i.imgur.com/abc.mp4)
    $pattern1 = '/^https?:\/\/i\.imgur\.com\/([a-zA-Z0-9]+)\.(mp4|gifv)$/';

    // Regular expression to match the second pattern (e.g., https://imgur.com/abc)
    $pattern2 = '/^https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/';

    // Regular expression to match the album pattern (e.g., https://imgur.com/a/abc)
    $pattern3 = '/^https?:\/\/imgur\.com\/a\/(?:[a-zA-Z0-9-]+-)?([a-zA-Z0-9]+)$/';

    // Regular expression to match the gallery pattern (e.g., https://imgur.com/gallery/abc)
    $pattern4 = '/^https?:\/\/imgur\.com\/gallery\/(?:[a-zA-Z0-9-]+-)?([a-zA-Z0-9]+)$/';

    foreach ($urls as $url) {
        $url = trim($url); // Trim whitespace

        // Skip empty strings
        if (empty($url)) {
            continue;
        }

        // Extract the code after the last hyphen or slash
        // explode: This function splits a string into an array using a specified delimiter.
        // [
        //     "https:",
        //     "",
        //     "imgur.com",
        //     "neo-haerin-pwUecWV"
        //   ]
        // end: This function moves the internal pointer of an array to its last element and returns the value of that element.
        $urlParts = explode('/', $url);
        $lastPart = end($urlParts); // $lastPart is neo-haerin-pwUecWV:

        // Check if the last part contains a hyphen
        if (strpos($lastPart, '-') !== false) {
            // Extract the code after the last hyphen
            // strrchr($lastPart, '-') returns -pwUecWV
            // substr('-pwUecWV', 1) returns pwUecWV
            // substr(..., 1) removes the hyphen from the beginning of this substring, 
            // leaving you with only the part of the string after the last hyphen.
            $lastPart = substr(strrchr($lastPart, '-'), 1);
        }

        // Construct the adjusted URL
        // preg_replace Function: This function performs a regular expression search and replace. It searches for a pattern in a string and replaces it with a specified replacement.
        // Pattern: /\/[^\/]+$/
        // \/: Matches a literal forward slash /.
        // [^\/]+: Matches one or more characters that are not a forward slash /. The ^ inside square brackets [] indicates a negation, so [^\/] matches any character except /.
        // $: Indicates the end of the string. This ensures that the pattern matches the last segment of the URL after the final /.
        // Replacement: '' (an empty string). This means the matched pattern will be removed from the string.
        // Purpose: This line removes the last segment from the URL. For example, 
        // if $url is https://imgur.com/neo-haerin-pwUecWV, the result stored in $baseUrl will be https://imgur.com.
        $baseUrl = preg_replace('/\/[^\/]+$/', '', $url); // Remove the last segment
        $adjustedUrl = $baseUrl . '/' . $lastPart;

        // Check if the adjusted URL matches the first pattern or second pattern
        if (preg_match($pattern1, $adjustedUrl, $matches) || preg_match($pattern2, $adjustedUrl, $matches)) {
            // Check if the transformed URL is valid
            $statusCode = checkUrlStatus($adjustedUrl);
            if ($statusCode == 200) {
                $transformedUrls[] = "https://imgur.com/" . $matches[1];
            } else {
                $errorUrls[] = $url; // Add to error list if 403 or 404
                continue;
            }
        }
        // Check if the adjusted URL matches the album pattern or gallery pattern
        elseif (preg_match($pattern3, $adjustedUrl, $matches)) {
            // Check if the transformed URL is valid
            $statusCode = checkUrlStatus($adjustedUrl);
            if ($statusCode == 200) {
                $albumId = $matches[1];
                // Fetch album images using Imgur API
                $albumImages = fetchImgurAlbumImages($albumId);
                if ($albumImages) {
                    $transformedUrls = array_merge($transformedUrls, $albumImages);
                } else {
                    $errorUrls[] = $url;
                }
            } else {
                $errorUrls[] = $url;
            }
        } else {
            $errorUrls[] = $url; // Add non-matching URLs to error list
        }

        // Else, skip the URL if it doesn't match the pattern
    }

    // Join transformed URLs back into a string
    return [
        'transformedUrls' => $transformedUrls, // Array of URLs
        'errorUrls' => $errorUrls // Array of URLs
    ];
}

// Handle AJAX request
// Handle AJAX request
if (isset($_POST['imgurUrls'])) {
    $inputUrls = $_POST['imgurUrls'];
    $result = transformImgurUrls($inputUrls);
    echo json_encode($result);
}




// Handle requests based on the type
// if (isset($_GET['imgurUrls']) && isset($_GET['id'])) {
//     // AJAX request to transform URLs
//     $inputUrls = $_GET['imgurUrls'];
//     $result = transformImgurUrls($inputUrls);

//     // Store the original input URLs and the transformed result in session
//     $_SESSION['urls'][$_GET['id']] = [
//         'inputUrls' => $inputUrls,
//         'result' => $result // Save the result using the ID as the key
//     ];

//     echo json_encode($result); // Send the result back
// } elseif (isset($_GET['id'])) {
//     // Request to retrieve the result based on the ID
//     $id = $_GET['id'];

//     if (isset($_SESSION['urls'][$id])) {
//         // Retrieve the original input URLs
//         $inputUrls = $_SESSION['urls'][$id]['inputUrls'];
//         // Transform the URLs again to ensure they are up-to-date
//         $result = transformImgurUrls($inputUrls);
//         // Return the transformed result
//         echo json_encode([
//             'inputUrls' => $inputUrls,
//             'transformedUrls' => $result
//         ]);
//     } else {
//         // Handle case where ID does not exist
//         echo json_encode(['error' => 'No results found for the provided ID']);
//     }
// } else {
//     // Handle missing parameter case
//     echo json_encode(['error' => 'Missing imgurUrls or ID parameter']);
// }
