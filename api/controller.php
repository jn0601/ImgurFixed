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

    // Imgur Patterns
    $pattern1 = '/^https?:\/\/i\.imgur\.com\/([a-zA-Z0-9]+)\.(mp4|gifv)$/';
    $pattern2 = '/^https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/';
    $pattern3 = '/^https?:\/\/imgur\.com\/a\/(?:[a-zA-Z0-9-]+-)?([a-zA-Z0-9]+)$/';
    $pattern4 = '/^https?:\/\/imgur\.com\/gallery\/(?:[a-zA-Z0-9-]+-)?([a-zA-Z0-9]+)$/';
    // Discord Pattern
    $discordPattern = '/^https?:\/\/cdn\.discordapp\.com\/attachments\//';

    foreach ($urls as $url) {
        $url = trim($url);
        if (empty($url)) continue;

        $adjustedUrl = $url; // Use original URL for non-imgur patterns initially

        // --- Imgur Handling --- 
        // Specific logic to adjust Imgur URLs might still be needed here if applicable
        if (strpos($url, 'imgur.com') !== false) {
           // Apply original Imgur adjustment logic if necessary
           // (Simplified here, assuming previous logic was sufficient)
           // Extract the code after the last hyphen or slash
           $urlParts = explode('/', $url);
           $lastPart = end($urlParts);
           if (strpos($lastPart, '-') !== false) {
              $lastPart = substr(strrchr($lastPart, '-'), 1);
           }
           $baseUrl = preg_replace('/\/[^\/]+$/', '', $url);
           $adjustedUrl = $baseUrl . '/' . $lastPart;
        }

        // Check Imgur patterns (using adjusted URL)
        if (preg_match($pattern1, $adjustedUrl, $matches) || preg_match($pattern2, $adjustedUrl, $matches)) {
             $statusCode = checkUrlStatus($adjustedUrl);
             if ($statusCode == 200) {
                // Assuming the goal is to get the i.imgur direct link
                // Need logic here to determine if it's image or video and construct i.imgur link
                // This part needs refinement based on desired output for pattern2 matches
                // For now, let's just pass the base imgur.com link
                $transformedUrls[] = "https://imgur.com/" . $matches[1]; 
             } else {
                 $errorUrls[] = $url;
             }
        }
        elseif (preg_match($pattern3, $adjustedUrl, $matches) || preg_match($pattern4, $adjustedUrl, $matches)) {
             $statusCode = checkUrlStatus($adjustedUrl);
             if ($statusCode == 200) {
                 $albumId = $matches[1];
                 $albumImages = fetchImgurAlbumImages($albumId);
                 if (!empty($albumImages)) {
                     $transformedUrls = array_merge($transformedUrls, $albumImages);
                 } else {
                     $errorUrls[] = $url; // Add original album URL if fetch fails or empty
                 }
             } else {
                 $errorUrls[] = $url;
             }
        }
        // Check Discord pattern (using original URL, no status check)
        elseif (preg_match($discordPattern, $url)) {
            // Pass Discord attachment URLs directly without status check
            $transformedUrls[] = $url;
        }
        // Other URLs
        else {
            $errorUrls[] = $url; // Add non-matching URLs to error list
        }
    }

    return [
        'transformedUrls' => array_unique($transformedUrls), // Ensure unique URLs
        'errorUrls' => $errorUrls
    ];
}

// Handle AJAX request
if (isset($_POST['imgurUrls'])) {
    $inputUrls = $_POST['imgurUrls'];
    $result = transformImgurUrls($inputUrls);
    echo json_encode($result);
}
